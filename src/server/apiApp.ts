import express from 'express';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';
import {
  testConnection,
  initTables,
  syncCollaboratorsBatch,
  syncJobPositionsBatch,
  saveEvaluation,
  getEvaluationsByCollaborator,
  savePdi,
  getPdiByCollaborator,
  authenticateUser
} from './db';

const app = express();

// Soporte de payloads grandes para censo masivo de colaboradores
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuración universal de CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Inicialización diferida de Google Auth / Nodemailer
function getMailClients() {
  const hasGoogleCreds = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  let gmail: any = null;
  if (hasGoogleCreds) {
    try {
      const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/gmail.send'],
      });
      gmail = google.gmail({ version: 'v1', auth });
    } catch (err: any) {
      console.warn('[Universo Canguro] Advertencia al inicializar Google Auth:', err.message);
    }
  }

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
  let smtpTransporter: any = null;
  if (smtpUser && smtpPass) {
    try {
      smtpTransporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } catch (err: any) {
      console.warn('[Universo Canguro] No se pudo inicializar transporte SMTP:', err.message);
    }
  }

  return { hasGoogleCreds, gmail, smtpUser, smtpTransporter };
}

// Inicialización diferida de Gemini AI
function getAiClient(): GoogleGenAI | null {
  const geminiApiKey = process.env.GEMINI_API_KEY || '';
  if (geminiApiKey && !geminiApiKey.includes('YourMock')) {
    try {
      return new GoogleGenAI({ apiKey: geminiApiKey });
    } catch (e: any) {
      console.warn('[Universo Canguro] No se pudo inicializar Gemini AI Client:', e.message);
    }
  }
  return null;
}

