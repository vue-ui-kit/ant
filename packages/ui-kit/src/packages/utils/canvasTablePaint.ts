import type EVirtTable from 'e-virt-table';

const patchedPaints = new WeakSet<object>();

/**
 * e-virt-table offsets rectangle paths by half a pixel for crisp strokes.
 * A transparent stroke still leaves the fill edge anti-aliased, which creates
 * visible seams when the canvas background differs from the cell background.
 */
export function patchCanvasTransparentFillSeams(table: EVirtTable): void {
  const paint = table.ctx.paint;
  if (patchedPaints.has(paint)) {
    return;
  }

  const drawRect = paint.drawRect.bind(paint);
  paint.drawRect = (x, y, width, height, options = {}) => {
    const { borderColor, fillColor, radius = 0 } = options;
    if (borderColor === 'transparent' && fillColor !== undefined && radius === 0) {
      const context = paint.getCtx();
      context.save();
      context.fillStyle = fillColor;
      context.fillRect(x, y, width, height);
      context.restore();
      return;
    }

    drawRect(x, y, width, height, options);
  };

  patchedPaints.add(paint);
}
