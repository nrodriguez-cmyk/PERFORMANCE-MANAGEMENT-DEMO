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
async function saveEvaluation(evalData) {
  const p = getDbPool();
  if (!p) {
    return { success: false, message: "Base de datos no conectada" };
  }
  const client = await p.connect();
  try {
    await client.query(
      `INSERT INTO evaluations (
        id, collaborator_id, evaluator_name, evaluator_position, evaluator_role,
        evaluation_type, period, scores, checked_behaviors, open_answers, comments,
        final_score, final_percent, is_locked, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (id) DO UPDATE SET
        evaluator_name = EXCLUDED.evaluator_name,
        evaluator_position = EXCLUDED.evaluator_position,
        evaluator_role = EXCLUDED.evaluator_role,
        evaluation_type = EXCLUDED.evaluation_type,
        period = EXCLUDED.period,
        scores = EXCLUDED.scores,
        checked_behaviors = EXCLUDED.checked_behaviors,
        open_answers = EXCLUDED.open_answers,
        comments = EXCLUDED.comments,
        final_score = EXCLUDED.final_score,
        final_percent = EXCLUDED.final_percent,
        is_locked = EXCLUDED.is_locked,
        updated_at = NOW()`,
      [
        evalData.id,
        evalData.collaboratorId,
        evalData.evaluatorName || "",
        evalData.evaluatorPosition || "",
        evalData.evaluatorRole,
        evalData.evaluationType || "standard",
        evalData.period || "2026-Q1",
        JSON.stringify(evalData.scores || {}),
        JSON.stringify(evalData.checkedBehaviors || {}),
        JSON.stringify(evalData.openAnswers || {}),
        evalData.comments || "",
        evalData.finalScore || 0,
        evalData.finalPercent || 0,
        evalData.isLocked || false
      ]
    );
    return { success: true, message: "Evaluaci\xF3n guardada con \xE9xito en la base de datos." };
  } catch (err) {
    console.error("[PostgreSQL] Error al guardar evaluaci\xF3n:", err.message);
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// src/server/handlers/evaluations.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const result = await saveEvaluation(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
export {
  handler as default
};
