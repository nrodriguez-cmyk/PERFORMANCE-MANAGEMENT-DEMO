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

// 2. Build api/index.js para Vercel Serverless (raíz /api)
esbuild.buildSync({
  entryPoints: ['src/server/apiApp.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  packages: 'external',
  outfile: 'api/index.js'
});

// 3. Build api/[...all].js para Vercel Serverless catch-all (/api/*)
esbuild.buildSync({
  entryPoints: ['src/server/apiApp.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  packages: 'external',
  outfile: 'api/[...all].js'
});

console.log('⚡ Todos los bundles de servidor y serverless creados con éxito!');
