import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  // vite-plugin-vue-devtools 在 Vite 8 下会在 configureServer 阶段崩溃（rpc 为 undefined）。
  // 先禁用以保证 dev server 可用；需要 devtools 时再等上游适配后开启。
  plugins: [tsconfigPaths(), vue(), vueJsx()],
  server: {
    host: true,
    port: 3018,
  },
});
