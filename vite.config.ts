import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [sveltekit()],

    server: {
      mimeTypes: {
        'application/javascript': ['js', 'mjs'], // ✅ MIME 오류 해결
      },
      watch: {
        usePolling: true, // ✅ 파일 변경 감지 문제 해결
      },
    },

    resolve: {
      alias: {
        $lib: '/src/lib',
      },
    },

    define: {
      // ✅ `import.meta.env`를 Vite 기본 방식으로 유지
      'process.env': env,
    },

    optimizeDeps: {
      include: ['formidable', 'child_process', 'fs', 'path'],
      exclude: ['svelte'],
      esbuildOptions: {
        supported: { 'dynamic-import': true },
        loader: { '.js': 'jsx' }, // ✅ JSX 지원 (필요하지 않다면 제거 가능)
      },
    },

    build: {
      target: 'esnext', // ✅ 최신 ES 모듈 지원
      commonjsOptions: {
        transformMixedEsModules: true, // ✅ CJS/ESM 변환 지원
      },
    },

    css: {
      postcss: './postcss.config.js',
    },
  };
});
