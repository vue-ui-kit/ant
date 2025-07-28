import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [tsconfigPaths(), vue(), vueJsx()],
  server: {
    host: true,
    port: 3018,
  },
});
