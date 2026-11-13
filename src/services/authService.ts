import { CANGURO_COLLABORATORS } from '../data/canguroUniverso';
import { resolveResponsibilityLevel, getManagementLevel, ManagementLevel } from '../utils/responsibilityResolver';

export interface AuthenticatedUser {
  id: string;
  collaboratorId: string;
  username: string; // Cédula de identidad (ej: 12345678) o usuario administrativo
  fullName: string;
  position: string;
  department: string;
  directorate: string;
  managementLevel: ManagementLevel;
  role: 'admin' | 'gestor' | 'director' | 'supervisor' | 'colaborador';
  mustChangePassword?: boolean;
}

const STORAGE_KEY = 'canguro_authenticated_session';
const PASSWORDS_STORAGE_KEY = 'canguro_custom_passwords';

const RESETS_LOG_STORAGE_KEY = 'canguro_password_resets_log';

export interface PasswordResetLogItem {
  id: string;
  username: string;
  fullName: string;
  position: string;
  directorate: string;
  resetAt: string;
  resetBy?: string;
}

/**
 * Obtiene el historial de reinicios de contraseña
 */
export function getPasswordResetLogs(): PasswordResetLogItem[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(RESETS_LOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Reinicia la contraseña de un usuario individual para que ingrese desde cero con su cédula
 */
export function resetUserPassword(cedulaOrId: string, resetBy?: string): { success: boolean; message: string; collaborator?: any } {
  const cleanU = (cedulaOrId || '').replace(/\D/g, '').trim();
  if (!cleanU) {
    return { success: false, message: 'Debe ingresar un número de cédula o ID válido.' };
  }

  // Buscar en el censo oficial
  const found = CANGURO_COLLABORATORS.find(c => {
    const colDigits = (c.info?.idNumber || '').replace(/\D/g, '');
    return colDigits === cleanU || c.info?.id === `emp-${cleanU}` || c.info?.id === cleanU;
  });

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // 1. Eliminar contraseña personalizada guardada
      const raw = window.localStorage.getItem(PASSWORDS_STORAGE_KEY) || '{}';
      const map = JSON.parse(raw);
      if (map[cleanU]) {
        delete map[cleanU];
        window.localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(map));
      }

      // 2. Si la sesión activa es de ese usuario, marcar mustChangePassword = true
      const session = getCurrentSession();
      if (session && (session.username === cleanU || session.collaboratorId === `emp-${cleanU}`)) {
        session.mustChangePassword = true;
        saveSession(session);
      }

      // 3. Registrar en bitácora de reinicios
      const logs = getPasswordResetLogs();
      const newLog: PasswordResetLogItem = {
        id: `reset-${Date.now()}-${cleanU}`,
        username: cleanU,
        fullName: found ? `${found.info.firstName} ${found.info.lastName}`.trim() : `Colaborador C.I. V-${cleanU}`,
        position: found ? found.info.position : 'Cargo Registrado',
        directorate: found ? found.info.directorate : 'Dirección Canguro',
        resetAt: new Date().toISOString(),
        resetBy: resetBy || 'Administrador Maestro'
      };
      logs.unshift(newLog);
      window.localStorage.setItem(RESETS_LOG_STORAGE_KEY, JSON.stringify(logs.slice(0, 50)));
    }

    // 4. Notificar a backend si está activo
    try {
      fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanU })
      }).catch(() => {});
    } catch {}

    const collabName = found ? `${found.info.firstName} ${found.info.lastName}`.trim() : `Usuario V-${cleanU}`;

    return {
      success: true,
      message: `¡Contraseña de ${collabName} reiniciada exitosamente! Ahora el colaborador ingresará desde cero: colocará su número de cédula (${cleanU}) como usuario y contraseña, y el sistema le solicitará definir una nueva contraseña personalizada.`,
      collaborator: found
    };
  } catch (e: any) {
    return { success: false, message: e.message || 'Error al reiniciar la contraseña' };
  }
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida los requisitos de seguridad corporativa para contraseñas de primer ingreso:
 * - Mínimo 6 caracteres
 * - Al menos 1 letra MAYÚSCULA
 * - Al menos 1 número
 * - Al menos 1 carácter especial (ej: #$%&!¡?*@+=~^)
 * - Prohibidos espacios en blanco
 * - Prohibidos signos de puntuación (. , : ; - _ ( ) [ ] { } ' " / \)
 */
export function validateCustomPassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  if (!password || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres.');
  }
  if (/\s/.test(password)) {
    errors.push('No están permitidos los espacios en blanco.');
  }
  if (/[.,:;\-_()[\]{}'"/\\]/.test(password)) {
    errors.push('No están permitidos los signos de puntuación (. , : ; - _ ( ) [ ] etc.).');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos 1 letra MAYÚSCULA.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos 1 número.');
  }
  if (!/[#$%&!¡?*@+=~^]/.test(password)) {
    errors.push('Debe contener al menos 1 carácter especial permitido (ej: #, $, %, &, !, ¡, ?).');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function hasUserCustomPassword(username: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const raw = window.localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (!raw) return false;
    const cleanU = (username || '').replace(/\D/g, '');
    const map = JSON.parse(raw);
    return !!map[cleanU];
  } catch (e) {
    return false;
  }
}

export function getUserCustomPassword(username: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (!raw) return null;
    const cleanU = (username || '').replace(/\D/g, '');
    const map = JSON.parse(raw);
    return map[cleanU]?.password || null;
  } catch (e) {
    return null;
  }
}

export function setUserCustomPassword(username: string, newPassword: string): { success: boolean; message: string } {
  const validation = validateCustomPassword(newPassword);
  if (!validation.isValid) {
    return { success: false, message: validation.errors[0] || 'La contraseña no cumple con los requisitos normativos.' };
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cleanU = (username || '').replace(/\D/g, '');
      const raw = window.localStorage.getItem(PASSWORDS_STORAGE_KEY) || '{}';
      const map = JSON.parse(raw);
      map[cleanU] = {
        password: newPassword,
        updatedAt: new Date().toISOString()
      };
      window.localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(map));

      // Actualizar sesión actual si coincide
      const session = getCurrentSession();
      if (session && (session.username === cleanU || session.username === username)) {
        session.mustChangePassword = false;
        saveSession(session);
      }
    }
    return { success: true, message: '¡Contraseña actualizada exitosamente!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Error al guardar la nueva contraseña' };
  }
}

/**
 * Inicia sesión usando Usuario = Cédula y Contraseña = Cédula (o credenciales admin/gestor)
 */
export async function loginWithCedula(
  cedulaUser: string,
  cedulaPass: string
): Promise<{ success: boolean; message: string; user?: AuthenticatedUser }> {
  const rawUser = (cedulaUser || '').trim().toLowerCase();
  const rawPass = (cedulaPass || '').trim().toLowerCase();

  if (!rawUser || !rawPass) {
    return { success: false, message: 'Debe ingresar su usuario o número de cédula en ambos campos' };
  }

  // 1. Acceso Directo de Administrador General
  if ((rawUser === 'admin' || rawUser === 'administrador') && (rawPass === 'admin' || rawPass === 'administrador')) {
    const adminUser: AuthenticatedUser = {
      id: 'usr-admin',
      collaboratorId: 'emp-admin',
      username: 'admin',
      fullName: 'Administrador General del Sistema',
      position: 'Administrador de Plataforma',
      department: 'Presidencia / Dirección General',
      directorate: 'Dirección General',
      managementLevel: 'ESTRATÉGICO',
      role: 'admin'
    };
    saveSession(adminUser);
    return { success: true, message: 'Sesión iniciada como Administrador General (acceso total).', user: adminUser };
  }

  // 1.1 Acceso Directo de Administrador Maestro: NATALIA RODRÍGUEZ (ID 26475804)
  const isNataliaLogin = (
    rawUser === '26475804' || rawUser === 'v-26475804' || rawUser === 'v-26.475.804' ||
    rawUser === 'natalia' || rawUser === 'natalia rodriguez' || rawUser === 'nrodriguez'
  );

  if (isNataliaLogin) {
    const hasCustom = hasUserCustomPassword('26475804');
    const customPass = getUserCustomPassword('26475804');
    const cleanPassDigits = (cedulaPass || '').replace(/\D/g, '');

    const isUsingDefaultPassword = (
      rawPass === '26475804' ||
      cleanPassDigits === '26475804' ||
      rawPass === 'admin' ||
      rawPass === 'natalia' ||
      rawPass === 'administrador'
    );
    const isMatchingCustom = hasCustom && (cedulaPass === customPass);

    if (isUsingDefaultPassword || isMatchingCustom) {
      // Si entra con la cédula (contraseña por defecto) o aún no ha configurado una clave personalizada, es obligatorio cambiarla
      const mustChange = !hasCustom || isUsingDefaultPassword;

      const masterAdmin: AuthenticatedUser = {
        id: 'usr-26475804',
        collaboratorId: 'emp-26475804',
        username: '26475804',
        fullName: 'Natalia Andrea Rodriguez Montilla',
        position: 'Coordinador de Formación y Desarrollo (Administrador Maestro)',
        department: 'Gerencia de Formación y Desarrollo',
        directorate: 'Dirección de Talento Humano',
        managementLevel: 'ESTRATÉGICO',
        role: 'admin',
        mustChangePassword: mustChange
      };

      if (!mustChange) {
        saveSession(masterAdmin);
      }

      return {
        success: true,
        message: mustChange
          ? '¡Primer ingreso detectado para el Administrador Maestro! Debe configurar su nueva contraseña obligatoria para continuar.'
          : '¡Bienvenida, Natalia Rodríguez! Sesión iniciada como Administrador Maestro (acceso total a la plataforma).',
        user: masterAdmin
      };
    } else {
      return {
        success: false,
        message: 'Contraseña incorrecta. Puede ingresar con su número de cédula (26475804) para restablecerla.'
      };
    }
  }

  // 2. Acceso Directo de Gestor de Evaluación
  if ((rawUser === 'gestor' || rawUser === 'evaluador') && (rawPass === 'gestor' || rawPass === 'evaluador')) {
    const gestorUser: AuthenticatedUser = {
      id: 'usr-gestor',
      collaboratorId: 'emp-gestor',
      username: 'gestor',
      fullName: 'Gestor Corporativo de Evaluación',
      position: 'Gestor de Evaluaciones y Desempeño',
      department: 'Gerencia de Formación y Desarrollo',
      directorate: 'Dirección de Talento Humano',
      managementLevel: 'TÉCNICO / INTERMEDIO',
      role: 'gestor'
    };
    saveSession(gestorUser);
    return { success: true, message: 'Sesión iniciada como Gestor de Evaluación (configuración y visualización de resultados).', user: gestorUser };
  }

  const cleanUser = (cedulaUser || '').replace(/\D/g, '').trim();
  const cleanPass = (cedulaPass || '').replace(/\D/g, '').trim();

  if (!cleanUser) {
    return { success: false, message: 'Debe ingresar un número de cédula válido como usuario.' };
  }

  const hasCustom = hasUserCustomPassword(cleanUser);
  const customPass = getUserCustomPassword(cleanUser);

  // Validación de credenciales: Si ingresa su número de cédula (contraseña por defecto), o nunca ha definido una
  let isFirstTimeLogin = false;

  if (cleanPass === cleanUser || (!hasCustom && (rawPass === 'admin' || cleanPass === cleanUser))) {
    // Ingreso con contraseña por defecto / cédula: OBLIGATORIO CAMBIAR CONTRASEÑA
    isFirstTimeLogin = true;
  } else if (hasCustom && cedulaPass === customPass) {
    isFirstTimeLogin = false;
  } else if (hasCustom) {
    return {
      success: false,
      message: 'Contraseña incorrecta. Puede ingresar con su número de cédula para cambiarla.'
    };
  } else {
    return {
      success: false,
      message: 'Contraseña incorrecta. Su contraseña temporal es su número de cédula.'
    };
  }

  // 1. Intentar autenticar contra el backend PostgreSQL / Supabase
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, password: cleanPass })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        saveSession(data.user);
        return { success: true, message: data.message, user: data.user };
      }
    }
  } catch (err) {
    // Si la API no está disponible o la BD no está configurada, usar resolución local
  }

  // 2. Fallback de alta disponibilidad local contra el censo CANGURO_COLLABORATORS y almacenamiento local
  let found = CANGURO_COLLABORATORS.find(c => {
    const colDigits = (c.info?.idNumber || '').replace(/\D/g, '');
    return colDigits === cleanUser || c.info?.id === `emp-${cleanUser}`;
  });

  if (!found && typeof window !== 'undefined' && window.localStorage) {
    try {
      const custom = window.localStorage.getItem('canguro_custom_collaborators');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed)) {
          found = parsed.find((c: any) => {
            const colDigits = (c.info?.idNumber || '').replace(/\D/g, '');
            return colDigits === cleanUser || c.info?.id === `emp-${cleanUser}`;
          });
          if (found && !CANGURO_COLLABORATORS.some(c => c.info.id === found.info.id)) {
            CANGURO_COLLABORATORS.unshift(found);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (found) {
    const mgmtLevel = getManagementLevel(found.info.position);
    const posLower = (found.info.position || '').toLowerCase();
    const deptLower = (found.info.department || '').toLowerCase();
    let role: AuthenticatedUser['role'] = 'colaborador';

    // Administrador Maestro Oficial: Natalia Rodríguez (ID 26475804)
    const isNataliaMaster = cleanUser === '26475804' ||
      (found.info?.idNumber && found.info.idNumber.replace(/\D/g, '') === '26475804') ||
      (found.info?.firstName?.toLowerCase().includes('natalia') && (found.info?.lastName?.toLowerCase().includes('rodriguez') || found.info?.lastName?.toLowerCase().includes('montilla')));

    if (isNataliaMaster) {
      role = 'admin';
    } else if (posLower.includes('administrador') || posLower.includes('presidencia') || posLower.includes('vicepresidencia')) {
      role = 'admin';
    } else if (posLower.includes('director')) {
      role = 'director';
    } else if (
      posLower.includes('desarrollo y desempeño') ||
      posLower.includes('formación y desarrollo') ||
      deptLower.includes('formación y desarrollo')
    ) {
      // Talento Humano / Formación y Desarrollo funge como Gestor de Evaluación
      role = 'gestor';
    } else if (posLower.includes('gerente') || posLower.includes('coordinador') || posLower.includes('supervisor')) {
      role = 'supervisor';
    } else {
      role = 'colaborador';
    }

    const user: AuthenticatedUser = {
      id: `usr-${cleanUser}`,
      collaboratorId: found.info.id || `emp-${cleanUser}`,
      username: cleanUser,
      fullName: `${found.info.firstName} ${found.info.lastName}`.trim(),
      position: isNataliaMaster ? `${found.info.position} (Administrador Maestro)` : found.info.position,
      department: found.info.department,
      directorate: found.info.directorate,
      managementLevel: isNataliaMaster ? 'ESTRATÉGICO' : mgmtLevel,
      role,
      mustChangePassword: isFirstTimeLogin
    };

    if (!isFirstTimeLogin) {
      saveSession(user);
    }

    return {
      success: true,
      message: isFirstTimeLogin
        ? `¡Primer ingreso detectado para ${user.fullName}! Debe configurar su nueva contraseña personalizada y única para continuar.`
        : `¡Bienvenido(a), ${user.fullName}! Sesión iniciada correctamente (${user.role.toUpperCase()}).`,
      user
    };
  }

  return {
    success: false,
    message: `No se encontró en el censo ningún colaborador con la cédula ${cleanUser}. Verifique el número ingresado.`
  };
}

/**
 * Determina si el usuario autenticado es el Administrador Maestro oficial
 * (Natalia Rodríguez, Cédula 26475804, o usuario con rol maestro 'admin')
 */
export function isMasterAdministrator(user: AuthenticatedUser | null): boolean {
  if (!user) return false;
  const cleanU = (user.username || '').replace(/\D/g, '');
  if (cleanU === '26475804') return true;
  if (user.username === 'admin') return true;
  if (user.collaboratorId === 'emp-26475804') return true;
  const fullNameLower = (user.fullName || '').toLowerCase();
  if (fullNameLower.includes('natalia') && (fullNameLower.includes('rodriguez') || fullNameLower.includes('montilla'))) return true;
  if (user.position && user.position.toLowerCase().includes('administrador maestro')) return true;
  return user.role === 'admin';
}

/**
 * Determina si el usuario tiene permiso para habilitar/cerrar y programar evaluaciones.
 * MANEJO EXCLUSIVO DEL ADMINISTRADOR MAESTRO (Natalia Rodríguez, ID 26475804).
 */
export function canManageEvaluationAccess(user: AuthenticatedUser | null): boolean {
  return isMasterAdministrator(user);
}

/**
 * Determina si el usuario autenticado tiene permisos para configurar evaluaciones
 * (Admin y Gestor de Evaluación de Formación y Desarrollo)
 */
export function canConfigureEvaluations(user: AuthenticatedUser | null): boolean {
  if (!user) return true; // Modo demostración libre si no hay restricción
  return user.role === 'admin' || user.role === 'gestor';
}

/**
 * Determina si el usuario autenticado puede visualizar todos los resultados de la empresa
 * (Admin y Gestor de Evaluación)
 */
export function canViewAllCompanyResults(user: AuthenticatedUser | null): boolean {
  if (!user) return true;
  return user.role === 'admin' || user.role === 'gestor';
}

/**
 * Determina si el usuario tiene permiso para ver el consolidado de una Dirección específica
 */
export function canViewDirectionResults(user: AuthenticatedUser | null, dirName: string): boolean {
  if (!user) return true;
  if (user.role === 'admin' || user.role === 'gestor') return true;
  if (user.role === 'director') {
    const cleanDir = (dirName || '').toLowerCase();
    const userDir = (user.directorate || '').toLowerCase();
    return cleanDir.includes(userDir) || userDir.includes(cleanDir);
  }
  return false;
}

/**
 * Guarda la sesión del usuario en localStorage y notifica a la aplicación
 */
export function saveSession(user: AuthenticatedUser): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('canguro_auth_change', { detail: user }));
    }
  } catch (e) {
    console.error('Error saving user session', e);
  }
}

