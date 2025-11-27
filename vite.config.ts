import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // ⚠️ REPLACE THIS STRING WITH YOUR ACTUAL GEMINI API KEY ⚠️
    'process.env.API_KEY': JSON.stringify("INSERT_YOUR_GEMINI_API_KEY_HERE"),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
});