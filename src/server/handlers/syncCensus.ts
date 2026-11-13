import { syncCollaboratorsBatch } from '../db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { collaborators } = req.body || {};
    if (!Array.isArray(collaborators) || collaborators.length === 0) {
      return res.status(400).json({ success: false, message: 'Se requiere una lista de colaboradores' });
    }
    const result = await syncCollaboratorsBatch(collaborators);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
