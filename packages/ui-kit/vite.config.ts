import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [tsconfigPaths(), vue(), vueJsx(), dts()],
  build: {
    outDir: 'dist',
    lib: {
      entry: ['src/index.ts', 'src/packages/styles/index.scss'], // 组件库的入口文件
      fileName: (format) => `${format}/index.js`, // 构建输出的文件名
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      input: ['src/index.ts', 'src/packages/styles/index.scss'],
      external: ['vue', 'ant-design-vue', '@ant-design/icons-vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
