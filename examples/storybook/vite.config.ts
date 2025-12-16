import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  plugins: [tsconfigPaths(), vue(), vueJsx(), vueDevTools({ launchEditor: 'cursor' })],
  server: {
    host: true,
    port: 3018,
  },
});
