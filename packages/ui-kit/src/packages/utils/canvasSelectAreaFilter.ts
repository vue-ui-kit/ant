/**
 * 将 --evt-select-area-color 同步为 SVG 滤镜，用于 HTML overlayer。
 *
 * 目标（对齐 Canvas 观感、避免底色叠两次）：
 * - Canvas 已在格子上铺了一层选区半透明色
 * - HTML 层背景保持透明，让 Canvas 那一层透上来（底色只盖一次）
 * - 滤镜只作用在「有内容的像素」（文字 / tag），模拟 area 色叠在内容上：
 *   out = color * α + src * (1-α)，且 α_out = α_src（透明底不动）
 */

export const EVT_SELECT_AREA_FILTER_ID = 'evt-select-area-overlay-filter';
const SVG_HOST_ID = 'evt-select-area-overlay-svg';
const FLOOD_ID = 'evt-select-area-flood';
const ARITH_ID = 'evt-select-area-arith';

export type ParsedCssColor = { r: number; g: number; b: number; a: number };

/** 解析 getComputedStyle 常见颜色格式（rgb/rgba/hex） */
export function parseCssColor(input: string): ParsedCssColor | null {
  const value = (input || '').trim();
  if (!value) return null;

  const rgba = value.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+%?))?\s*\)$/i,
  );
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] === undefined ? 1 : parseAlpha(rgba[4]),
    };
  }

  // modern: rgb(r g b / a)
  const rgbaSpace = value.match(
    /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i,
  );
  if (rgbaSpace) {
    return {
      r: Number(rgbaSpace[1]),
      g: Number(rgbaSpace[2]),
      b: Number(rgbaSpace[3]),
      a: rgbaSpace[4] === undefined ? 1 : parseAlpha(rgbaSpace[4]),
    };
  }

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const hasAlpha = h.length === 8;
    const n = parseInt(hasAlpha ? h.slice(0, 6) : h, 16);
    return {
      r: (n >> 16) & 255,
      g: (n >> 8) & 255,
      b: n & 255,
      a: hasAlpha ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }

  return null;
}

function parseAlpha(raw: string): number {
  if (raw.endsWith('%')) {
    return Math.min(1, Math.max(0, Number(raw.slice(0, -1)) / 100));
  }
  return Math.min(1, Math.max(0, Number(raw)));
}

function buildFilterGraph(filter: SVGFilterElement) {
  while (filter.firstChild) {
    filter.removeChild(filter.firstChild);
  }

  // 1) 不透明选区色（α 交给后面 arithmetic）
  const flood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
  flood.setAttribute('id', FLOOD_ID);
  flood.setAttribute('flood-color', 'rgb(82, 146, 247)');
  flood.setAttribute('flood-opacity', '1');
  flood.setAttribute('result', 'flood');

  // 2) 只用 SourceGraphic 的 alpha 裁切 → 透明底不进滤镜
  const clip = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
  clip.setAttribute('in', 'flood');
  clip.setAttribute('in2', 'SourceGraphic');
  clip.setAttribute('operator', 'in');
  clip.setAttribute('result', 'floodInContent');

  // 3) out = floodInContent * α + SourceGraphic * (1-α)
  const arith = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
  arith.setAttribute('id', ARITH_ID);
  arith.setAttribute('in', 'floodInContent');
  arith.setAttribute('in2', 'SourceGraphic');
  arith.setAttribute('operator', 'arithmetic');
  arith.setAttribute('k1', '0');
  arith.setAttribute('k2', '0.1');
  arith.setAttribute('k3', '0.9');
  arith.setAttribute('k4', '0');

  filter.appendChild(flood);
  filter.appendChild(clip);
  filter.appendChild(arith);
}

function ensureSvgHost(): SVGSVGElement {
  let host = document.getElementById(SVG_HOST_ID) as unknown as SVGSVGElement | null;
  if (!host) {
    host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    host.setAttribute('id', SVG_HOST_ID);
    host.setAttribute('width', '0');
    host.setAttribute('height', '0');
    host.setAttribute('aria-hidden', 'true');
    host.setAttribute('data-evt-select-filter', 'content-tint-v1');
    Object.assign(host.style, {
      position: 'absolute',
      width: '0',
      height: '0',
      overflow: 'hidden',
      pointerEvents: 'none',
    });

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', EVT_SELECT_AREA_FILTER_ID);
    filter.setAttribute('x', '0');
    filter.setAttribute('y', '0');
    filter.setAttribute('width', '100%');
    filter.setAttribute('height', '100%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    buildFilterGraph(filter);
    defs.appendChild(filter);
    host.appendChild(defs);
    document.body.appendChild(host);
    return host;
  }

  // 旧版是 flood+over 整格叠色，升级为 content-tint
  if (host.getAttribute('data-evt-select-filter') !== 'content-tint-v1') {
    const filter = document.getElementById(
      EVT_SELECT_AREA_FILTER_ID,
    ) as unknown as SVGFilterElement | null;
    if (filter) {
      buildFilterGraph(filter);
      host.setAttribute('data-evt-select-filter', 'content-tint-v1');
    }
  }
  return host;
}

/**
 * 读取生效的 --evt-select-area-color，写入共享 SVG 滤镜。
 * 只对有 alpha 的内容像素叠色，不改透明背景。
 */
export function syncSelectAreaSvgFilter(
  el: HTMLElement = document.documentElement,
): ParsedCssColor | null {
  ensureSvgHost();
  const raw =
    getComputedStyle(el).getPropertyValue('--evt-select-area-color').trim() ||
    'rgba(82, 146, 247, 0.1)';
  const parsed = parseCssColor(raw);
  if (!parsed) return null;

  const flood = document.getElementById(FLOOD_ID);
  const arith = document.getElementById(ARITH_ID);
  if (!flood || !arith) return parsed;

  const a = parsed.a;
  flood.setAttribute('flood-color', `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`);
  flood.setAttribute('flood-opacity', '1');
  arith.setAttribute('k2', String(a));
  arith.setAttribute('k3', String(1 - a));
  return parsed;
}
