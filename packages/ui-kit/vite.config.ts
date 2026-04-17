import { createLogger, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

/** vite-plugin-dts 在 vue SFC 上会报 TS2742（pnpm 物理路径）；rollup 后对外 d.ts 已可移植，此处过滤该条日志避免误当作构建失败。 */
function createUiKitLogger() {
  const base = createLogger('info', { allowClearScreen: false });
  return {
    ...base,
    error(msg: unknown, options?: unknown) {
      const text =
        typeof msg === 'string'
          ? msg
          : msg instanceof Error
            ? msg.message
            : msg && typeof msg === 'object' && 'message' in msg
              ? String((msg as { message: unknown }).message)
              : String(msg);
      if (text.includes('TS2742')) return;
      (base.error as (m: unknown, o?: unknown) => void)(msg, options);
    },
  };
}

export default defineConfig({
  customLogger: createUiKitLogger(),
  plugins: [
    vue(),
    vueJsx(),
    dts({
      /**
       * 保留 `PGridProps` / `ColumnProps<D>` 等与 Ant、e-virt-table 的强类型继承时，vue-tsc 对 `.vue` 单文件 emit 仍可能打印 TS2742（pnpm 下的物理路径），属已知噪音；
       * 随后 api-extractor 会把声明 rollup 进 `dist/index.d.ts`，并 bundled 下列包，避免对外 d.ts 引用 `.pnpm/...`。
       */
      rollupTypes: true,
      insertTypesEntry: true,
      bundledPackages: [
        'ant-design-vue',
        'vue-types',
        'scroll-into-view-if-needed',
        'e-virt-table',
      ],
    }),
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
    /** Vite 8+ 内置 tsconfig paths，替代 vite-tsconfig-paths */
    tsconfigPaths: true,
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      fileName: (format) => `${format}/index.js`,
      formats: ['es', 'cjs'],
    },
    rolldownOptions: {
      external: ['vue', 'ant-design-vue', '@ant-design/icons-vue'],
      output: {
        /** 与 default + named 混出并存时消除 Rolldown MIXED_EXPORTS 提示 */
        exports: 'named',
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
