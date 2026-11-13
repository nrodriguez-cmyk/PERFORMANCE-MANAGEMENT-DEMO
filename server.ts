import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import apiApp from './src/server/apiApp';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    apiApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Defensa en profundidad: nunca servir artefactos de build/fuente del servidor.
    apiApp.use((req, res, next) => {
      if (/\.(map|cjs|ts)$/i.test(req.path)) return res.status(404).end();
      next();
    });
    apiApp.use(express.static(distPath));
    apiApp.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  apiApp.listen(PORT, "0.0.0.0", () => {
    console.log(`[Universo Canguro] Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
