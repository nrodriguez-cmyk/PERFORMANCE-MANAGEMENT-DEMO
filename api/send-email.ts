import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { handleCors } from './_lib/cors';

// Set up Google Auth for Gmail or SMTP Nodemailer
function getGmailClient() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) return null;
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });
    return google.gmail({ version: 'v1', auth });
  } catch (err: any) {
    console.warn('[Universo Canguro] Error al inicializar Google Auth:', err.message);
    return null;
  }
}

function getSmtpTransporter() {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

  if (smtpUser && smtpPass) {
    try {
      return {
        transporter: nodemailer.createTransport({
          service: process.env.SMTP_SERVICE || 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        }),
        smtpUser,
      };
    } catch (err: any) {
      console.warn('[Universo Canguro] Error al inicializar transporte SMTP:', err.message);
    }
  }
  return null;
}

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { to, subject, body, employeeName, idNumber, position, roleLabel, url } = payload;

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
    const smtp = getSmtpTransporter();
    if (smtp) {
      try {
        const info = await smtp.transporter.sendMail({
          from: `"Talento Humano El Canguro" <${smtp.smtpUser}>`,
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
    const gmail = getGmailClient();
    if (gmail) {
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
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
