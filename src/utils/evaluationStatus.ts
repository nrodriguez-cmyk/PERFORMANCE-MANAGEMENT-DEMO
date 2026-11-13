// Gestión del Estado Global y Cronograma de las Evaluaciones (Fecha y Hora de Apertura / Cierre)

export interface GlobalEvaluationStatus {
  isOpen: boolean;
  message: string;
  startDate?: string; // Formato YYYY-MM-DDTHH:mm
  endDate?: string;   // Formato YYYY-MM-DDTHH:mm
  isManualOverride?: boolean; // true si el administrador forzó el cierre o apertura manual
  updatedAt: string;
  updatedBy?: string;
}

const STORAGE_KEY = 'canguro_evaluations_global_status';

export function formatScheduleDateTime(dateStr?: string): string {
  if (!dateStr) return 'No definida';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calcula si la fecha actual se encuentra dentro de la ventana de apertura programada
 */
export function evaluateScheduleOpenness(status: Partial<GlobalEvaluationStatus>): {
  isOpen: boolean;
  stateType: 'scheduled' | 'active' | 'expired' | 'manual_closed' | 'manual_open';
  message: string;
} {
  const now = Date.now();

  // Si hay override manual activo
  if (status.isManualOverride) {
    if (status.isOpen) {
      return {
        isOpen: true,
        stateType: 'manual_open',
        message: 'Evaluaciones habilitadas manualmente por la Dirección de Talento Humano.'
      };
    } else {
      return {
        isOpen: false,
        stateType: 'manual_closed',
        message: 'Evaluaciones cerradas manualmente por la Dirección de Talento Humano. No se admiten nuevos ingresos.'
      };
    }
  }

  // Si tiene cronograma configurado con fecha de inicio y fin
  if (status.startDate && status.endDate) {
    const startTime = new Date(status.startDate).getTime();
    const endTime = new Date(status.endDate).getTime();

    if (!isNaN(startTime) && !isNaN(endTime)) {
      if (now < startTime) {
        return {
          isOpen: false,
          stateType: 'scheduled',
          message: `El período oficial de evaluaciones iniciará el ${formatScheduleDateTime(status.startDate)}. Por favor espere a la fecha y hora de apertura.`
        };
      } else if (now > endTime) {
        return {
          isOpen: false,
          stateType: 'expired',
          message: `El período oficial de evaluaciones finalizó el ${formatScheduleDateTime(status.endDate)}. Las evaluaciones están cerradas automáticamente.`
        };
      } else {
        return {
          isOpen: true,
          stateType: 'active',
          message: `Período oficial de evaluaciones activo hasta el ${formatScheduleDateTime(status.endDate)}.`
        };
      }
    }
  }

  // Fallback si no hay fechas definidas
  return {
    isOpen: status.isOpen ?? true,
    stateType: status.isOpen === false ? 'manual_closed' : 'manual_open',
    message: status.message || (status.isOpen === false ? 'Evaluaciones cerradas.' : 'Período oficial activo.')
  };
}

export function getGlobalEvaluationStatus(): GlobalEvaluationStatus {
  // Fechas por defecto: ventana de 15 días a partir de hoy
  const defaultStart = new Date();
  defaultStart.setHours(8, 0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultEnd.getDate() + 15);
  defaultEnd.setHours(18, 0, 0, 0);

  const formatIsoForInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const defaultStatus: GlobalEvaluationStatus = {
    isOpen: true,
    startDate: formatIsoForInput(defaultStart),
    endDate: formatIsoForInput(defaultEnd),
    isManualOverride: false,
    message: 'Período oficial de evaluaciones activo.',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Dirección de Talento Humano'
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultStatus;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: GlobalEvaluationStatus = JSON.parse(raw);
      // Validar dinámicamente si la fecha tope ya se alcanzó
      const evaluated = evaluateScheduleOpenness(parsed);
      parsed.isOpen = evaluated.isOpen;
      parsed.message = evaluated.message;
      return parsed;
    }
  } catch (e) {
    console.error('Error reading evaluation status', e);
  }

  return defaultStatus;
}

/**
 * Guarda o actualiza la programación por Fecha/Hora de Inicio y Fin
 */
export function setEvaluationSchedule(
  startDate: string,
  endDate: string,
  updatedBy?: string
): GlobalEvaluationStatus {
  const evaluated = evaluateScheduleOpenness({
    startDate,
    endDate,
    isManualOverride: false
  });

  const status: GlobalEvaluationStatus = {
    isOpen: evaluated.isOpen,
    startDate,
    endDate,
    isManualOverride: false,
    message: evaluated.message,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || 'Administrador Maestro'
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
      window.dispatchEvent(new CustomEvent('canguro_eval_status_change', { detail: status }));
    }
  } catch (e) {
    console.error('Error saving evaluation schedule', e);
  }

  return status;
}

/**
 * Forzar apertura o cierre manual inmediato
 */
export function setGlobalEvaluationStatus(
  isOpen: boolean,
  updatedBy?: string,
  customMessage?: string
): GlobalEvaluationStatus {
  const current = getGlobalEvaluationStatus();

  const status: GlobalEvaluationStatus = {
    ...current,
    isOpen,
    isManualOverride: true,
    message: customMessage || (isOpen 
      ? 'Período oficial de evaluaciones habilitado manualmente.' 
      : 'El período de evaluaciones ha sido cerrado manualmente por la Dirección de Talento Humano. No se admiten nuevos ingresos.'),
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || 'Administrador Maestro'
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
      window.dispatchEvent(new CustomEvent('canguro_eval_status_change', { detail: status }));
    }
  } catch (e) {
    console.error('Error saving evaluation status', e);
  }

  return status;
}
