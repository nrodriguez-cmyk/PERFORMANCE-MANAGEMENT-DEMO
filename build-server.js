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

// 2. Build Serverless Functions exactas para Vercel
const serverlessEndpoints = [
  'api/index.js',
  'api/ping.js',
  'api/db/status.js',
  'api/db/init.js',
  'api/db/sync-census.js',
  'api/db/sync-positions.js',
  'api/db/evaluations/index.js',
  'api/db/evaluations/[collaboratorId].js',
  'api/db/pdi/index.js',
  'api/db/pdi/[collaboratorId].js',
  'api/auth/login.js',
  'api/send-email.js',
  'api/generate-situational.js',
  'api/evaluate-promotion.js',
  'api/[...all].js'
];

for (const outfile of serverlessEndpoints) {
  esbuild.buildSync({
    entryPoints: ['src/server/apiApp.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    packages: 'external',
    outfile
  });
}

console.log('⚡ Todos los endpoints serverless y bundles de Node compilados con éxito!');
