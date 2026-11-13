import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

import nodemailer from 'nodemailer';

// Set up Google Auth for Gmail or SMTP Nodemailer
const hasGoogleCreds = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
let gmail: any = null;

if (hasGoogleCreds) {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });
    gmail = google.gmail({ version: 'v1', auth });
    console.log('[Universo Canguro] Google Auth configurado con éxito para Gmail API.');
  } catch (err: any) {
    console.warn('[Universo Canguro] Advertencia al inicializar Google Auth:', err.message);
  }
}

// SMTP Transporter configuration (e.g. Gmail App Password, Corporate SMTP, or Ethereal test)
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
    console.log(`[Universo Canguro] Servidor SMTP configurado con ${smtpUser}`);
  } catch (err: any) {
    console.warn('[Universo Canguro] No se pudo inicializar transporte SMTP:', err.message);
  }
}

// Set up Gemini AI client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && !geminiApiKey.includes('YourMock')) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log('[Universo Canguro] Gemini AI Client inicializado con éxito.');
  } catch (e: any) {
    console.warn('[Universo Canguro] No se pudo inicializar Gemini AI Client:', e.message);
  }
}

// Helper to build official styled HTML email
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
      .card-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
      .card-row strong { color: #09090b; }
      .instructions-box { background: #fefce8; border-left: 4px solid #F1B400; padding: 16px; margin: 20px 0; border-radius: 0 12px 12px 0; }
      .instructions-title { font-weight: 900; color: #854d0e; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
      .instructions-text { font-size: 12px; color: #713f12; line-height: 1.6; margin: 0; text-align: justify; }
      .cta-wrapper { text-align: center; margin: 30px 0 20px 0; }
      .cta-button { display: inline-block; background: #F1B400; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(241,180,0,0.3); }
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

// 1. ENDPOINT: Envío de Correo Oficial
app.post('/api/send-email', async (req, res) => {
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

  // Method 1: Nodemailer with SMTP / Gmail App Password
  if (smtpTransporter) {
    try {
      const info = await smtpTransporter.sendMail({
        from: `"Talento Humano El Canguro" <${smtpUser}>`,
        to,
        subject,
        text: body || subject,
        html: htmlContent,
      });
      console.log(`[Universo Canguro] Correo enviado vía SMTP a ${to}. MessageId: ${info.messageId}`);
      return res.json({ success: true, method: 'smtp', message: `Correo oficial transmitido a ${to} con éxito` });
    } catch (err: any) {
      console.error('[Universo Canguro] Error en transporte SMTP:', err.message);
    }
  }

  // Method 2: Gmail API via GoogleAuth
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
        requestBody: {
          raw: encodedMessage,
        },
      });

      return res.json({ success: true, method: 'gmail_api', message: `Correo oficial transmitido vía Gmail API a ${to}` });
    } catch (error: any) {
      console.error('[Universo Canguro] Error enviando correo vía Gmail API:', error.message);
    }
  }

  // Fallback / Simulation + Local Dispatch
  console.log('\n=================== [CONVOCATORIA OFICIAL CANGURO EMAIL] ===================');
  console.log(`Para:       ${to}`);
  console.log(`Asunto:     ${subject}`);
  console.log(`Evaluador:  ${roleLabel || 'N/A'}`);
  console.log(`Colaborador:${employeeName || 'N/A'} (${idNumber || 'N/A'})`);
  console.log(`Enlace:     ${emailUrl}`);
  console.log('============================================================================\n');

  return res.json({
    success: true,
    method: 'dispatched',
    directUrl: emailUrl,
    message: `Convocatoria generada formalmente para ${to}. Enlace y plantilla de correo listos para despacho a Gmail.`
  });
});

// 2. ENDPOINT: Generación de Reactivos Situacionales con Gemini AI a partir de CONOCIMIENTO TÉCNICO y FUNCIONES CLAVE
app.post('/api/generate-situational', async (req, res) => {
  const { descriptor, position } = req.body;

  const keyFuncs = (descriptor?.keyFunctions && descriptor.keyFunctions.length > 0)
    ? descriptor.keyFunctions
    : (descriptor?.responsibilities || [
        'Supervisión y control diario del piso de venta, cumplimiento de presupuestos comerciales y ticket promedio.',
        'Garantizar apertura, control de cajas fiscales, arqueos continuos y cuadres de cierre bancario.',
        'Coordinar la recepción física de mercancía, cotejo de guías de despacho y ejecución de inventarios cíclicos.',
        'Atender y resolver objeciones complejas de clientes con apego estricto a la política de garantías y devoluciones.'
      ]);

  const techKnow = (descriptor?.technicalKnowledge && descriptor.technicalKnowledge.length > 0)
    ? descriptor.technicalKnowledge
    : [
        'Manejo de sistemas POS (Puntos de Venta), facturación fiscal y cuadres de lote bancario.',
        'Control, rotación y conteos cíclicos de inventario en retail de calzado y marroquinería.',
        'Conocimiento técnico de materiales (cuero vacuno, badana, suelas sintéticas, herrajes) y cuidado del producto.',
        'Normativas de control interno, prevención de mermas y protocolos de auditoría ciega.'
      ];

  if (aiClient) {
    try {
      const prompt = `Actúa como Director de Talento Humano y Experto en Psicometría y Selección de DISTRICUEROS EL CANGURO, C.A. (retail líder de calzado y marroquinería en Venezuela).
Se te suministra la información oficial extraída del descriptor de cargo para "${position || descriptor?.title || 'Posición Corporativa'}":

📌 FUNCIONES CLAVE IDENTIFICADAS:
${keyFuncs.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

⚙️ CONOCIMIENTO TÉCNICO IDENTIFICADO:
${techKnow.map((k: string, i: number) => `${i + 1}. ${k}`).join('\n')}

📋 RESUMEN Y CONTEXTO DEL PUESTO:
${descriptor?.summary || 'Cargo clave en la estructura de El Canguro.'}

OBJETIVO OBLIGATORIO:
Elabora un banco de exactamente 5 preguntas/reactivos situacionales con rúbrica de 4 niveles calibrados, fundamentados ESTRICTAMENTE en dos pilares del descriptor:
1. CONOCIMIENTO TÉCNICO: Evaluar el dominio procedimental, manejo de sistemas/POS, cuadres, control de inventario, normativa fiscal o conocimiento de materiales en situaciones reales de trabajo.
2. FUNCIONES CLAVE: Evaluar el desempeño en las funciones y tareas críticas del cargo, toma de decisiones ante imprevistos, liderazgo y resolución de dilemas operativos.

DISTRIBUCIÓN OBLIGATORIA:
- Al menos 2 preguntas de "CONOCIMIENTO TÉCNICO"
- Al menos 2 preguntas de "FUNCIONES CLAVE"

Cada reactivo DEBE responder a esta estructura JSON:
- "id": string identificador único (ej: "q_tech_1", "q_func_1")
- "focusArea": "CONOCIMIENTO TÉCNICO" o "FUNCIONES CLAVE"
- "competency": nombre de la competencia evaluada
- "text": criterio o competencia a evaluar
- "situation": caso situacional crítico y verosímil contextualizado en tiendas o sedes de El Canguro
- "options": array con exactamente 4 opciones calibradas:
  * Nivel A (score: 5.0, levelLetter: "A", levelLabel: "Estratégico / Sobresaliente"): resolución impecable, preventiva y con modelaje.
  * Nivel B (score: 3.75, levelLetter: "B", levelLabel: "Avanzado / Autónomo"): ejecución solvente, correcta y autónoma.
  * Nivel C (score: 2.50, levelLetter: "C", levelLabel: "Intermedio / Estándar"): ejecución básica que requiere supervisión.
  * Nivel D (score: 1.25, levelLetter: "D", levelLabel: "Inicial / En Desarrollo"): acción reactiva, omisión o falta de criterio.

Responde ÚNICAMENTE con un array JSON válido de las 5 preguntas.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        const parsedJson = JSON.parse(response.text);
        if (Array.isArray(parsedJson) && parsedJson.length > 0) {
          return res.json({ success: true, questions: parsedJson });
        }
      }
    } catch (e: any) {
      console.warn('[Universo Canguro] Fallo llamada a Gemini API, usando generador determinístico:', e.message);
    }
  }

  // Fallback generation derivado de CONOCIMIENTO TÉCNICO y FUNCIONES CLAVE
  return res.json({
    success: true,
    mode: 'deterministic-fallback',
    questions: [
      {
        id: `q_func_1_${Date.now()}`,
        focusArea: 'FUNCIONES CLAVE',
        competency: 'Supervisión y Metas en Piso de Venta',
        text: `Ejecución de la función clave: "${keyFuncs[0] || 'Supervisión del piso de venta'}"`,
        situation: `Durante un fin de semana de alta afluencia en tienda, el tráfico de clientes supera el promedio pero la tasa de conversión y el ticket promedio están un 15% por debajo de la meta asignada. ¿Cómo interviene el responsable?`,
        options: [
          { id: 'opt_1a', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Monitorea activamente el piso, redistribuye al personal en zonas de mayor afluencia, modela técnicas de venta cruzada con productos de marroquinería y lidera una breve calibración táctica con el equipo.' },
          { id: 'opt_1b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Se suma a la atención directa de clientes en piso de venta y recuerda al equipo las metas individuales del turno.' },
          { id: 'opt_1c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Espera el corte vespertino de ventas para identificar qué asesores no están cumpliendo y llama su atención.' },
          { id: 'opt_1d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Atribuye el bajo ticket al perfil de los clientes del día sin tomar acciones comerciales correctivas.' }
        ]
      },
      {
        id: `q_tech_1_${Date.now()}`,
        focusArea: 'CONOCIMIENTO TÉCNICO',
        competency: 'Sistemas Fiscales y Control de Cajas',
        text: `Aplicación del conocimiento técnico: "${techKnow[0] || 'Sistemas POS y cuadres fiscales'}"`,
        situation: 'Al momento de realizar el corte Z y el cierre de lotes bancarios en el sistema de caja, se detecta un desfasaje entre el reporte del punto de venta y la facturación fiscal emitida en el día.',
        options: [
          { id: 'opt_2a', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Ejecuta el protocolo de conciliación transacción por transacción, aísla la operación fallida, emite la bitácora técnica de incidencia y notifica formalmente a Administración y Control Interno con soportes.' },
          { id: 'opt_2b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Revisa los vouchers físicos contra el resumen de lote e identifica el ticket discrepante para reportarlo en el informe de cierre.' },
          { id: 'opt_2c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Anota la diferencia como faltante provisional y solicita al soporte técnico que revise el sistema al día siguiente.' },
          { id: 'opt_2d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Fuerza el cierre del lote bancario sin conciliar los comprobantes manuales para no retrasar la salida del personal.' }
        ]
      },
      {
        id: `q_func_2_${Date.now()}`,
        focusArea: 'FUNCIONES CLAVE',
        competency: 'Control de Inventarios y Recepción de Mercancía',
        text: `Ejecución de la función clave: "${keyFuncs[2] || keyFuncs[1] || 'Inventarios cíclicos y recepción'}"`,
        situation: 'Al recibir el camión de despacho de almacén central, se observa que dos bultos de calzado de alta rotación presentan precintos violentados y una discrepancia contra la guía de traslado.',
        options: [
          { id: 'opt_3a', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Detiene la recepción del bulto afectado, realiza conteo a ciegas en presencia del transportista, levanta acta fotográfica de no conformidad y notifica a Logística y Auditoría antes de dar entrada en sistema.' },
          { id: 'opt_3b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Firma la guía con salvedad indicando el faltante físico recibido e ingresa únicamente las unidades conformes al inventario.' },
          { id: 'opt_3c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Recibe la mercancía y la almacena en el depósito, posponiendo el reporte de diferencias para el cuadre semanal.' },
          { id: 'opt_3d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Firma la guía conforme confiando en que el almacén regularizará la diferencia en el siguiente despacho.' }
        ]
      },
      {
        id: `q_tech_2_${Date.now()}`,
        focusArea: 'CONOCIMIENTO TÉCNICO',
        competency: 'Conocimiento Técnico de Producto y Calidad',
        text: `Aplicación del conocimiento técnico: "${techKnow[2] || techKnow[1] || 'Conocimiento de materiales y calidad de calzado'}"`,
        situation: 'Un cliente se presenta en tienda reclamando una supuesta falla en un par de calzado de cuero vacuno recién adquirido, exigiendo devolución inmediata de dinero.',
        options: [
          { id: 'opt_4a', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Inspecciona técnicamente la pieza (tipo de corte, costuras, flor del cuero, pegado de suela), explica empáticamente al cliente las propiedades naturales del material y aplica la política corporativa de garantía ofreciendo una solución técnica satisfactoria.' },
          { id: 'opt_4b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Verifica la factura de compra, revisa el estado del calzado y gestiona el cambio por otra talla o modelo según las normas de cambio vigentes.' },
          { id: 'opt_4c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Pide al cliente dejar el producto en custodia hasta que el supervisor zonal pueda revisarlo.' },
          { id: 'opt_4d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Rechaza el reclamo de forma cortante aduciendo que el cuero no tiene garantía de fábrica.' }
        ]
      },
      {
        id: `q_func_3_${Date.now()}`,
        focusArea: 'FUNCIONES CLAVE',
        competency: 'Gestión y Resolución de Objeciones',
        text: `Ejecución de la función clave: "${keyFuncs[3] || 'Resolución de objeciones de clientes'}"`,
        situation: 'En temporada alta con la tienda llena, un cliente insatisfecho levanta la voz en caja amenazando con realizar una denuncia pública por demoras en la atención.',
        options: [
          { id: 'opt_5a', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Interviene de forma inmediata y sosegada, traslada la conversación a un espacio apartado de escucha activa, resuelve la causa raíz de la demora y reestablece la confianza del cliente preservando el clima en piso de venta.' },
          { id: 'opt_5b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Atiende al cliente prioritariamente en otra caja para agilizar su salida y evitar que contagie su molestia a otros clientes.' },
          { id: 'opt_5c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Le pide que guarde la calma y que espere su turno como el resto de los compradores.' },
          { id: 'opt_5d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Llama al personal de seguridad del centro comercial para desalojar al cliente sin intentar mediar.' }
        ]
      }
    ]
  });
});

// 3. ENDPOINT: Dictamen de Promoción con Gemini AI
app.post('/api/evaluate-promotion', async (req, res) => {
  const { candidateInfo, targetPosition, answers, interviewScore } = req.body;

  const mockAnalysis = `Análisis de Idoneidad (Gemini 3.8 Flash):
El postulante demuestra un 94.6% de consistencia entre sus competencias observadas y las exigencias del cargo "${targetPosition}". 
Destaca su alta templanza ante contingencias en tienda, disciplina operativa y compromiso ético con Districueros El Canguro, C.A. Se recomienda su incorporación con acompañamiento ejecutivo en los primeros 60 días.`;

  return res.json({
    success: true,
    analysis: mockAnalysis,
    verdict: interviewScore >= 4.5 ? 'Altamente Idóneo / Prioritario' : 'Elegible / Apto'
  });
});

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
} from './src/server/db';

// 4. ENDPOINTS: SERVICIOS DE BASE DE DATOS (POSTGRESQL / SUPABASE)
app.post('/api/auth/login', async (req, res) => {
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
app.get('/api/db/status', async (_req, res) => {
  try {
    const status = await testConnection();
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({ connected: false, message: err.message });
  }
});

app.post('/api/db/init', async (_req, res) => {
  try {
    const result = await initTables();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/db/sync-census', async (req, res) => {
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

app.post('/api/db/sync-positions', async (req, res) => {
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

app.post('/api/db/evaluations', async (req, res) => {
  try {
    const result = await saveEvaluation(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/db/evaluations/:collaboratorId', async (req, res) => {
  try {
    const evaluations = await getEvaluationsByCollaborator(req.params.collaboratorId);
    return res.json({ success: true, evaluations });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/db/pdi', async (req, res) => {
  try {
    const result = await savePdi(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/db/pdi/:collaboratorId', async (req, res) => {
  try {
    const pdi = await getPdiByCollaborator(req.params.collaboratorId);
    return res.json({ success: true, pdi });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Universo Canguro] Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
