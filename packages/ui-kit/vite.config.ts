import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';
import { copyFileSync, mkdirSync } from 'node:fs';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

export default defineConfig({
  plugins: [
    tsconfigPaths(), 
    vue(), 
    vueJsx(), 
    dts(),
    // 自定义插件来复制scss文件到dist
    {
      name: 'copy-scss-to-dist',
      writeBundle() {
        try {
          // 复制scss文件到dist根目录
          copyFileSync('src/packages/styles/index.scss', 'dist/style.scss');
          copyFileSync('src/packages/styles/variables.scss', 'dist/variables.scss');
        } catch (err) {
          console.warn('Failed to copy scss files:', err);
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': pathResolve('src/packages') + '/',
      '#': pathResolve('src/declarations') + '/',
    },
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: {
        index: 'src/index.ts',
        style: 'src/packages/styles/index.scss'
      },
      fileName: (format, entryName) => {
        if (entryName === 'style') {
          // 这里不返回文件名，让vite自动处理
          return `${format}/index.js`;
        }
        return `${format}/index.js`;
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'ant-design-vue', '@ant-design/icons-vue'],
      input: {
        index: 'src/index.ts',
        style: 'src/packages/styles/index.scss'
      },
      output: {
        globals: {
          vue: 'Vue',
        },
        assetFileNames: (assetInfo) => {
          // 确保CSS文件输出为style.css
          if (assetInfo.name && assetInfo.name.includes('style')) {
            return 'style.css';
          }
          return assetInfo.name!;
        },
      },
    },
  },
});
