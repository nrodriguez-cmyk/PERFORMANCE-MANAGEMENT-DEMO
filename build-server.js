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
const mappings = [
  { entry: 'src/server/handlers/status.ts', out: 'api/db/status.js' },
  { entry: 'src/server/handlers/init.ts', out: 'api/db/init.js' },
  { entry: 'src/server/handlers/syncCensus.ts', out: 'api/db/sync-census.js' },
  { entry: 'src/server/handlers/syncPositions.ts', out: 'api/db/sync-positions.js' },
  { entry: 'src/server/handlers/evaluations.ts', out: 'api/db/evaluations/index.js' },
  { entry: 'src/server/handlers/evaluations.ts', out: 'api/db/evaluations/[collaboratorId].js' },
  { entry: 'src/server/handlers/pdi.ts', out: 'api/db/pdi/index.js' },
  { entry: 'src/server/handlers/pdi.ts', out: 'api/db/pdi/[collaboratorId].js' },
  { entry: 'src/server/handlers/login.ts', out: 'api/auth/login.js' },
  { entry: 'src/server/handlers/ping.ts', out: 'api/ping.js' },
  { entry: 'src/server/apiApp.ts', out: 'api/index.js' }
];

for (const m of mappings) {
  esbuild.buildSync({
    entryPoints: [m.entry],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    packages: 'external',
    outfile: m.out
  });
}

console.log('⚡ Todos los endpoints serverless y bundles de Node compilados con éxito!');
