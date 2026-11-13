import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { handleCors } from './_lib/cors';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { descriptor, position } = payload;

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

    const aiClient = getAiClient();
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
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
