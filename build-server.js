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

// 2. Build Serverless Functions para Vercel (tanto rutas planas como anidadas)
const mappings = [
  // Status
  { entry: 'src/server/handlers/status.ts', out: 'api/status.js' },
  { entry: 'src/server/handlers/status.ts', out: 'api/db/status.js' },
  // Init
  { entry: 'src/server/handlers/init.ts', out: 'api/init.js' },
  { entry: 'src/server/handlers/init.ts', out: 'api/db/init.js' },
  // Sync Census
  { entry: 'src/server/handlers/syncCensus.ts', out: 'api/sync-census.js' },
  { entry: 'src/server/handlers/syncCensus.ts', out: 'api/db/sync-census.js' },
  // Sync Positions
  { entry: 'src/server/handlers/syncPositions.ts', out: 'api/sync-positions.js' },
  { entry: 'src/server/handlers/syncPositions.ts', out: 'api/db/sync-positions.js' },
  // Evaluations
  { entry: 'src/server/handlers/evaluations.ts', out: 'api/evaluations.js' },
  { entry: 'src/server/handlers/evaluations.ts', out: 'api/db/evaluations/index.js' },
  { entry: 'src/server/handlers/evaluations.ts', out: 'api/db/evaluations/[collaboratorId].js' },
  // PDI
  { entry: 'src/server/handlers/pdi.ts', out: 'api/pdi.js' },
  { entry: 'src/server/handlers/pdi.ts', out: 'api/db/pdi/index.js' },
  { entry: 'src/server/handlers/pdi.ts', out: 'api/db/pdi/[collaboratorId].js' },
  // Login
  { entry: 'src/server/handlers/login.ts', out: 'api/login.js' },
  { entry: 'src/server/handlers/login.ts', out: 'api/auth/login.js' },
  // Ping
  { entry: 'src/server/handlers/ping.ts', out: 'api/ping.js' },
  // App completa
  { entry: 'src/server/apiApp.ts', out: 'api/index.js' },
  { entry: 'src/server/apiApp.ts', out: 'api/[...all].js' }
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
