import { defineConfig } from 'vite';

// base 用相对路径，方便放到 GitHub Pages 子路径或任意静态目录
export default defineConfig({
  base: './',
  build: { target: 'es2020' },
});