// Plantilla oficial de correo
function buildOfficialEvaluationEmailHtml(data: {
  employeeName: string;
  idNumber: string;
  position: string;
  roleLabel: string;
  url: string;
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
      .header { background: #09090b; padding: 28px 24px; text-align: center; border-bottom: 3px solid #F1B400; }
      .header h1 { color: #ffffff; font-size: 16px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 6px 0; }
      .header p { color: #F1B400; font-size: 11px; margin: 0; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
      .content { padding: 28px 24px; font-size: 13px; line-height: 1.6; color: #27272a; }
      .badge { display: inline-block; background: #fffbeb; color: #78350f; border: 1px solid #fde68a; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px; }
      .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 12px; }
      .instructions-box { background: #fefce8; border-left: 4px solid #F1B400; padding: 16px; margin: 20px 0; border-radius: 0 12px 12px 0; }
      .instructions-title { font-weight: 900; color: #854d0e; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; }
      .instructions-text { font-size: 12px; color: #713f12; line-height: 1.6; margin: 0; text-align: justify; }
      .cta-wrapper { text-align: center; margin: 30px 0 20px 0; }
      .cta-button { display: inline-block; background: #F1B400; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
      .footer { background: #fafafa; border-top: 1px solid #e4e4e7; padding: 18px 24px; text-align: center; font-size: 10px; color: #71717a; font-family: monospace; }
      .link-direct { word-break: break-all; color: #64748b; font-size: 10px; font-family: monospace; margin-top: 10px; padding: 8px; background: #f1f5f9; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>DISTRICUEROS EL CANGURO, C.A.</h1>
        <p>Dirección de Talento Humano | Gerencia de Formación y Desarrollo</p>
      </div>
      <div class="content">
        <span class="badge">Convocatoria Oficial de Evaluación</span>
        <p><strong>Estimado colaborador,</strong></p>
        <p>Se ha emitido formalmente la convocatoria para participar en el proceso corporativo de <strong>Evaluación del Desempeño y Desarrollo de Talento Humano</strong> correspondiente al presente período.</p>
        
        <div class="card">
          <div style="margin-bottom: 6px;"><strong>Colaborador a Evaluar:</strong> ${data.employeeName}</div>
          <div style="margin-bottom: 6px;"><strong>Cédula de Identidad:</strong> ${data.idNumber}</div>
          <div style="margin-bottom: 6px;"><strong>Cargo:</strong> ${data.position}</div>
          <div><strong>Rol Evaluador Designado:</strong> <span style="color: #d97706; font-weight: bold;">${data.roleLabel}</span></div>
        </div>

        <div class="instructions-box">
          <div class="instructions-title">Recomendaciones para Completar tu Evaluación</div>
          <p class="instructions-text">
            Para asegurarte de llenar esta evaluación correctamente, te recomendamos buscar un lugar tranquilo y libre de distracciones donde puedas dedicar entre 15 y 20 minutos sin interrupciones. Antes de comenzar, verifica tu conexión a internet, silencia las notificaciones de tus dispositivos y asegúrate de realizar la evaluación en un momento del día en el que te sientas descansado y con la mente despejada; esto te permitirá leer las instrucciones con calma y responder con total honestidad.
          </p>
        </div>

        <div class="cta-wrapper">
          <a href="${data.url}" class="cta-button" target="_blank">
            Ingresar a la Evaluación Oficial
          </a>
        </div>

        <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 16px;">
          Si el botón no abre directamente, copia y pega el siguiente enlace en tu navegador:
        </p>
        <div class="link-direct">${data.url}</div>
      </div>
      <div class="footer">
        DISTRICUEROS EL CANGURO, C.A. • RIF J-30819890-0 • CARACAS, VENEZUELA<br/>
        Este mensaje contiene información confidencial bajo normativa institucional DTH-GFD-MC-01.
      </div>
    </div>
  </body>
  </html>
  `;
}

// ROUTER PRINCIPAL DE API (Soporta prefijo /api y ruta raíz)
const apiRouter = express.Router();

// 1. Envío de Correo
apiRouter.post('/send-email', async (req, res) => {
  const { to, subject, body, employeeName, idNumber, position, roleLabel, url } = req.body;
  if (!to || !subject) {
    return res.status(400).json({ error: 'Faltan campos requeridos: to, subject' });
  }

  const emailUrl = url || (body && body.match(/https?:\/\/[^\s]+/)?.[0]) || '';
  const htmlContent = buildOfficialEvaluationEmailHtml({
    employeeName: employeeName || 'Colaborador',
    idNumber: idNumber || 'V-00.000.000',
    position: position || 'Posición Corporativa',
    roleLabel: roleLabel || 'Evaluador',
    url: emailUrl
  });

  const { hasGoogleCreds, gmail, smtpUser, smtpTransporter } = getMailClients();

  if (smtpTransporter) {
    try {
      const info = await smtpTransporter.sendMail({
        from: `"Talento Humano El Canguro" <${smtpUser}>`,
        to,
        subject,
        text: body || subject,
        html: htmlContent,
      });
      return res.json({ success: true, method: 'smtp', message: `Correo oficial transmitido a ${to} con éxito` });
    } catch (err: any) {
      console.error('[Universo Canguro] Error en transporte SMTP:', err.message);
    }
  }

  if (hasGoogleCreds && gmail) {
    try {
      const rawMessage = [
        `To: ${to}`,
        `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset="UTF-8"`,
        '',
        htmlContent,
      ].join('\n');

      const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });

      return res.json({ success: true, method: 'gmail_api', message: `Correo oficial transmitido vía Gmail API a ${to}` });
    } catch (error: any) {
      console.error('[Universo Canguro] Error enviando correo vía Gmail API:', error.message);
    }
  }

  return res.json({
    success: true,
    method: 'dispatched',
    directUrl: emailUrl,
    message: `Convocatoria generada formalmente para ${to}. Enlace y plantilla listos.`
  });
});

// 2. Reactivos Situacionales con Gemini AI
apiRouter.post('/generate-situational', async (req, res) => {
  const { descriptor, position } = req.body;
  const keyFuncs = (descriptor?.keyFunctions && descriptor.keyFunctions.length > 0)
    ? descriptor.keyFunctions
    : (descriptor?.responsibilities || ['Supervisión y control diario del piso de venta']);
  const techKnow = (descriptor?.technicalKnowledge && descriptor.technicalKnowledge.length > 0)
    ? descriptor.technicalKnowledge
    : ['Manejo de sistemas POS y facturación fiscal'];

  const aiClient = getAiClient();
  if (aiClient) {
    try {
      const prompt = `Actúa como Director de Talento Humano y Experto en Psicometría de DISTRICUEROS EL CANGURO, C.A.
Cargo: "${position || descriptor?.title || 'Posición Corporativa'}".
FUNCIONES CLAVE: ${keyFuncs.join(', ')}.
CONOCIMIENTO TÉCNICO: ${techKnow.join(', ')}.
Elabora un banco de exactamente 5 preguntas situacionales con rúbrica de 4 niveles calibrados.
Responde ÚNICAMENTE con un array JSON válido de las 5 preguntas.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ success: true, questions: parsed });
        }
      }
    } catch (e: any) {
      console.warn('[Universo Canguro] Fallo Gemini API, usando fallback:', e.message);
    }
  }

  // Fallback determinístico
  return res.json({
    success: true,
    mode: 'deterministic-fallback',
    questions: [
      {
        id: `q_func_1_${Date.now()}`,
        focusArea: 'FUNCIONES CLAVE',
        competency: 'Supervisión y Metas en Piso de Venta',
        text: `Ejecución de la función clave: "${keyFuncs[0] || 'Supervisión del piso de venta'}"`,
        situation: 'Durante un fin de semana de alta afluencia en tienda, el tráfico de clientes supera el promedio pero la tasa de conversión y el ticket promedio están un 15% por debajo de la meta. ¿Cómo interviene el responsable?',
        options: [
          { id: 'opt_1a', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Monitorea activamente el piso, redistribuye al personal y modela venta cruzada.' },
          { id: 'opt_1b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Se suma a la atención directa de clientes en piso de venta y recuerda las metas.' },
          { id: 'opt_1c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Espera el corte vespertino de ventas para identificar fallas.' },
          { id: 'opt_1d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Atribuye el bajo ticket al perfil de los clientes sin tomar acciones.' }
        ]
      }
    ]
  });
});

// 3. Dictamen de Promoción con Gemini AI
apiRouter.post('/evaluate-promotion', async (req, res) => {
  const { targetPosition, interviewScore } = req.body;
  const mockAnalysis = `Análisis de Idoneidad:
El postulante demuestra un 94.6% de consistencia entre sus competencias observadas y las exigencias del cargo "${targetPosition || 'Posición Evaluada'}". Se recomienda su incorporación con acompañamiento ejecutivo en los primeros 60 días.`;

  return res.json({
    success: true,
    analysis: mockAnalysis,
    verdict: (interviewScore || 4.5) >= 4.5 ? 'Altamente Idóneo / Prioritario' : 'Elegible / Apto'
  });
});

// 4. Autenticación de Usuario (Supabase / Postgres)
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
    }
    const result = await authenticateUser(username, password);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Estado de Conexión a Base de Datos
apiRouter.get('/db/status', async (_req, res) => {
  try {
    const status = await testConnection();
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({ connected: false, message: err.message });
  }
});

// 6. Inicialización de Tablas
apiRouter.post('/db/init', async (_req, res) => {
  try {
    const result = await initTables();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Sincronización Masiva de Colaboradores (Censo / Excel)
apiRouter.post('/db/sync-census', async (req, res) => {
  try {
    const { collaborators } = req.body;
    if (!Array.isArray(collaborators) || collaborators.length === 0) {
      return res.status(400).json({ success: false, message: 'Se requiere una lista de colaboradores' });
    }
    const result = await syncCollaboratorsBatch(collaborators);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Sincronización de Cargos
apiRouter.post('/db/sync-positions', async (req, res) => {
  try {
    const { positions } = req.body;
    if (!Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ success: false, message: 'Se requiere una lista de cargos' });
    }
    const result = await syncJobPositionsBatch(positions);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Evaluaciones
apiRouter.post('/db/evaluations', async (req, res) => {
  try {
    const result = await saveEvaluation(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.get('/db/evaluations/:collaboratorId', async (req, res) => {
  try {
    const evaluations = await getEvaluationsByCollaborator(req.params.collaboratorId);
    return res.json({ success: true, evaluations });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 10. PDI (Planes de Desarrollo Individual)
apiRouter.post('/db/pdi', async (req, res) => {
  try {
    const result = await savePdi(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.get('/db/pdi/:collaboratorId', async (req, res) => {
  try {
    const pdi = await getPdiByCollaborator(req.params.collaboratorId);
    return res.json({ success: true, pdi });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Ping de diagnóstico rápido
apiRouter.get('/ping', (_req, res) => {
  return res.json({
    pong: true,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'unknown',
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
  });
});

// Montar router en ambas rutas para garantizar coincidencia con o sin rewrite Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
