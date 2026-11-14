// src/server/db.ts
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL_NON_POOLING;
}
var pool = null;
function getDbPool() {
  if (pool) return pool;
  const dbUrl = getDatabaseUrl();
  if (dbUrl) {
    try {
      pool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes("localhost") ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 3e4,
        connectionTimeoutMillis: 5e3
      });
      pool.on("error", (err) => {
        console.error("[PostgreSQL] Error inesperado en el pool de conexiones:", err.message);
      });
      console.log("[PostgreSQL] Pool de conexi\xF3n inicializado con \xE9xito.");
      return pool;
    } catch (err) {
      console.warn("[PostgreSQL] Error al crear pool de conexi\xF3n:", err.message);
      return null;
    }
  }
  return null;
}
async function syncJobPositionsBatch(positions) {
  const p = getDbPool();
  if (!p) {
    return { success: false, count: 0, message: "Base de datos PostgreSQL no conectada" };
  }
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    let count = 0;
    for (const pos of positions) {
      await client.query(
        `INSERT INTO job_positions (id, name, management_level, directorate, code, description, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           management_level = EXCLUDED.management_level,
           directorate = EXCLUDED.directorate,
           code = EXCLUDED.code,
           description = EXCLUDED.description,
           updated_at = NOW()`,
        [pos.id, pos.name, pos.managementLevel, pos.directorate, pos.code || null, pos.description || null]
      );
      count++;
    }
    await client.query("COMMIT");
    return { success: true, count, message: `Se sincronizaron exitosamente ${count} cargos en PostgreSQL` };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[PostgreSQL] Error al sincronizar cargos:", err.message);
    return { success: false, count: 0, message: err.message };
  } finally {
    client.release();
  }
}

// src/server/handlers/syncPositions.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const { positions } = req.body || {};
    if (!Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ success: false, message: "Se requiere una lista de cargos" });
    }
    const result = await syncJobPositionsBatch(positions);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
export {
  handler as default
};
