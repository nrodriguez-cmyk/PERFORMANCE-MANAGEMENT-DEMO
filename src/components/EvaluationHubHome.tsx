import React, { useState } from 'react';
import {
  Settings, Activity, Users, FileCheck, Star, ChevronRight, GraduationCap, Sparkles, Sliders,
  User, ShieldCheck, Briefcase, LayoutGrid, Eye, KeyRound
} from 'lucide-react';
import { CANGURO_COLLABORATORS } from '../data/canguroUniverso';
import { getCurrentSession, AuthenticatedUser, isMasterAdministrator } from '../services/authService';
import { CollaboratorEvaluationQuadrants } from './CollaboratorEvaluationQuadrants';

interface EvaluationHubHomeProps {
  onNavigate: (stage: 'config' | 'config_desempeno' | 'config_promocion' | 'recuperacion_clave' | 'links' | 'expediente' | 'audit', block?: 'organizacional' | 'dashboard_promociones' | 'banco_sucesores' | 'people_analytics_educacion' | 'resumen' | 'promocion' | 'calibracion' | 'pdi' | 'evaluaciones' | 'sucesion') => void;
  onSelectCollaborator?: (id: string) => void;
  collaboratorCount?: number;
  currentUser?: AuthenticatedUser | null;
  onOpenEvaluation?: (role: 'self' | 'supervisor' | 'peer' | 'subordinate') => void;
}

