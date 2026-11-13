import { testConnection } from '../db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const status = await testConnection();
    return res.status(200).json(status);
  } catch (err: any) {
    return res.status(500).json({ connected: false, message: err.message });
  }
}
