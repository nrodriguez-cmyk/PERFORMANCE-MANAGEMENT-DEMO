import { AdminNotification } from '../types';

const STORAGE_KEY = 'canguro_director_permissions';
const EVENT_NAME = 'canguro_director_permission_change';

export interface DirectorPermissionRecord {
  directorate: string;
  directorName: string;
  directorPosition: string;
  directorUsername: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  updatedAt?: string;
  authorizedBy?: string;
}

/**
 * Normaliza el nombre de la dirección para claves de búsqueda consistentes
 */
export function normalizeDirectorateKey(dir: string): string {
  return (dir || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^DIRECCION\s+DE\s+/i, '')
    .replace(/^DIRECCION\s+/i, '')
    .trim();
}

/**
 * Obtiene todas las solicitudes y permisos de directores registrados
 */
export function getAllDirectorPermissions(): Record<string, DirectorPermissionRecord> {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Consulta el estado de permiso de una Dirección
 */
export function getDirectorPermissionStatus(directorate: string): 'none' | 'pending' | 'approved' | 'rejected' {
  const normKey = normalizeDirectorateKey(directorate);
  if (!normKey) return 'none';
  const all = getAllDirectorPermissions();
  return all[normKey]?.status || 'none';
}

/**
 * Solicita permiso formal al Administrador Maestro para ver resultados individuales
 */
export function requestDirectorAccess(director: {
  fullName: string;
  position: string;
  directorate: string;
  username: string;
}): { success: boolean; message: string; notification: AdminNotification } {
  const normKey = normalizeDirectorateKey(director.directorate);
  const now = new Date().toISOString();

  const all = getAllDirectorPermissions();
  all[normKey] = {
    directorate: director.directorate,
    directorName: director.fullName,
    directorPosition: director.position,
    directorUsername: director.username,
    status: 'pending',
    requestedAt: now
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { directorate: director.directorate, status: 'pending' } }));
  } catch (err) {
    console.warn('[DirectorPermission] Error al guardar en localStorage:', err);
  }

  // Notificación oficial para el Administrador
  const notification: AdminNotification = {
    id: `notif-dir-req-${Date.now()}`,
    type: 'director_access_request',
    requestStatus: 'pending',
    date: now,
    timestamp: now,
    read: false,
    title: 'Solicitud de Acceso a Resultados Individuales',
    message: `El ${director.position} (${director.fullName}) ha solicitado autorización para consultar los resultados e informes individuales de todos los colaboradores adscritos a la ${director.directorate}.`,
    directorName: director.fullName,
    directorPosition: director.position,
    directorate: director.directorate,
    employeeId: `dir-${director.username}`
  };

  return {
    success: true,
    message: 'Solicitud enviada exitosamente al Administrador Maestro.',
    notification
  };
}

/**
 * Actualiza la decisión tomada por el Administrador (Aprobar o Rechazar)
 */
export function updateDirectorPermissionStatus(
  directorate: string,
  status: 'approved' | 'rejected',
  adminUsername: string = 'Administrador Maestro'
): void {
  const normKey = normalizeDirectorateKey(directorate);
  if (!normKey) return;

  const all = getAllDirectorPermissions();
  if (all[normKey]) {
    all[normKey].status = status;
    all[normKey].updatedAt = new Date().toISOString();
    all[normKey].authorizedBy = adminUsername;
  } else {
    all[normKey] = {
      directorate,
      directorName: 'Director de Área',
      directorPosition: 'Director',
      directorUsername: '',
      status,
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorizedBy: adminUsername
    };
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { directorate, status } }));
  } catch (err) {
    console.warn('[DirectorPermission] Error al actualizar estado:', err);
  }
}
