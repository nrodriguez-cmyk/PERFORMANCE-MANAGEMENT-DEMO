import React, { useState, useMemo } from 'react';
import { CANGURO_COLLABORATORS } from '../data/canguroUniverso';
import {
  resetUserPassword,
  hasUserCustomPassword,
  getPasswordResetLogs,
  PasswordResetLogItem
} from '../services/authService';
import {
  KeyRound, Search, RotateCcw, CheckCircle2, AlertCircle, Copy,
  Check, User, Building2, Briefcase, ShieldAlert, ArrowRight,
  Clock, ShieldCheck, HelpCircle, History
} from 'lucide-react';

interface UserPasswordRecoveryModuleProps {
  onNavigateBack?: () => void;
}

export function UserPasswordRecoveryModule({ onNavigateBack }: UserPasswordRecoveryModuleProps) {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCedula, setSelectedCedula] = useState<string>('');
  const [resultNotice, setResultNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedInstructions, setCopiedInstructions] = useState(false);
  const [resetLogs, setResetLogs] = useState<PasswordResetLogItem[]>(() => getPasswordResetLogs());
  const [isResetting, setIsResetting] = useState(false);

  // Colaborador actualmente seleccionado o coincidencia exacta
  const cleanQuery = searchInput.replace(/\D/g, '').trim();

  // Búsqueda inteligente por Cédula o Nombre
  const searchResults = useMemo(() => {
    if (!searchInput || searchInput.trim().length < 2) return [];

    const q = searchInput.trim().toLowerCase();
    const qDigits = searchInput.replace(/\D/g, '');

    return CANGURO_COLLABORATORS.filter(c => {
      const colDigits = (c.info?.idNumber || '').replace(/\D/g, '');
      const fullName = `${c.info?.firstName || ''} ${c.info?.lastName || ''}`.toLowerCase();
      const pos = (c.info?.position || '').toLowerCase();

      if (qDigits && colDigits.includes(qDigits)) return true;
      if (fullName.includes(q)) return true;
      if (pos.includes(q)) return true;
      return false;
    }).slice(0, 8);
  }, [searchInput]);

  // Colaborador seleccionado activamente
  const activeCollaborator = useMemo(() => {
    const targetCedula = selectedCedula || cleanQuery;
    if (!targetCedula) return null;

    return CANGURO_COLLABORATORS.find(c => {
      const colDigits = (c.info?.idNumber || '').replace(/\D/g, '');
      return colDigits === targetCedula || c.info?.id === `emp-${targetCedula}` || c.info?.id === targetCedula;
    }) || null;
  }, [selectedCedula, cleanQuery]);

  const activeCedula = activeCollaborator
    ? (activeCollaborator.info.idNumber || '').replace(/\D/g, '')
    : cleanQuery;

  const hasCustomPass = activeCedula ? hasUserCustomPassword(activeCedula) : false;

  const handleSelectCollaborator = (cedula: string) => {
    setSelectedCedula(cedula);
    setSearchInput(cedula);
    setResultNotice(null);
    setCopiedInstructions(false);
  };

  const handleExecuteReset = () => {
    if (!activeCedula) {
      setResultNotice({ type: 'error', message: 'Por favor ingrese o seleccione un número de cédula o ID válido.' });
      return;
    }

    const collabName = activeCollaborator
      ? `${activeCollaborator.info.firstName} ${activeCollaborator.info.lastName}`
      : `Usuario C.I. V-${activeCedula}`;

    if (!confirm(`¿Confirmas el reinicio de contraseña para ${collabName}?\n\nEl colaborador ingresará desde cero utilizando su número de cédula (${activeCedula}) como usuario y contraseña, y el sistema le solicitará crear su nueva clave personalizada.`)) {
      return;
    }

    setIsResetting(true);
    setTimeout(() => {
      const res = resetUserPassword(activeCedula, 'Administrador Maestro');
      setIsResetting(false);
      if (res.success) {
        setResultNotice({ type: 'success', message: res.message });
        setResetLogs(getPasswordResetLogs());
      } else {
        setResultNotice({ type: 'error', message: res.message });
      }
    }, 400);
  };

  const handleCopyInstructions = () => {
    if (!activeCollaborator && !activeCedula) return;

    const nombre = activeCollaborator
      ? `${activeCollaborator.info.firstName} ${activeCollaborator.info.lastName}`
      : 'Estimado colaborador';

    const text = `*DISTRICUEROS EL CANGURO - GESTIÓN DEL DESEMPEÑO*\n\nHola ${nombre},\n\nTu contraseña en el portal institucional de evaluaciones ha sido reiniciada exitosamente.\n\nPara ingresar nuevamente al portal:\n1. Accede al enlace del sistema.\n2. En *Usuario*, coloca tu número de cédula: *${activeCedula}*\n3. En *Contraseña*, coloca tu mismo número de cédula: *${activeCedula}*\n4. El sistema detectará automáticamente tu ingreso como *Primer Ingreso* y te solicitará definir tu nueva contraseña personalizada y segura para acceder a tus evaluaciones.\n\n_Dirección de Talento Humano_`;

    navigator.clipboard.writeText(text);
    setCopiedInstructions(true);
    setTimeout(() => setCopiedInstructions(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in text-zinc-900 max-w-5xl mx-auto">
      {/* 1. HEADER INSTITUCIONAL DEL MÓDULO */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-2xl p-6 border-2 border-[#F1B400] shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F1B400] text-black uppercase tracking-wider">
                Módulo Administrativo Maestro
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Gobernanza de Accesos & Seguridad
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
              <KeyRound size={24} className="text-[#F1B400]" /> Recuperación y Reinicio de Contraseñas
            </h2>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Herramienta oficial para reestablecer el acceso de colaboradores que hayan olvidado su contraseña. Al reiniciar la clave, el usuario ingresará al portal como si fuera su <strong>primer ingreso</strong>: usando su número de cédula como usuario y contraseña, y definiendo obligatoriamente una nueva contraseña personalizada.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-[#F1B400]/40 text-[#F1B400] font-mono text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} /> Control Maestro Activo
            </span>
          </div>
        </div>
      </div>

      {/* 2. BUSCADOR INTELIGENTE POR CÉDULA O ID */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-zinc-800 font-mono mb-1.5">
            1. Ingrese el Número de ID o Cédula de Identidad del Colaborador:
          </label>
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSelectedCedula('');
                setResultNotice(null);
              }}
              placeholder="Escriba el número de cédula (ej: 26475804, V-26.128.411) o nombre del colaborador..."
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-zinc-200 focus:border-[#F1B400] rounded-xl text-sm font-bold text-zinc-900 placeholder:text-zinc-400 outline-none transition-all shadow-inner"
            />
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Puede ingresar la cédula con o sin puntos (ej: <em>26475804</em>, <em>V-26.475.804</em>) o buscar por nombre.
          </span>
        </div>

        {/* Sugerencias de búsqueda rápida */}
        {searchResults.length > 0 && !selectedCedula && (
          <div className="border border-zinc-200 rounded-xl bg-zinc-50/70 p-2 space-y-1 animate-in fade-in">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 px-2 block">
              Resultados coincidentes en el censo ({searchResults.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {searchResults.map(c => {
                const digits = (c.info?.idNumber || '').replace(/\D/g, '');
                return (
                  <button
                    key={c.info.id}
                    type="button"
                    onClick={() => handleSelectCollaborator(digits)}
                    className="p-2 bg-white hover:bg-amber-50/80 border border-zinc-200 hover:border-amber-300 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-zinc-950 block">
                        {c.info.firstName} {c.info.lastName}
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate max-w-[220px]">
                        {c.info.position}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800">
                      C.I. {digits}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. FICHA DEL USUARIO ENCONTRADO Y BOTÓN REINICIAR CONTRASEÑA */}
      {activeCollaborator ? (
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 shadow-md space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F1B400]/20 text-[#D99C00] flex items-center justify-center font-black text-xl shrink-0 border border-[#F1B400]/40">
                <User size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-zinc-950">
                    {activeCollaborator.info.firstName} {activeCollaborator.info.lastName}
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Censo Activo
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  {activeCollaborator.info.position} • {activeCollaborator.info.directorate}
                </p>
              </div>
            </div>

            <div className="text-right self-start sm:self-auto">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Cédula Oficial</span>
              <span className="text-base font-black font-mono text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-200 inline-block">
                V-{activeCedula}
              </span>
            </div>
          </div>

          {/* Datos del colaborador en grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase font-bold">Dirección Adscrita</span>
              <strong className="text-zinc-900 block mt-0.5">{activeCollaborator.info.directorate}</strong>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase font-bold">Gerencia / Unidad</span>
              <strong className="text-zinc-900 block mt-0.5">{activeCollaborator.info.department || 'Operaciones'}</strong>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase font-bold">Estado de Contraseña</span>
              <span className={`inline-block mt-0.5 text-[11px] font-bold ${
                hasCustomPass ? 'text-amber-800' : 'text-zinc-600'
              }`}>
                {hasCustomPass ? '● Clave Personalizada Configurada' : '○ Clave por Defecto (Cédula)'}
              </span>
            </div>
          </div>

          {/* Banner Explicativo del Procedimiento */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <HelpCircle size={16} className="text-[#D99C00] shrink-0" />
              <span>Procedimiento de Reinicio de Contraseña:</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-amber-900">
              Al presionar <strong>"Reiniciar Contraseña"</strong>, se eliminará cualquier contraseña personalizada guardada para este colaborador. Cuando el colaborador intente acceder:
            </p>
            <ul className="list-disc list-inside text-[11px] space-y-1 font-mono text-amber-950 pl-1">
              <li>Colocará su Cédula (<strong>{activeCedula}</strong>) como Usuario.</li>
              <li>Colocará su misma Cédula (<strong>{activeCedula}</strong>) como Contraseña.</li>
              <li>El sistema lo redirigirá inmediatamente a la <strong>Autenticación de Primer Ingreso</strong> para crear su nueva contraseña personalizada.</li>
            </ul>
          </div>

          {/* BOTÓN DE ACCIÓN PRINCIPAL */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleExecuteReset}
              disabled={isResetting}
              className="w-full sm:w-auto px-6 py-3 bg-[#F1B400] hover:bg-[#d99c00] active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={16} className={isResetting ? 'animate-spin' : ''} />
              <span>{isResetting ? 'Reiniciando...' : 'Reiniciar Contraseña de este Usuario'}</span>
            </button>

            {resultNotice?.type === 'success' && (
              <button
                type="button"
                onClick={handleCopyInstructions}
                className="w-full sm:w-auto px-4 py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                title="Copiar mensaje listo para enviar por WhatsApp o Correo al colaborador"
              >
                {copiedInstructions ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} className="text-[#F1B400]" />}
                <span>{copiedInstructions ? '¡Instrucciones Copiadas!' : 'Copiar Instrucciones para el Colaborador'}</span>
              </button>
            )}
          </div>

          {/* MENSAJE DE CONFIRMACIÓN O ERROR */}
          {resultNotice && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-3 animate-in fade-in ${
              resultNotice.type === 'success'
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-950'
                : 'bg-red-50 border border-red-300 text-red-950'
            }`}>
              {resultNotice.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-bold block">
                  {resultNotice.type === 'success' ? '¡Operación Exitosa!' : 'Atención'}
                </span>
                <p className="text-[11.5px] leading-relaxed">
                  {resultNotice.message}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : cleanQuery.length >= 6 ? (
        <div className="p-8 bg-white border border-zinc-200 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto text-zinc-400">
            <User size={24} />
          </div>
          <h4 className="text-sm font-bold text-zinc-900">
            No se encontró colaborador con la cédula "{cleanQuery}"
          </h4>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Verifique el número ingresado en el buscador o verifique que el colaborador esté cargado en la Base de Datos Oficial.
          </p>
        </div>
      ) : null}

      {/* 4. BITÁCORA HISTÓRICA RECIENTE DE REINICIOS */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#D99C00]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 font-mono">
              Bitácora Reciente de Reinicios de Contraseña
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 font-bold">
            {resetLogs.length} registros guardados
          </span>
        </div>

        {resetLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500 font-mono">
            No hay reinicios recientes registrados en esta sesión.
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-white font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Fecha & Hora</th>
                  <th className="p-2.5">Cédula / ID</th>
                  <th className="p-2.5">Colaborador</th>
                  <th className="p-2.5">Cargo & Área</th>
                  <th className="p-2.5 text-center">Estado de Ingreso</th>
                  <th className="p-2.5 text-right">Acción Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {resetLogs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-50">
                    <td className="p-2.5 font-mono text-[11px] text-zinc-600 whitespace-nowrap">
                      {new Date(log.resetAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-zinc-900">
                      V-{log.username}
                    </td>
                    <td className="p-2.5 font-bold text-zinc-950">
                      {log.fullName}
                    </td>
                    <td className="p-2.5 text-[11px] text-zinc-600">
                      {log.position} • <span className="text-zinc-500">{log.directorate}</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        Pendiente 1er Ingreso
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelectCollaborator(log.username)}
                        className="px-2.5 py-1 text-[10px] font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded cursor-pointer"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

