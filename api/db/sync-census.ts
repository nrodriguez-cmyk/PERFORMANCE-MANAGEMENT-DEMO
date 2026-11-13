import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../_lib/cors';
import { syncCollaboratorsBatch } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { collaborators } = payload;

    if (!Array.isArray(collaborators) || collaborators.length === 0) {
      return res.status(400).json({ success: false, message: 'Se requiere una lista de colaboradores' });
    }

    const result = await syncCollaboratorsBatch(collaborators);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
