import { 
  testConnection, 
  syncCollaboratorsBatch, 
  syncJobPositionsBatch, 
  authenticateUser, 
  initTables,
  saveEvaluation,
  getEvaluationsByCollaborator,
  savePdi,
  getPdiByCollaborator
} from '../db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST: Acciones de Base de Datos
  if (req.method === 'POST') {
    try {
      const { action } = req.body || {};
      
      if (action === 'sync-census') {
        const result = await syncCollaboratorsBatch(req.body.collaborators);
        return res.status(200).json(result);
      }
      
      if (action === 'sync-positions') {
        const result = await syncJobPositionsBatch(req.body.positions);
        return res.status(200).json(result);
      }

      if (action === 'login') {
        const result = await authenticateUser(req.body.username, req.body.password);
        return res.status(200).json(result);
      }

      if (action === 'init') {
        const result = await initTables();
        return res.status(200).json(result);
      }

      if (action === 'save-evaluation') {
        const result = await saveEvaluation(req.body.evaluation);
        return res.status(200).json(result);
      }

      if (action === 'save-pdi') {
        const result = await savePdi(req.body.pdi);
        return res.status(200).json(result);
      }

      return res.status(400).json({ success: false, message: `Acción desconocida: ${action}` });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET: Estado y Diagnóstico de Base de Datos
  try {
    const status = await testConnection();
    return res.status(200).json({
      pong: true,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'unknown',
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      ...status
    });
  } catch (err: any) {
    return res.status(200).json({
      pong: true,
      timestamp: new Date().toISOString(),
      connected: false,
      provider: 'none',
      totalCollaborators: 0,
      totalEvaluations: 0,
      message: `Error al probar conexión: ${err.message}`
    });
  }
}
