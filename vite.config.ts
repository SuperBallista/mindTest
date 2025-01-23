import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // `mode`를 기반으로 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [sveltekit()],
    envDir: '.', // ✅ `.env` 파일이 프로젝트 루트에 있는 경우 유지
    define: {
      'import.meta.env': JSON.stringify(env) // ✅ Vite 방식으로 환경 변수 주입
    },
    optimizeDeps: {
      esbuildOptions: {
        supported: { 'dynamic-import': true },
        loader: { '.js': 'jsx' }
      }
    },
    css: {
      postcss: './postcss.config.js',
    },
    resolve: {
      alias: {
        $lib: '/src/lib',
      },
    },
  };
});
