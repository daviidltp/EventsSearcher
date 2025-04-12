// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import compressor from "astro-compressor";

import sitemap from "@astrojs/sitemap"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: true,
      minify: true,
    }
  },
  build: {
    inlineStylesheets: 'auto', // Mejor rendimiento
  },
  compressHTML: true,
  base: '',
  integrations: [
    react(),
    compressor(),
	sitemap()
  ],
});