export function EvaluationHubHome({
  onNavigate,
  onSelectCollaborator,
  currentUser: propUser,
  onOpenEvaluation
}: EvaluationHubHomeProps) {
  const activeUser = propUser || getCurrentSession();
  const isMaster = isMasterAdministrator(activeUser);
  const isAdmin = activeUser?.role === 'admin' || activeUser?.role === 'gestor' || isMaster;

  // For administrators, allow toggling between administrative modules and collaborator quadrants view
  const [adminViewMode, setAdminViewMode] = useState<'admin_modules' | 'cuadrantes_colaborador'>('admin_modules');
  const [previewCollabId, setPreviewCollabId] = useState<string>(activeUser?.collaboratorId || CANGURO_COLLABORATORS[0]?.info.id || 'emp-001');

  // Live calculation of collaborator and evaluation metrics
  const totalCollaborators = CANGURO_COLLABORATORS.length;
  const evaluatedCount = CANGURO_COLLABORATORS.filter(c => c.selfEval?.submittedAt || c.supervisorEval?.submittedAt || ((c as any).evaluations && (c as any).evaluations.length > 0)).length;
  const evaluatedPct = Math.round((evaluatedCount / totalCollaborators) * 100);
  const pendingCount = totalCollaborators - evaluatedCount;

  // Selected collaborator data for quadrants
  const previewCollab = CANGURO_COLLABORATORS.find(c => c.info.id === previewCollabId) || CANGURO_COLLABORATORS[0];
  const effectiveCollabName = !isAdmin && activeUser ? activeUser.fullName : `${previewCollab.info.firstName} ${previewCollab.info.lastName}`;
  const effectivePosition = !isAdmin && activeUser ? activeUser.position : previewCollab.info.position;
  const effectiveIdNumber = !isAdmin && activeUser ? activeUser.username : previewCollab.info.idNumber;
  const effectiveDept = !isAdmin && activeUser ? activeUser.department : previewCollab.info.department;
  const effectiveDir = !isAdmin && activeUser ? activeUser.directorate : previewCollab.info.directorate;

  // =========================================================================
  // SI EL USUARIO NO ES ADMINISTRADOR: RENDERIZAR ÚNICAMENTE LOS CUADRANTES
  // =========================================================================
  if (!isAdmin) {
    return (
      <CollaboratorEvaluationQuadrants
        collaboratorName={effectiveCollabName}
        position={effectivePosition}
        idNumber={effectiveIdNumber}
        department={effectiveDept}
        directorate={effectiveDir}
        isSupervisorOrLeader={activeUser?.role === 'supervisor' || activeUser?.role === 'director'}
        onOpenEvaluation={onOpenEvaluation}
      />
    );
  }

  // =========================================================================
  // SI EL USUARIO ES ADMINISTRADOR: VISTA CONMUTABLE (MÓDULOS O CUADRANTES)
  // =========================================================================
  const cards = [
    {
      id: 'configuracion_desempeno',
      stage: 'config_desempeno' as const,
      badge: 'Módulo 1',
      badgeClass: 'bg-[#F1B400] text-black font-black',
      title: 'Configuración de Evaluación del Desempeño',
      subtitle: 'Por Dirección, Gerencia & Tipos de Evaluación (180° / 360°)',
      description: 'Visualización y edición de reactivos para los 4 tipos de evaluación (Autoevaluación, Supervisor, Pares y Subordinados) organizados por las 8 Direcciones y Gerencias corporativas.',
      previewType: 'config',
      icon: Sliders,
      buttonText: 'Configurar Evaluación del Desempeño'
    },
    {
      id: 'configuracion_promocion',
      stage: 'config_promocion' as const,
      badge: 'Módulo 2',
      badgeClass: 'bg-purple-100 text-purple-950 font-black border border-purple-300',
      title: 'Configuración de Concurso de Promoción y Ascenso',
      subtitle: 'Postulaciones Individuales & Rúbricas con IA (Subprocesos 1 y 2)',
      description: 'Gestión exclusiva de postulaciones a ascensos: datos del colaborador, cargo superior postulado, descriptor con Gemini IA, Test Big Five y casos situacionales supervisados.',
      previewType: 'config',
      icon: Sparkles,
      buttonText: 'Configurar Concurso de Promoción'
    },
    {
      id: 'banco_sucesores',
      stage: 'expediente' as const,
      block: 'banco_sucesores' as const,
      badge: 'Módulo 3',
      badgeClass: 'bg-emerald-100 text-emerald-950 font-black border border-emerald-300',
      title: 'Matriz de Sucesión',
      subtitle: 'Continuidad del Liderazgo & Puestos Clave',
      description: 'Matriz estratégica para cobertura de posiciones críticas: identificación de sucesores listos (Ready Now, 1-2 años), plan de reemplazos por dirección y planes de contingencia operativa.',
      previewType: 'sucesores',
      icon: Star,
      buttonText: 'Ver Matriz de Sucesión'
    },
    {
      id: 'auditoria_en_vivo',
      stage: 'audit' as const,
      badge: 'Módulo 4',
      badgeClass: 'bg-zinc-100 text-zinc-900 font-bold border border-zinc-300',
      title: 'Auditoría de Evaluaciones y Trazabilidad',
      subtitle: 'Monitoreo Forense en Tiempo Real',
      description: 'Supervisa el progreso de respuestas en vivo por dirección, estado de completitud de fuentes 180°/360°, bitácora forense de envíos, marcas temporales y sellos de seguridad.',
      previewType: 'audit',
      icon: Activity,
      buttonText: 'Abrir Auditoría & Trazabilidad'
    },
    {
      id: 'people_analytics_educacion',
      stage: 'expediente' as const,
      block: 'people_analytics_educacion' as const,
      badge: 'Nivel Académico',
      badgeClass: 'bg-amber-100 text-amber-950 font-black border border-amber-300',
      title: 'Impacto del Nivel Académico',
      subtitle: 'Distribución, Box Plot & Correlación',
      description: 'Evalúa estadísticamente si el nivel académico (Básico, Diversificado, TSU, Universitario) predice el desempeño laboral con gráficos, significancia y correlaciones.',
      previewType: 'people_analytics',
      icon: GraduationCap,
      buttonText: 'Ver Gráficos y Análisis'
    },
    {
      id: 'recuperacion_clave',
      stage: 'recuperacion_clave' as const,
      badge: 'Usuario Maestro',
      badgeClass: 'bg-amber-100 text-amber-950 font-black border border-amber-400',
      title: 'Recuperación de Contraseña de Usuarios',
      subtitle: 'Reinicio Inmediato por Cédula / ID',
      description: 'Módulo exclusivo para el usuario maestro: busca colaboradores que hayan olvidado su clave y reinicia su contraseña a su cédula original, enviándolos al flujo de primer ingreso.',
      previewType: 'config',
      icon: KeyRound,
      buttonText: 'Gestionar Recuperación de Contraseña'
    }
  ];

  // Si es un Colaborador (no administrador), mostrar directamente sus Cuadrantes de Evaluación Oficiales
  if (!isAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in text-zinc-900">
        <CollaboratorEvaluationQuadrants
          collaboratorName={effectiveCollabName}
          position={effectivePosition}
          idNumber={effectiveIdNumber}
          department={effectiveDept}
          directorate={effectiveDir}
          onOpenEvaluation={onOpenEvaluation}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in text-zinc-900">
      {/* SEGMENTED CONTROL PARA ADMINISTRADOR: SWITCHER ENTRE GESTIÓN ADMINISTRATIVA Y CUADRANTES DE COLABORADOR */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-2.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-950 text-[#F1B400]">
            Modo Administrador
          </span>
          <span className="text-xs font-bold text-zinc-700">
            Conmutador de Visualización:
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setAdminViewMode('admin_modules')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${adminViewMode === 'admin_modules'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950'
              }`}
          >
            <Sliders size={14} className={adminViewMode === 'admin_modules' ? 'text-[#D99C00]' : 'text-zinc-500'} />
            <span>Módulos de Gestión Administrativa</span>
          </button>

          <button
            onClick={() => setAdminViewMode('cuadrantes_colaborador')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${adminViewMode === 'cuadrantes_colaborador'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950'
              }`}
          >
            <LayoutGrid size={14} className={adminViewMode === 'cuadrantes_colaborador' ? 'text-[#D99C00]' : 'text-zinc-500'} />
            <span>Portal de Evaluaciones (Vista Cuadrantes)</span>
          </button>
        </div>
      </div>

      {/* SI SE SELECCIONÓ VISTA CUADRANTES: MOSTRAR LOS CUADRANTES CON SELECTOR DE PERFIL */}
      {adminViewMode === 'cuadrantes_colaborador' ? (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-[#D99C00]" />
              <span className="text-zinc-800">
                <strong>Simulador de Vista Colaborador:</strong> Seleccione cualquier colaborador para verificar los cuadrantes y reactivos exactos a los que tiene acceso según su cargo.
              </span>
            </div>

            <div className="flex items-center gap-2 min-w-[280px]">
              <label className="text-[10px] font-bold uppercase text-zinc-500 font-mono">Simular Cargo:</label>
              <select
                value={previewCollabId}
                onChange={(e) => {
                  setPreviewCollabId(e.target.value);
                  if (onSelectCollaborator) onSelectCollaborator(e.target.value);
                }}
                className="flex-1 bg-white border border-zinc-300 rounded-lg p-1.5 text-xs font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-[#F1B400] max-w-md"
              >
                {CANGURO_COLLABORATORS.map(c => (
                  <option key={c.info.id} value={c.info.id}>
                    {c.info.firstName} {c.info.lastName} — {c.info.position} ({c.info.directorate || c.info.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <CollaboratorEvaluationQuadrants
            collaboratorName={effectiveCollabName}
            position={effectivePosition}
            idNumber={effectiveIdNumber}
            department={effectiveDept}
            directorate={effectiveDir}
            onOpenEvaluation={onOpenEvaluation}
          />
        </div>
      ) : (
        /* VISTA ADMINISTRATIVA: HERO BANNER + 5 TARJETAS DE GESTIÓN */
        <div className="space-y-8">
          {/* Hero Banner: Gestión del Desempeño */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6 sm:p-8 border-2 border-[#F1B400] shadow-md">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#F1B400]/15 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="space-y-4 max-w-4xl">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-sans">
                  Gestión del Desempeño
                </h1>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
                  Bienvenido al portal institucional para la gestión, medición y desarrollo del Talento Humano. Acceda de forma directa a cada uno de los módulos estratégicos del ciclo evaluativo.
                </p>

                {/* Espacio con N° DE COLABORADORES ACTIVOS y N° DE EVALUACIONES REALIZADAS */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="px-5 py-3 rounded-xl bg-zinc-900/90 border border-zinc-700/80 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#F1B400]/15 border border-[#F1B400]/30 flex items-center justify-center text-[#F1B400]">
                      <Users size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
                        N° de Colaboradores Activos
                      </span>
                      <span className="text-xl font-black text-white font-mono">
                        {totalCollaborators} <span className="text-xs font-normal text-zinc-400">Activos</span>
                      </span>
                    </div>
                  </div>

                  <div className="px-5 py-3 rounded-xl bg-zinc-900/90 border border-zinc-700/80 shadow-xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
                        N° de Evaluaciones Realizadas
                      </span>
                      <span className="text-xl font-black text-white font-mono">
                        {evaluatedCount} <span className="text-xs font-bold text-emerald-400 font-mono">({evaluatedPct}%)</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Institutional Pulse on Wide Screens */}
              <div className="hidden xl:flex flex-col gap-2.5 p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono shrink-0 min-w-[260px] shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Estado del Ciclo</span>
                  <span className="text-[#F1B400] font-black text-[10px]">2026-II</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Colaboradores Activos:</span>
                  <span className="text-white font-bold">{totalCollaborators}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Evaluaciones Realizadas:</span>
                  <span className="text-emerald-400 font-bold">{evaluatedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Evaluaciones Pendientes:</span>
                  <span className="text-[#F1B400] font-bold">{pendingCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Interactive Modules with Visual Simulation Covers */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                  Módulos Operativos del Proceso de Evaluación
                </h2>
                <p className="text-xs text-zinc-500">
                  Haga clic sobre cualquiera de las tarjetas para ingresar directamente al espacio correspondiente.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                Acceso Administrativo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      onNavigate(card.stage, card.block);
                    }}
                    className="group cursor-pointer bg-white border border-zinc-200 hover:border-[#F1B400] rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Visual Reference Header */}
                      <div className="h-32 bg-zinc-950 relative overflow-hidden flex items-center justify-center p-4 border-b border-zinc-100">
                        {card.previewType === 'config' && (
                          <div className="w-full h-full flex flex-col justify-center px-4 space-y-2 opacity-90 group-hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-[#F1B400] uppercase font-bold">180° / 360° / Promoción</span>
                              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-300 font-mono">DTH-GFD-MC-01</span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="h-2 bg-zinc-800 rounded w-full overflow-hidden">
                                <div className="h-full bg-[#F1B400] w-3/4 rounded" />
                              </div>
                              <div className="h-2 bg-zinc-800 rounded w-5/6" />
                            </div>
                          </div>
                        )}

                        {card.previewType === 'sucesores' && (
                          <div className="w-full h-full flex flex-col justify-center px-4 space-y-2 opacity-90 group-hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Pipeline Talento</span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-[9px] text-emerald-300 font-mono border border-emerald-800">Ready Now</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 pt-1">
                              <div className="h-4 rounded bg-emerald-500/20 border border-emerald-500/40" />
                              <div className="h-4 rounded bg-amber-500/20 border border-amber-500/40" />
                              <div className="h-4 rounded bg-blue-500/20 border border-blue-500/40" />
                            </div>
                          </div>
                        )}

                        {card.previewType === 'audit' && (
                          <div className="w-full h-full flex flex-col justify-center px-4 space-y-2 opacity-90 group-hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-zinc-300 uppercase font-bold">Audit Log</span>
                              <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="h-1.5 bg-zinc-800 rounded w-full" />
                              <div className="h-1.5 bg-zinc-800 rounded w-4/5" />
                              <div className="h-1.5 bg-zinc-800 rounded w-3/5" />
                            </div>
                          </div>
                        )}

                        {card.previewType === 'people_analytics' && (
                          <div className="w-full h-full flex flex-col justify-center px-4 space-y-1.5 opacity-90 group-hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-[#F1B400] uppercase font-bold flex items-center gap-1">
                                <GraduationCap size={12} /> Nivel Académico
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-950 text-[9px] text-amber-300 font-mono border border-amber-800">4 Niveles</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1 text-center py-1">
                              <div className="bg-zinc-900 p-1 rounded border border-zinc-800">
                                <span className="text-[7px] text-zinc-400 font-mono block">BÁS</span>
                                <span className="text-[9px] font-mono font-bold text-zinc-200">77%</span>
                              </div>
                              <div className="bg-zinc-900 p-1 rounded border border-zinc-800">
                                <span className="text-[7px] text-zinc-400 font-mono block">DIV</span>
                                <span className="text-[9px] font-mono font-bold text-zinc-200">79%</span>
                              </div>
                              <div className="bg-zinc-900 p-1 rounded border border-zinc-800">
                                <span className="text-[7px] text-zinc-400 font-mono block">TSU</span>
                                <span className="text-[9px] font-mono font-bold text-[#F1B400]">81%</span>
                              </div>
                              <div className="bg-zinc-900 p-1 rounded border border-zinc-800">
                                <span className="text-[7px] text-zinc-400 font-mono block">UNI</span>
                                <span className="text-[9px] font-mono font-bold text-emerald-400">83%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 border-t border-zinc-800/80 pt-1">
                              <span className="text-zinc-300 font-medium">Box Plot + Slicers</span>
                              <span className="text-[#F1B400] font-bold">Import CSV / XLSX</span>
                            </div>
                          </div>
                        )}

                        <div className="absolute top-2.5 right-2.5">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${card.badgeClass}`}>
                            {card.badge}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 group-hover:bg-[#F1B400] group-hover:text-black flex items-center justify-center transition-colors">
                            <Icon size={15} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black uppercase text-zinc-950 tracking-tight leading-tight group-hover:text-[#D99C00] transition-colors">
                              {card.title}
                            </h3>
                            <span className="text-[10px] font-mono text-zinc-400 block">
                              {card.subtitle}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="px-5 pb-5 pt-2">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-50 group-hover:bg-zinc-950 text-zinc-800 group-hover:text-white border border-zinc-200 group-hover:border-zinc-950 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <span>{card.buttonText}</span>
                        <ChevronRight size={14} className="text-[#D99C00] group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
