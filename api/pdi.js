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
async function savePdi(pdiData) {
  const p = getDbPool();
  if (!p) return { success: false, message: "Base de datos no conectada" };
  const client = await p.connect();
  try {
    await client.query(
      `INSERT INTO pdi_records (
        id, collaborator_id, mentor_name, mentor_role, goals, breaches, signatures, status, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE SET
        mentor_name = EXCLUDED.mentor_name,
        mentor_role = EXCLUDED.mentor_role,
        goals = EXCLUDED.goals,
        breaches = EXCLUDED.breaches,
        signatures = EXCLUDED.signatures,
        status = EXCLUDED.status,
        updated_at = NOW()`,
      [
        pdiData.id,
        pdiData.collaboratorId,
        pdiData.mentorName || "",
        pdiData.mentorRole || "",
        JSON.stringify(pdiData.goals || []),
        JSON.stringify(pdiData.breaches || []),
        JSON.stringify(pdiData.signatures || {}),
        pdiData.status || "En Ejecuci\xF3n"
      ]
    );
    return { success: true, message: "PDI guardado con \xE9xito en la base de datos." };
  } catch (err) {
    console.error("[PostgreSQL] Error al guardar PDI:", err.message);
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// src/server/handlers/pdi.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const result = await savePdi(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
export {
  handler as default
};
