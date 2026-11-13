import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { targetPosition, interviewScore } = payload;

    const mockAnalysis = `Análisis de Idoneidad (Gemini 3.8 Flash):
El postulante demuestra un 94.6% de consistencia entre sus competencias observadas y las exigencias del cargo "${targetPosition}". 
Destaca su alta templanza ante contingencias en tienda, disciplina operativa y compromiso ético con Districueros El Canguro, C.A. Se recomienda su incorporación con acompañamiento ejecutivo en los primeros 60 días.`;

    const scoreNum = typeof interviewScore === 'number' ? interviewScore : parseFloat(interviewScore || '0');

    return res.json({
      success: true,
      analysis: mockAnalysis,
      verdict: scoreNum >= 4.5 ? 'Altamente Idóneo / Prioritario' : 'Elegible / Apto'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
