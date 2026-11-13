import { syncJobPositionsBatch } from '../db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { positions } = req.body || {};
    if (!Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ success: false, message: 'Se requiere una lista de cargos' });
    }
    const result = await syncJobPositionsBatch(positions);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