/**
 * Obtiene el usuario autenticado actualmente
 */
export function getCurrentSession(): AuthenticatedUser | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as AuthenticatedUser;
        const cleanU = (user.username || '').replace(/\D/g, '');

        // Si tiene cambio pendiente de contraseña o aún no ha registrado su clave personalizada, exigir login con cambio obligatorio
        if (user.mustChangePassword || (user.username !== 'admin' && !hasUserCustomPassword(cleanU || user.username))) {
          return null;
        }

        // Auto-upgrade Natalia Rodríguez a Administrador Maestro si existía una sesión previa
        const isNatalia = cleanU === '26475804' ||
          user.collaboratorId === 'emp-26475804' ||
          (user.fullName && user.fullName.toLowerCase().includes('natalia') && (user.fullName.toLowerCase().includes('rodriguez') || user.fullName.toLowerCase().includes('montilla')));
        if (isNatalia && (user.role !== 'admin' || user.managementLevel !== 'ESTRATÉGICO')) {
          user.role = 'admin';
          user.managementLevel = 'ESTRATÉGICO';
          user.position = 'Coordinador de Formación y Desarrollo (Administrador Maestro)';
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        }
        return user;
      }
    }
  } catch (e) {
    console.error('Error reading session', e);
  }
  return null;
}

/**
 * Cierra la sesión activa
 */
export function logoutSession(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('canguro_auth_change', { detail: null }));
    }
  } catch (e) {
    console.error('Error removing session', e);
  }
}
