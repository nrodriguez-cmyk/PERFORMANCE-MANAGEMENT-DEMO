import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../../_lib/cors';
import { getEvaluationsByCollaborator } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { collaboratorId } = req.query;
    const collabId = Array.isArray(collaboratorId) ? collaboratorId[0] : collaboratorId;

    if (!collabId) {
      return res.status(400).json({ success: false, message: 'ID de colaborador requerido' });
    }

    const evaluations = await getEvaluationsByCollaborator(collabId);
    return res.json({ success: true, evaluations });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
