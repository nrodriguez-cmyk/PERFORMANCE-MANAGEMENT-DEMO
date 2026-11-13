import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../_lib/cors';
import { testConnection } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const status = await testConnection();
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({ connected: false, message: err.message });
  }
}
