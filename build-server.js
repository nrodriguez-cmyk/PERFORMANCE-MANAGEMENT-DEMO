import * as esbuild from 'esbuild';

// 1. Build server.cjs para ejecución local / Node
esbuild.buildSync({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  sourcemap: true,
  outfile: 'build/server.cjs'
});

// 2. Build Serverless Function universal única para Vercel (1 sola función para evitar exceder límite de 12 funciones en plan gratuito)
esbuild.buildSync({
  entryPoints: ['src/server/apiApp.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  packages: 'external',
  outfile: 'api/index.js'
});

console.log('⚡ Serverless function api/index.js universal compilada con éxito!');
