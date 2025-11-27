import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // ⚠️ REPLACE THIS STRING WITH YOUR ACTUAL GEMINI API KEY ⚠️
    'process.env.API_KEY': JSON.stringify("AIzaSyDz8wfjQl-Jwa0fO7PJ5kKvIUgg8Dwq7_c"),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
});
