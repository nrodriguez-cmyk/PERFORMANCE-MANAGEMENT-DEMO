import React, { useState, useEffect } from 'react';
import { EvaluationData, EmployeeInfo, PdiGoal, PdiBreach } from '../types';
import { CanguroCollaborator, savePilotEvaluation, clearPilotEvaluation } from '../data/canguroUniverso';
import { resolveEmployeeCompetencyProfile } from '../data/canguroCompetencyDictionary';
import { PotentialLeadershipEvalForm } from './PotentialLeadershipEvalForm';
import {
  X, CheckCircle2, Award, Target, Star, AlertTriangle, Sparkles,
  RefreshCw, Save, ShieldCheck, UserCheck, Users, HelpCircle
} from 'lucide-react';

interface PilotEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborator: CanguroCollaborator;
  onSaveSuccess: (updatedCollab: CanguroCollaborator) => void;
}

export function PilotEvaluationModal({
  isOpen,
  onClose,
  collaborator,
  onSaveSuccess
}: PilotEvaluationModalProps) {
  const [selectedRole, setSelectedRole] = useState<'supervisor' | 'self' | 'peer' | 'subordinate'>('supervisor');

  const positionsWithSubordinates = ['Coordinador', 'Supervisor', 'Gerente', 'Director'];
  const hasSubordinates = positionsWithSubordinates.includes(collaborator.info.position);

  // Current evaluation data being edited for this role
  const getActiveEval = (role: 'supervisor' | 'self' | 'peer' | 'subordinate'): EvaluationData => {
    if (role === 'supervisor') return collaborator.supervisorEval || { scores: {}, comments: '' };
    if (role === 'self') return collaborator.selfEval || { scores: {}, comments: '' };
    if (role === 'peer') return collaborator.peerEval || { scores: {}, comments: '' };
    return collaborator.subordinateEval || { scores: {}, comments: '' };
  };

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<string>('');
  const [evaluatorName, setEvaluatorName] = useState<string>('');
  const [evaluatorPosition, setEvaluatorPosition] = useState<string>('');

  // Load scores when role changes
  useEffect(() => {
    const current = getActiveEval(selectedRole);
    setScores(current.scores || {});
    setComments(current.comments || '');
    setEvaluatorName(current.evaluatorName || (selectedRole === 'supervisor' ? 'Jefatura Inmediata' : (selectedRole === 'self' ? `${collaborator.info.firstName} ${collaborator.info.lastName}` : '')));
    setEvaluatorPosition(selectedRole === 'supervisor' ? 'Supervisor Inmediato' : (selectedRole === 'self' ? collaborator.info.position : 'Par Homólogo'));
  }, [selectedRole, collaborator]);

  if (!isOpen) return null;

  // Operational Goals (Bloque 1 - 60%)
  const operationalGoals = [
    {
      id: 'meta_1',
      title: 'Meta 1: Cumplimiento de Objetivos Operacionales y Entregables',
      desc: 'Nivel de ejecución de las metas cuantitativas asignadas y puntualidad en los entregables del área.'
    },
    {
      id: 'meta_2',
      title: 'Meta 2: Exactitud Técnica, Calidad y Rigor Normativo',
      desc: 'Adherencia estricta a los manuales corporativos Universo Canguro y control de cero errores en los procesos.'
    },
    {
      id: 'meta_3',
      title: 'Meta 3: Eficiencia en Cronogramas y Tiempos de Respuesta',
      desc: 'Capacidad de resolución oportuna ante requerimientos del área sin demoras injustificadas.'
    },
    {
      id: 'meta_4',
      title: 'Meta 4: Custodia de Recursos, Activos y Control de Mermas/Costos',
      desc: 'Uso racional y cuidadoso de los activos, inventarios o presupuestos confiados bajo su responsabilidad.'
    },
    {
      id: 'meta_5',
      title: 'Meta 5: Reporte de Gestión, Trazabilidad y Solución de Incidencias',
      desc: 'Registro confiable de actividades en sistemas institucionales y proactividad ante contingencias.'
    }
  ];

  // Resuelve el perfil oficial de competencias (Modelo DTH-GFD-MC-01)
  const profile = resolveEmployeeCompetencyProfile(collaborator.info.position, collaborator.info.directorate);

  // 1. Competencias Cardinales (5) - Aplicables a todos los colaboradores
  const cardinalCompetencies = (profile?.cardinalCompetencies || []).map(c => ({
    id: c.id,
    title: c.name,
    desc: c.definition
  }));

  // 2. Competencias Gerenciales y/o de Supervisión (3) - Exclusivo: Coordinador, Supervisor, Gerente
  const supervisionCompetencies = (profile?.supervisionCompetencies || []).map(c => ({
    id: c.id,
    title: c.name,
    desc: c.definition
  }));

  // 3. Competencias de Junta Directiva (3) - Exclusivo: Director
  const boardCompetencies = (profile?.boardCompetencies || []).map(c => ({
    id: c.id,
    title: c.name,
    desc: c.definition
  }));

  // 4. Competencias Específicas por Área (3) - Según la Dirección
  const areaCompetencies = (profile?.areaCompetencies || []).map(c => ({
    id: c.id,
    title: c.name,
    desc: c.definition
  }));

  const handleScoreChange = (id: string, val: number) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  // Quick preset loader for demo testing
  const handleLoadPreset = (presetType: 'alto' | 'sobresaliente' | 'brechas') => {
    let b1Score = 4.3;
    let b2Score = 4.4;
    let comm = 'Desempeño consistente y confiable durante el período evaluado.';

    if (presetType === 'sobresaliente') {
      b1Score = 4.9;
      b2Score = 4.85;
      comm = 'Desempeño excepcional y sobresaliente. Supera con creces las metas operativas y modela los valores Canguro con liderazgo natural.';
    } else if (presetType === 'brechas') {
      b1Score = 3.4;
      b2Score = 3.3;
      comm = 'Cumplimiento aceptable pero con brechas evidentes en puntualidad operativa y comunicación técnica que deben ser fortalecidas mediante PDI.';
    }

    const newScores: Record<string, number> = {};

    if (selectedRole === 'self') {
      // La Autoevaluación evalúa ÚNICAMENTE las Competencias Conductuales
      profile.activeCompetencies.forEach(c => {
        newScores[c.id] = b2Score;
      });
    } else {
      // Supervisor, Pares y Subordinados evalúan ÚNICAMENTE Desempeño (KPIs) y Potencial (Liderazgo)
      operationalGoals.forEach(g => {
        newScores[g.id] = b1Score;
      });

      // Carga de los 18 reactivos de Potencial y Liderazgo (Eje Y)
      for (let i = 1; i <= 18; i++) {
        if (presetType === 'sobresaliente') {
          newScores[`pot_${i}`] = i % 4 === 0 ? 4 : 5;
        } else if (presetType === 'brechas') {
          newScores[`pot_${i}`] = i % 2 === 0 ? 2 : 3;
        } else {
          newScores[`pot_${i}`] = i % 3 === 0 ? 5 : 4;
        }
      }
    }

    setScores(newScores);
    setComments(comm);
  };

  // Submit and save evaluation
  const handleSaveEvaluation = () => {
    const updatedEval: EvaluationData = {
      scores,
      comments: comments.trim() || 'Evaluación registrada durante la prueba piloto institucional.',
      evaluatorName: evaluatorName.trim() || (selectedRole === 'supervisor' ? 'Supervisor Inmediato' : 'Colaborador'),
      evaluatorRole: selectedRole,
      submittedAt: new Date().toISOString(),
      isLocked: true
    };

    // Build updated collaborator
    const updatedCollab: CanguroCollaborator = {
      ...collaborator,
      selfEval: selectedRole === 'self' ? updatedEval : (collaborator.selfEval || { scores: {}, comments: '' }),
      supervisorEval: selectedRole === 'supervisor' ? updatedEval : (collaborator.supervisorEval || { scores: {}, comments: '' }),
      peerEval: selectedRole === 'peer' ? updatedEval : (collaborator.peerEval || { scores: {}, comments: '' }),
      subordinateEval: selectedRole === 'subordinate' ? updatedEval : (collaborator.subordinateEval || { scores: {}, comments: '' }),
    };

    // Detect real breaches from scores < 3.75 to populate genuine PDI breaches
    const generatedBreaches: PdiBreach[] = [];
    Object.entries(scores).forEach(([key, val]) => {
      if (typeof val === 'number' && val > 0 && val < 3.75) {
        let label = key;
        const foundGoal = operationalGoals.find(g => g.id === key);
        const foundComp = profile.activeCompetencies.find(c => c.id === key);
        if (foundGoal) label = foundGoal.title;
        else if (foundComp) label = `${foundComp.name} (${foundComp.clusterLabel})`;

        // NOTA: los campos targetLevel/currentLevel/gapScore/priority/suggestedAction no pertenecen a PdiBreach
        // (que exige skills/identifiedGap/estimatedTime); se conservan en el objeto persistido sin cambios de comportamiento.
        generatedBreaches.push({
          id: `breach-${key}`,
          competency: label,
          targetLevel: 'Nivel Alto (Estándar 3.75 pts)',
          currentLevel: val < 2.5 ? 'Nivel Inicial (En Desarrollo)' : 'Nivel Intermedio (Regular)',
          gapScore: Number((3.75 - val).toFixed(2)),
          priority: val < 2.5 ? 'Alta' : 'Media',
          suggestedAction: `Reforzar la competencia mediante tutoría semanal, práctica en el puesto (70%) y formación corporativa (10%).`
        } as unknown as PdiBreach);
      }
    });

    if (generatedBreaches.length > 0) {
      updatedCollab.pdiBreaches = generatedBreaches;
    }

    // Persist in localStorage
    savePilotEvaluation(collaborator.info.id, {
      selfEval: updatedCollab.selfEval,
      supervisorEval: updatedCollab.supervisorEval,
      peerEval: updatedCollab.peerEval,
      subordinateEval: updatedCollab.subordinateEval,
      pdiBreaches: updatedCollab.pdiBreaches
    });

    onSaveSuccess(updatedCollab);
    onClose();
  };

  const handleClearCurrent = () => {
    if (confirm(`¿Desea limpiar las calificaciones de ${collaborator.info.firstName} ${collaborator.info.lastName}?`)) {
      clearPilotEvaluation(collaborator.info.id);
      const resetCollab: CanguroCollaborator = {
        ...collaborator,
        selfEval: { scores: {}, comments: '', isLocked: false, evaluatorRole: 'self' },
        supervisorEval: { scores: {}, comments: '', isLocked: false, evaluatorRole: 'supervisor' },
        peerEval: { scores: {}, comments: '', isLocked: false, evaluatorRole: 'peer' },
        subordinateEval: { scores: {}, comments: '', isLocked: false, evaluatorRole: 'subordinate' },
        pdiGoals: [],
        pdiBreaches: [],
        promotionDossier: undefined
      };
      setScores({});
      setComments('');
      onSaveSuccess(resetCollab);
      onClose();
    }
  };

  const scaleValues = [
    { val: 1.0, label: '1 - Inicial', sub: 'En Desarrollo Crítico', color: 'hover:bg-red-500 hover:text-white', active: 'bg-red-600 text-white' },
    { val: 2.0, label: '2 - Mínimo', sub: 'Brechas Notorias', color: 'hover:bg-orange-500 hover:text-white', active: 'bg-orange-500 text-white' },
    { val: 3.0, label: '3 - Aceptable', sub: 'Estándar Promedio', color: 'hover:bg-amber-500 hover:text-black', active: 'bg-amber-400 text-black font-bold' },
    { val: 4.0, label: '4 - Alto', sub: 'Supera el Estándar', color: 'hover:bg-blue-600 hover:text-white', active: 'bg-blue-600 text-white font-bold' },
    { val: 5.0, label: '5 - Sobresaliente', sub: 'Referente Institucional', color: 'hover:bg-emerald-600 hover:text-white', active: 'bg-emerald-600 text-white font-bold' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-zinc-900 font-sans">
        
        {/* MODAL HEADER */}
        <div className="bg-zinc-950 text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#F1B400]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F1B400] animate-pulse"></span>
              <span className="text-[11px] font-mono uppercase font-bold text-[#F1B400] tracking-wider">
                🧪 Instrumento Oficial de Prueba Piloto — Evaluación en Tiempo Real
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white mt-0.5">
              Evaluando a: {collaborator.info.firstName} {collaborator.info.lastName}
            </h2>
            <p className="text-xs text-zinc-300 font-mono">
              {collaborator.info.position} • {collaborator.info.department} • C.I. {collaborator.info.idNumber}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* ROLE SELECTION TABS & DEMO PRESET TOOLBAR */}
        <div className="bg-zinc-100 p-3 sm:px-6 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-zinc-700 uppercase">
              Rol Evaluador:
            </span>
            <div className="flex rounded-lg bg-zinc-200 p-1 gap-1">
              <button
                type="button"
                onClick={() => setSelectedRole('supervisor')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  selectedRole === 'supervisor' ? 'bg-zinc-950 text-[#F1B400] shadow-xs' : 'text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                👔 Supervisor Inmediato (Desempeño + Potencial)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('self')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  selectedRole === 'self' ? 'bg-zinc-950 text-[#F1B400] shadow-xs' : 'text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                📝 Autoevaluación (Únicamente Competencias)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('peer')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  selectedRole === 'peer' ? 'bg-zinc-950 text-[#F1B400] shadow-xs' : 'text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                👥 Pares (Desempeño + Potencial)
              </button>
              {hasSubordinates && (
                <button
                  type="button"
                  onClick={() => setSelectedRole('subordinate')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    selectedRole === 'subordinate' ? 'bg-zinc-950 text-[#F1B400] shadow-xs' : 'text-zinc-700 hover:bg-zinc-300'
                  }`}
                >
                  🤝 Subordinados (Desempeño + Potencial)
                </button>
              )}
            </div>
          </div>

          {/* Quick presets for faster demo testing */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-zinc-500 font-bold hidden md:inline">
              ⚡ Carga Rápida:
            </span>
            <button
              type="button"
              onClick={() => handleLoadPreset('alto')}
              className="text-[11px] font-bold px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 transition-colors cursor-pointer"
              title="Cargar puntajes para Alto Desempeño (Tramo 4)"
            >
              Alto Desempeño (4.4 pts)
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('sobresaliente')}
              className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 transition-colors cursor-pointer"
              title="Cargar puntajes para Sobresaliente (Tramo 5 / Sucesión)"
            >
              ⭐ Sobresaliente (4.8 pts)
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('brechas')}
              className="text-[11px] font-bold px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-colors cursor-pointer"
              title="Cargar con brechas para probar generación de PDI"
            >
              ⚠️ Con Brechas PDI (3.3 pts)
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE FORM) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          
          {/* BANNER INFORMATIVO SEGÚN EL ROL DE EVALUACIÓN */}
          {selectedRole === 'self' ? (
            <div className="p-4 rounded-xl bg-amber-50/80 border-2 border-amber-300 text-amber-950 text-xs flex items-start gap-3 shadow-2xs">
              <span className="text-xl shrink-0">📝</span>
              <div className="space-y-1">
                <strong className="block font-black uppercase tracking-wider text-amber-950 font-mono">
                  Autoevaluación: Únicamente Evaluación por Competencias (30%)
                </strong>
                <p className="text-[11.5px] text-amber-900 leading-relaxed">
                  De acuerdo con el modelo institucional de Universo Canguro, en la <strong>Autoevaluación</strong> el colaborador evalúa <strong>únicamente sus competencias conductuales</strong>. Esto permite establecer su ubicación en los <strong>4 niveles de dominio</strong> del Modelo Canguro y mapear con exactitud las <strong>brechas identificadas</strong> frente al estándar requerido para su cargo.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-950 text-white border-2 border-zinc-800 text-xs flex items-start gap-3 shadow-2xs">
              <span className="text-xl shrink-0">👔</span>
              <div className="space-y-1">
                <strong className="block font-black uppercase tracking-wider text-[#F1B400] font-mono">
                  {selectedRole === 'supervisor' ? 'Evaluación del Supervisor Inmediato' : selectedRole === 'peer' ? 'Evaluación de Pares' : 'Evaluación de Subordinados'}: Desempeño (60%) y Potencial (10%)
                </strong>
                <p className="text-[11.5px] text-zinc-300 leading-relaxed">
                  En esta modalidad se evalúa <strong>únicamente el Desempeño cuantitativo</strong> (cumplimiento de indicadores y objetivos clave - 60%) y la <strong>Evaluación de Potencial y Liderazgo</strong> (agilidad de aprendizaje, aspiración y tracción de equipos - 10%). La evaluación por competencias corresponde exclusivamente a la autoevaluación del colaborador.
                </p>
              </div>
            </div>
          )}

          {/* BLOQUE 1: METAS OPERATIVAS (60%) — Exclusivo para Supervisor, Pares y Subordinados */}
          {selectedRole !== 'self' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-900">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-zinc-950 text-[#F1B400] font-black font-mono text-xs flex items-center justify-center">
                  B1
                </span>
                <h3 className="font-black text-sm uppercase tracking-wider text-zinc-950">
                  Bloque 1: Evaluación del Desempeño, cumplimiento de indicadores clave
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-950 text-[#F1B400]">
                Ponderación: 60%
              </span>
            </div>

            <div className="space-y-3">
              {operationalGoals.map((goal, idx) => {
                const currentVal = scores[goal.id] || 0;
                return (
                  <div key={goal.id} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-50 transition-colors space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block font-sans">
                          {goal.title}
                        </span>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {goal.desc}
                        </p>
                      </div>
                      <span className={`text-xs font-mono font-black px-2 py-0.5 rounded self-start sm:self-center ${
                        currentVal > 0 ? 'bg-zinc-950 text-[#F1B400]' : 'bg-zinc-200 text-zinc-600'
                      }`}>
                        {currentVal > 0 ? `${currentVal.toFixed(1)} pts` : 'Sin Calificar'}
                      </span>
                    </div>

                    {/* Scale Buttons 1 to 5 */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {scaleValues.map(s => {
                        const isSelected = currentVal === s.val;
                        return (
                          <button
                            key={s.val}
                            type="button"
                            onClick={() => handleScoreChange(goal.id, s.val)}
                            className={`py-1.5 px-1 rounded-lg text-xs font-bold text-center transition-all cursor-pointer border ${
                              isSelected
                                ? `${s.active} border-transparent shadow-xs scale-102`
                                : `bg-white border-zinc-300 text-zinc-800 ${s.color}`
                            }`}
                          >
                            <span className="block">{s.val}.0</span>
                            <span className="text-[9px] font-normal block leading-tight truncate">
                              {s.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* BLOQUE 2: EVALUACIÓN POR COMPETENCIAS (30%) — Exclusivo para Autoevaluación */}
          {selectedRole === 'self' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-900">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#F1B400] text-black font-black font-mono text-xs flex items-center justify-center">
                  B2
                </span>
                <h3 className="font-black text-sm uppercase tracking-wider text-zinc-950">
                  Bloque 2: Evaluación por Competencias
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-950 border border-blue-300">
                Ponderación: 30% ({profile.totalCompetenciesCount} Competencias Activas)
              </span>
            </div>

            {/* Helper para renderizar tarjeta de competencia */}
            {(() => {
              const renderCompCard = (comp: { id: string; title: string; desc: string }, colorClasses: string) => {
                const currentVal = scores[comp.id] || 0;
                return (
                  <div key={comp.id} className={`p-3.5 rounded-xl border ${colorClasses} hover:brightness-98 transition-all space-y-2`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block font-sans">
                          {comp.title}
                        </span>
                        <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">
                          {comp.desc}
                        </p>
                      </div>
                      <span className={`text-xs font-mono font-black px-2 py-0.5 rounded self-start sm:self-center shrink-0 ${
                        currentVal > 0 ? 'bg-zinc-950 text-[#F1B400]' : 'bg-zinc-200 text-zinc-600'
                      }`}>
                        {currentVal > 0 ? `${currentVal.toFixed(1)} pts` : 'Sin Calificar'}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {scaleValues.map(s => {
                        const isSelected = currentVal === s.val;
                        return (
                          <button
                            key={s.val}
                            type="button"
                            onClick={() => handleScoreChange(comp.id, s.val)}
                            className={`py-1.5 px-1 rounded-lg text-xs font-bold text-center transition-all cursor-pointer border ${
                              isSelected
                                ? `${s.active} border-transparent shadow-xs scale-102`
                                : `bg-white border-zinc-300 text-zinc-800 ${s.color}`
                            }`}
                          >
                            <span className="block">{s.val}.0</span>
                            <span className="text-[9px] font-normal block leading-tight truncate">
                              {s.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              };

              return (
                <div className="space-y-4">
                  {/* Sub-bloque 2.1: Cardinales (5) */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono font-bold uppercase text-zinc-600 block">
                      • Competencias Cardinales (5) — Aplicables a todos los colaboradores (Modelo Canguro DTH-GFD-MC-01)
                    </span>
                    {cardinalCompetencies.map(c => renderCompCard(c, 'border-zinc-200 bg-amber-50/20'))}
                  </div>

                  {/* Sub-bloque 2.2: Supervisión (3) para Coordinador, Supervisor, Gerente */}
                  {profile.isSupervisionEligible && (
                    <div className="space-y-3 pt-1">
                      <span className="text-[11px] font-mono font-bold uppercase text-blue-800 block">
                        • Competencias Gerenciales y/o de Supervisión (3) — Cargo: {collaborator.info.position}
                      </span>
                      {supervisionCompetencies.map(c => renderCompCard(c, 'border-blue-200 bg-blue-50/25'))}
                    </div>
                  )}

                  {/* Sub-bloque 2.2 Alt: Junta Directiva (3) para Director */}
                  {profile.isBoardEligible && (
                    <div className="space-y-3 pt-1">
                      <span className="text-[11px] font-mono font-bold uppercase text-purple-800 block">
                        • Competencias de Junta Directiva (3) — Cargo: {collaborator.info.position}
                      </span>
                      {boardCompetencies.map(c => renderCompCard(c, 'border-purple-200 bg-purple-50/25'))}
                    </div>
                  )}

                  {/* Sub-bloque 2.3: Competencias Específicas por Área (3) */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[11px] font-mono font-bold uppercase text-emerald-800 block">
                      • Competencias Específicas por Área (3) — {collaborator.info.directorate}
                    </span>
                    {areaCompetencies.map(c => renderCompCard(c, 'border-emerald-200 bg-emerald-50/25'))}
                  </div>
                </div>
              );
            })()}
          </div>
          )}

          {/* SECCIÓN 3: EVALUACIÓN DE POTENCIAL Y LIDERAZGO (18 REACTIVOS - 10%) — Exclusivo para Supervisor, Pares y Subordinados */}
          {selectedRole !== 'self' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-900">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#F1B400] text-black font-black font-mono text-xs flex items-center justify-center">
                  S3
                </span>
                <h3 className="font-black text-sm uppercase tracking-wider text-zinc-950">
                  Sección 3: Evaluación de Potencial y Liderazgo (18 Reactivos)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-950 border border-purple-300">
                Ponderación: 10% • Potencial & Liderazgo (Eje Y 9-Box)
              </span>
            </div>

            <PotentialLeadershipEvalForm
              responses={scores}
              onChange={(newScores) => setScores(newScores)}
            />
          </div>
          )}

          {/* OBSERVACIONES */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 font-mono">
              OBSERVACIONES:
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Describa el desempeño del colaborador, fortalezas observadas y áreas de oportunidad para su Plan de Desarrollo Individual..."
              rows={3}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F1B400] font-sans"
            />
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-zinc-100 px-6 py-3.5 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClearCurrent}
            className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer"
          >
            🧹 Limpiar Calificaciones de este Colaborador
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveEvaluation}
              className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-zinc-950 hover:bg-[#F1B400] text-white hover:text-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save size={15} />
              Guardar y Calcular Resultados en Vivo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
