import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readyRuntimePlugin } from '../lib/ready-site-build.mjs';
export default defineConfig({ plugins:[readyRuntimePlugin()], root:fileURLToPath(new URL('.',import.meta.url)), base:'./', server:{host:'127.0.0.1',port:5195,strictPort:true}, build:{outDir:'../dist-wizard',emptyOutDir:true} });
