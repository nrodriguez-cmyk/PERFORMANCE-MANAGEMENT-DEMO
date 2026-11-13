import React, { useState, useEffect, useMemo } from 'react';
import {
  User, UserCheck, Users, ShieldCheck, Lock, ExternalLink,
  CheckCircle2, ArrowRight, AlertCircle, Briefcase, Info, Award
} from 'lucide-react';
import { getGlobalEvaluationStatus, formatScheduleDateTime, GlobalEvaluationStatus } from '../utils/evaluationStatus';
import { getCollaboratorEvaluationRelations, EvaluationTargetOption } from '../utils/evaluationRelations';

interface CollaboratorEvaluationQuadrantsProps {
  collaboratorName?: string;
  position?: string;
  idNumber?: string;
  department?: string;
  directorate?: string;
  isSupervisorOrLeader?: boolean;
  onOpenEvaluation?: (role: 'self' | 'supervisor' | 'peer' | 'subordinate', target?: EvaluationTargetOption) => void;
}

const POSITIONS_WITH_SUBORDINATES = [
  'director',
  'gerente',
  'supervisor',
  'coordinador',
  'jefe'
];

export function CollaboratorEvaluationQuadrants({
  collaboratorName = 'Colaborador Canguro',
  position = 'Asesor Integral de Ventas',
  idNumber = 'V-00.000.000',
  department = 'Red de Tiendas',
  directorate = 'Dirección de Operaciones',
  isSupervisorOrLeader,
  onOpenEvaluation
}: CollaboratorEvaluationQuadrantsProps) {
  const posLower = (position || '').toLowerCase();

  const [evalStatus, setEvalStatus] = useState<GlobalEvaluationStatus>(getGlobalEvaluationStatus());

  // Relaciones organizativas: Supervisor Inmediato, Pares y Subordinados según organigrama oficial
  const { immediateSupervisor, peers, subordinates } = useMemo(() => {
    return getCollaboratorEvaluationRelations(
      idNumber,
      position,
      directorate,
      department
    );
  }, [idNumber, position, directorate, department]);

  const hasSubordinates = isSupervisorOrLeader ?? (
    subordinates.length > 0 ||
    POSITIONS_WITH_SUBORDINATES.some(p => posLower.includes(p))
  );

  // Selección activa en listas desplegables
  const [selectedPeerId, setSelectedPeerId] = useState<string>('');
  const [selectedSubordinateId, setSelectedSubordinateId] = useState<string>('');

  // Inicializar selección con los primeros colaboradores encontrados
  useEffect(() => {
    if (peers.length > 0 && (!selectedPeerId || !peers.some(p => p.idNumber === selectedPeerId))) {
      setSelectedPeerId(peers[0].idNumber);
    }
  }, [peers, selectedPeerId]);

  useEffect(() => {
    if (subordinates.length > 0 && (!selectedSubordinateId || !subordinates.some(s => s.idNumber === selectedSubordinateId))) {
      setSelectedSubordinateId(subordinates[0].idNumber);
    }
  }, [subordinates, selectedSubordinateId]);

  const currentSelectedPeer = peers.find(p => p.idNumber === selectedPeerId) || peers[0];
  const currentSelectedSub = subordinates.find(s => s.idNumber === selectedSubordinateId) || subordinates[0];

  useEffect(() => {
    const handleStatusChange = () => {
      setEvalStatus(getGlobalEvaluationStatus());
    };
    window.addEventListener('canguro_eval_status_change', handleStatusChange);
    window.addEventListener('storage', handleStatusChange);

    // Verificación periódica cada 15s para cierre automático de sesión al llegar a la hora tope
    const timer = setInterval(() => {
      setEvalStatus(getGlobalEvaluationStatus());
    }, 15000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('canguro_eval_status_change', handleStatusChange);
      window.removeEventListener('storage', handleStatusChange);
    };
  }, []);

  const getEvaluationLink = (
    role: 'self' | 'supervisor' | 'peer' | 'subordinate',
    target?: EvaluationTargetOption
  ) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const cleanHash = window.location.hash.split('?')[0];
    const pathPrefix = cleanHash.includes('/evaluate') ? '' : '#/evaluate/' + role;

    if (role === 'self' || !target) {
      const query = `?employee=${encodeURIComponent(collaboratorName)}&position=${encodeURIComponent(position)}&idNumber=${encodeURIComponent(idNumber)}&dir=${encodeURIComponent(directorate)}&dept=${encodeURIComponent(department)}`;
      return `${baseUrl}${pathPrefix}${query}`;
    }

    // Para supervisor, pares o subordinados: el formulario evalúa a 'target' y registra quién es el evaluador
    const query = `?employee=${encodeURIComponent(target.name)}&position=${encodeURIComponent(target.position)}&idNumber=${encodeURIComponent(target.idNumber)}&dir=${encodeURIComponent(target.directorate)}&dept=${encodeURIComponent(target.department)}&evaluator=${encodeURIComponent(collaboratorName)}&evaluatorPos=${encodeURIComponent(position)}`;
    return `${baseUrl}${pathPrefix}${query}`;
  };

  const handleLaunch = (role: 'self' | 'supervisor' | 'peer' | 'subordinate') => {
    if (!evalStatus.isOpen) {
      alert('El período de evaluaciones se encuentra cerrado actualmente por la Dirección de Talento Humano.');
      return;
    }

    let target: EvaluationTargetOption | undefined = undefined;
    if (role === 'peer') {
      target = currentSelectedPeer;
    } else if (role === 'subordinate') {
      target = currentSelectedSub;
    } else if (role === 'supervisor') {
      target = immediateSupervisor || undefined;
    }

    if (onOpenEvaluation) {
      onOpenEvaluation(role, target);
      return;
    }
    const url = getEvaluationLink(role, target);
    window.location.hash = url.split('#')[1];
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      {/* AVISO DE EVALUACIONES CERRADAS SI APLICA */}
      {!evalStatus.isOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-950 flex items-start gap-3 shadow-sm animate-in fade-in">
          <Lock size={22} className="text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="font-black uppercase text-sm tracking-wide text-red-950 font-mono">
                Período de Evaluaciones Cerrado
              </h4>
              {evalStatus.endDate && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-200 text-red-900 border border-red-300">
                  Cierre Oficial: {formatScheduleDateTime(evalStatus.endDate)}
                </span>
              )}
            </div>
            <p className="text-xs text-red-800 leading-relaxed font-medium">
              {evalStatus.message || 'La Dirección de Talento Humano ha cerrado la recepción de instrumentos de evaluación. No se admiten nuevos ingresos ni modificaciones en este momento.'}
            </p>
          </div>
        </div>
      )}

      {/* 1. CABECERA INSTITUCIONAL */}
      <div className="p-5 sm:p-6 bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[#F1B400] text-black">
                  Ciclo Oficial de Desempeño
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {directorate}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-mono">
                Portal de Evaluaciones
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono shrink-0 space-y-1">
              <div className="text-[10px] uppercase font-bold text-zinc-400">Ficha del Evaluado</div>
              <div className="text-white font-bold">{collaboratorName}</div>
              <div className="text-[#F1B400] text-[11px] font-semibold">{idNumber} • {position}</div>
              <div className="text-zinc-400 text-[10px]">{department}</div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-300">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
              <CheckCircle2 size={13} className="text-emerald-400" /> Guardado offline automático activo (Local Storage)
            </span>
          </div>
        </div>
      </div>

      {/* 2. LOS CUADRANTES DE EVALUACIÓN (GRID 2x2 LIMPIO) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider block">
              Estructura por Cuadrantes
            </span>
            <h3 className="text-sm font-black uppercase text-zinc-950 flex items-center gap-2">
              <Briefcase size={16} className="text-[#D99C00]" /> Cuadrantes de Evaluación
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ========================================================================= */}
          {/* CUADRANTE 1: AUTOEVALUACIÓN */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border-2 border-[#F1B400] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group min-h-[140px]">
            <div className="space-y-3">
              <div>
                <h4 className="text-base sm:text-lg font-black uppercase text-zinc-950 flex items-center gap-2">
                  <User size={20} className="text-[#D99C00]" /> Autoevaluación del Colaborador
                </h4>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => handleLaunch('self')}
                disabled={!evalStatus.isOpen}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#F1B400] hover:bg-[#d99c00] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{evalStatus.isOpen ? 'Realizar Mi Autoevaluación' : 'Módulo Cerrado'}</span>
                {evalStatus.isOpen ? <ArrowRight size={14} /> : <Lock size={14} />}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CUADRANTE 2: EVALUACIÓN DEL SUPERVISOR INMEDIATO */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border-2 border-blue-400 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-base sm:text-lg font-black uppercase text-zinc-950 flex items-center gap-2">
                  <UserCheck size={20} className="text-blue-600" /> Evaluación del Supervisor Inmediato
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  Línea de Mando Oficial
                </span>
              </div>

              {immediateSupervisor ? (
                <div className="space-y-2 pt-1">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-900 font-mono block">
                      Supervisor Oficial Asignado:
                    </span>
                    <div className="text-xs font-black text-zinc-950">{immediateSupervisor.name}</div>
                    <div className="text-[11px] font-bold text-blue-700">{immediateSupervisor.position}</div>
                    <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between pt-1 border-t border-blue-100">
                      <span>C.I. {immediateSupervisor.idNumber}</span>
                      <span>{immediateSupervisor.directorate || immediateSupervisor.department}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600 font-mono">
                  Reporta directamente a Presidencia & Junta Directiva Corporativa.
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => handleLaunch('supervisor')}
                disabled={!evalStatus.isOpen || !immediateSupervisor}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{evalStatus.isOpen ? (immediateSupervisor ? 'Evaluar a Supervisor Inmediato' : 'Sin Supervisor Asignado') : 'Módulo Cerrado'}</span>
                {evalStatus.isOpen ? <ArrowRight size={14} /> : <Lock size={14} />}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CUADRANTE 3: EVALUACIÓN DE PARES */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border-2 border-purple-300 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-base sm:text-lg font-black uppercase text-zinc-950 flex items-center gap-2">
                  <Users size={20} className="text-purple-600" /> Evaluación de Pares
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  {peers.length} {peers.length === 1 ? 'Par Oficial' : 'Pares Oficiales'}
                </span>
              </div>

              {/* LISTA DESPLEGABLE DE PARES DISPONIBLES */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users size={13} className="text-purple-600" />
                    Seleccionar Par a Evaluar:
                  </span>
                  <span className="text-[10px] text-zinc-500 font-semibold font-mono">
                    (Misma Jerarquía)
                  </span>
                </label>
                <select
                  value={selectedPeerId}
                  onChange={(e) => setSelectedPeerId(e.target.value)}
                  disabled={!evalStatus.isOpen || peers.length === 0}
                  className="w-full p-2.5 bg-purple-50/50 border-2 border-purple-200 focus:border-purple-500 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {peers.length === 0 ? (
                    <option value="">No hay pares registrados para este nivel</option>
                  ) : (
                    peers.map(p => (
                      <option key={p.idNumber} value={p.idNumber}>
                        {p.name} — {p.position} ({p.idNumber})
                      </option>
                    ))
                  )}
                </select>
                {currentSelectedPeer && (
                  <div className="text-[10.5px] font-mono text-purple-900 bg-purple-50/80 px-2.5 py-1.5 rounded-lg border border-purple-200 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 truncate max-w-[260px]">{currentSelectedPeer.name}</span>
                      <span className="text-purple-700 font-semibold">C.I. {currentSelectedPeer.idNumber}</span>
                    </div>
                    <div className="text-[10px] text-zinc-600 flex items-center justify-between">
                      <span className="truncate max-w-[240px]">{currentSelectedPeer.position}</span>
                      <span className="text-zinc-500 shrink-0">{currentSelectedPeer.department || currentSelectedPeer.directorate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => handleLaunch('peer')}
                disabled={!evalStatus.isOpen || peers.length === 0}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-950 hover:bg-purple-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{evalStatus.isOpen ? 'Realizar Evaluación de Pares' : 'Módulo Cerrado'}</span>
                {evalStatus.isOpen ? <ArrowRight size={14} /> : <Lock size={14} />}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CUADRANTE 4: EVALUACIÓN DE SUBORDINADOS (SOLO SI CUENTA CON SUBORDINADOS)  */}
          {/* ========================================================================= */}
          {hasSubordinates && subordinates.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-emerald-400 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-base sm:text-lg font-black uppercase text-zinc-950 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-600" /> Evaluación de Subordinados
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {subordinates.length} {subordinates.length === 1 ? 'Reporte Directo' : 'Reportes Directos'}
                  </span>
                </div>

                {/* LISTA DESPLEGABLE DE SUBORDINADOS DISPONIBLES */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      Seleccionar Subordinado a Evaluar:
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold font-mono">
                      (Equipo Asignado)
                    </span>
                  </label>
                  <select
                    value={selectedSubordinateId}
                    onChange={(e) => setSelectedSubordinateId(e.target.value)}
                    disabled={!evalStatus.isOpen || subordinates.length === 0}
                    className="w-full p-2.5 bg-emerald-50/50 border-2 border-emerald-200 focus:border-emerald-500 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    {subordinates.map(s => (
                      <option key={s.idNumber} value={s.idNumber}>
                        {s.name} — {s.position} ({s.idNumber})
                      </option>
                    ))}
                  </select>
                  {currentSelectedSub && (
                    <div className="text-[10.5px] font-mono text-emerald-900 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900 truncate max-w-[260px]">{currentSelectedSub.name}</span>
                        <span className="text-emerald-700 font-semibold">C.I. {currentSelectedSub.idNumber}</span>
                      </div>
                      <div className="text-[10px] text-zinc-600 flex items-center justify-between">
                        <span className="truncate max-w-[240px]">{currentSelectedSub.position}</span>
                        <span className="text-zinc-500 shrink-0">{currentSelectedSub.department || currentSelectedSub.directorate}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 flex justify-end">
                <button
                  onClick={() => handleLaunch('subordinate')}
                  disabled={!evalStatus.isOpen || subordinates.length === 0}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{evalStatus.isOpen ? 'Realizar Evaluación de Subordinados' : 'Módulo Cerrado'}</span>
                  {evalStatus.isOpen ? <ArrowRight size={14} /> : <Lock size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
