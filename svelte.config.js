import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter(),
    env: {
      dir: "./",
    },
    alias: {
      $lib: './src/lib'
    }
  }
};
