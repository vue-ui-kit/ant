import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(
  new URL('../src/packages/utils/canvasTablePaint.ts', import.meta.url),
  'utf8',
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`;
const { patchCanvasTransparentFillSeams } = await import(moduleUrl);

test('uses fillRect for transparent square fills and preserves other rectangles', () => {
  const calls = [];
  const context = {
    fillStyle: '',
    save: () => calls.push('save'),
    fillRect: (...args) => calls.push(['fillRect', ...args]),
    restore: () => calls.push('restore'),
  };
  const paint = {
    getCtx: () => context,
    drawRect: (...args) => calls.push(['original', ...args]),
  };
  const table = { ctx: { paint } };

  patchCanvasTransparentFillSeams(table);
  patchCanvasTransparentFillSeams(table);

  paint.drawRect(1, 2, 30, 40, {
    borderColor: 'transparent',
    fillColor: '#f2f3f6',
  });
  paint.drawRect(5, 6, 7, 8, {
    borderColor: '#f00',
    fillColor: '#fff',
  });

  assert.equal(context.fillStyle, '#f2f3f6');
  assert.deepEqual(calls, [
    'save',
    ['fillRect', 1, 2, 30, 40],
    'restore',
    ['original', 5, 6, 7, 8, { borderColor: '#f00', fillColor: '#fff' }],
  ]);
});
