import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const themeSource = await readFile(
  new URL('../src/packages/utils/canvasTableTheme.ts', import.meta.url),
  'utf8',
);
const themeStyles = await readFile(
  new URL('../src/packages/styles/canvas-theme.scss', import.meta.url),
  'utf8',
);

test('delegates evt variable resolution to CSS and e-virt-table', () => {
  assert.doesNotMatch(themeSource, /EVT_OVERRIDE_FROM_CSS|P_TO_EVT_BRIDGE/);
  assert.doesNotMatch(themeSource, /style\.setProperty\(/);
  assert.match(themeStyles, /:root:root\s*\{/);
});
