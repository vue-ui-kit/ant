import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    vue(),
    vueJsx(),
    dts(),
    // 自定义插件来创建完整的scss文件
    {
      name: 'create-standalone-scss',
      writeBundle() {
        try {
          // 读取main scss文件
          const mainScssContent = readFileSync('src/packages/styles/index.scss', 'utf-8');

          // 写入到dist目录
          writeFileSync('dist/style.scss', mainScssContent);

          console.log('✅ Created standalone style.scss');
        } catch (err) {
          console.warn('Failed to create standalone scss file:', err);
        }
      },
    },
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
        style: 'src/packages/styles/index.scss',
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
        style: 'src/packages/styles/index.scss',
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
