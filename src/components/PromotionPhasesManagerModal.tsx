import React, { useState } from 'react';
import { PromotionDossier, EmployeeInfo, BigFiveResult } from '../types';
import { PsychometricTestForm } from './PsychometricTestForm';
import { X, Sparkles, Award, CheckCircle, Brain, FileText, ChevronRight } from 'lucide-react';

interface PromotionPhasesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeInfo: EmployeeInfo;
  existingDossier?: PromotionDossier;
  onSaveDossier: (dossier: PromotionDossier) => void;
}

export function PromotionPhasesManagerModal({
  isOpen,
  onClose,
  employeeInfo,
  existingDossier,
  onSaveDossier
}: PromotionPhasesManagerModalProps) {
  if (!isOpen) return null;

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [targetPosition, setTargetPosition] = useState(
    existingDossier?.targetPosition || employeeInfo.targetPromotionPosition || 'Encargado de Tienda'
  );
  const [targetDepartment, setTargetDepartment] = useState(
    existingDossier?.targetDepartment || 'Red Nacional de Tiendas'
  );

  // Phase 1
  const [interviewScore, setInterviewScore] = useState(existingDossier?.phase1.interviewScore || 4.5);
  const [interviewerComments, setInterviewerComments] = useState(
    existingDossier?.phase1.interviewerComments || 'Postulante con excelente madurez conductual y orientación al logro.'
  );
  const [maturityAssessment, setMaturityAssessment] = useState(
    existingDossier?.phase1.maturityAssessment || 'Madurez Alta. Demuestra lealtad institucional y autocontrol.'
  );
  const [bigFiveResults, setBigFiveResults] = useState<BigFiveResult | undefined>(
    existingDossier?.phase1.bigFiveResults
  );
  const [showBigFiveTest, setShowBigFiveTest] = useState(false);

  // Phase 2
  const [situationalScore, setSituationalScore] = useState(existingDossier?.phase2.situationalScore || 4.75);
  const [aiAnalysis, setAiAnalysis] = useState(
    existingDossier?.phase2.aiAnalysis || 'Análisis mediante Gemini 3.8 Flash confirma 95% de adecuación conductual y técnica con el perfil.'
  );

  // Phase 3
  const [committeeObservations, setCommitteeObservations] = useState(
    existingDossier?.phase3.committeeObservations || 'Comité de Promociones aprueba de forma unánime su postulación.'
  );
  const [authorized, setAuthorized] = useState(existingDossier?.phase3.authorizedByCommittee ?? true);

  // Calculate final score
  const finalScore = Number(((interviewScore * 0.4) + (situationalScore * 0.6)).toFixed(2));
  const verdict = finalScore >= 4.50
    ? 'Altamente Idóneo / Prioritario'
    : finalScore >= 3.75
    ? 'Elegible / Apto'
    : 'En Desarrollo / Requiere Maduración';

  const handleSave = () => {
    const newDossier: PromotionDossier = {
      candidateId: employeeInfo.id || employeeInfo.idNumber,
      targetPosition,
      targetDepartment,
      phase1: {
        interviewScore,
        interviewerComments,
        maturityAssessment,
        bigFiveResults: bigFiveResults || {
          raw: { openness: 4.5, conscientiousness: 4.8, extraversion: 4.6, agreeableness: 4.7, emotional_stability: 4.5 },
          normalized: { openness: 88, conscientiousness: 95, extraversion: 90, agreeableness: 92, emotional_stability: 88 },
          interpretations: {
            openness: 'Alta receptividad e innovación',
            conscientiousness: 'Elevada disciplina y compromiso',
            extraversion: 'Liderazgo visible y empatía',
            agreeableness: 'Excelente espíritu de equipo',
            emotional_stability: 'Resiliencia ante presión de tienda'
          },
          suitabilityScore: 4.62
        },
        completed: true
      },
      phase2: {
        situationalScore,
        questionsApplied: [],
        candidateAnswers: {},
        aiAnalysis,
        completed: true
      },
      phase3: {
        finalScore,
        verdict: verdict as any,
        committeeObservations,
        authorizedByCommittee: authorized,
        approvalDate: new Date().toISOString().split('T')[0]
      }
    };

    onSaveDossier(newDossier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-zinc-300 shadow-2xl flex flex-col text-zinc-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 bg-zinc-50 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F1B400]"></span>
            <div>
              <h3 className="text-sm font-black uppercase text-zinc-950 tracking-wider">
                Gestor del Concurso de Promoción Interna
              </h3>
              <p className="text-[11px] text-zinc-500">
                Postulante: <strong className="text-zinc-800">{employeeInfo.firstName} {employeeInfo.lastName}</strong> ({employeeInfo.position})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Phase Stepper */}
        <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-100/70 text-xs font-mono font-bold select-none">
          <button
            onClick={() => setActiveStep(1)}
            className={`p-3 text-center transition-colors border-r border-zinc-200 ${
              activeStep === 1 ? 'bg-white text-zinc-950 border-b-2 border-b-[#F1B400]' : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            Fase 1: Entrevista & Predisposición Conductual
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`p-3 text-center transition-colors border-r border-zinc-200 ${
              activeStep === 2 ? 'bg-white text-zinc-950 border-b-2 border-b-[#F1B400]' : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            Fase 2: Prueba Situacional IA
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`p-3 text-center transition-colors ${
              activeStep === 3 ? 'bg-white text-zinc-950 border-b-2 border-b-[#F1B400]' : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            Fase 3: Dictamen de Comité
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Target Position Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Cargo al que Postula</label>
              <input
                type="text"
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Dirección / Tienda Destino</label>
              <input
                type="text"
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs text-zinc-900"
              />
            </div>
          </div>

          {/* Step 1: Phase 1 */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-zinc-950">
                  Fase 1: Entrevista de Postulación y Madurez
                </h4>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-zinc-500">Puntaje (1-5):</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.05"
                    value={interviewScore}
                    onChange={(e) => setInterviewScore(Number(e.target.value))}
                    className="w-16 p-1 border border-zinc-300 rounded text-center font-bold text-zinc-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Observaciones de la Entrevista y Compatibilidad Cultural
                </label>
                <textarea
                  rows={3}
                  value={interviewerComments}
                  onChange={(e) => setInterviewerComments(e.target.value)}
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs text-zinc-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Dictamen de Madurez Conductual
                </label>
                <input
                  type="text"
                  value={maturityAssessment}
                  onChange={(e) => setMaturityAssessment(e.target.value)}
                  className="w-full p-2 border border-zinc-300 rounded-lg text-xs text-zinc-900 bg-white"
                />
              </div>

              {/* Big Five launcher */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Brain size={15} /> Medición de Predisposición Conductual y Adecuación al nuevo Cargo (20 Reactivos)
                  </h5>
                  <span className="text-[11px] text-amber-800">
                    {bigFiveResults ? `Procesado: Idoneidad ${bigFiveResults.suitabilityScore.toFixed(2)} pts` : 'No procesado aún'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBigFiveTest(!showBigFiveTest)}
                  className="px-3 py-1.5 bg-[#F1B400] text-black font-bold uppercase text-[10px] rounded-lg hover:bg-amber-500"
                >
                  {showBigFiveTest ? 'Ocultar Test' : 'Aplicar Cuestionario'}
                </button>
              </div>

              {showBigFiveTest && (
                <PsychometricTestForm
                  candidateName={`${employeeInfo.firstName} ${employeeInfo.lastName}`}
                  candidateId={employeeInfo.id || employeeInfo.idNumber}
                  onComplete={(res) => {
                    setBigFiveResults(res);
                    setShowBigFiveTest(false);
                  }}
                />
              )}
            </div>
          )}

          {/* Step 2: Phase 2 */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-zinc-950 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#D99C00]" /> Fase 2: Prueba Técnica Situacional (Gemini 3.8 Flash)
                </h4>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-zinc-500">Puntaje Técnico (1-5):</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.05"
                    value={situationalScore}
                    onChange={(e) => setSituationalScore(Number(e.target.value))}
                    className="w-16 p-1 border border-zinc-300 rounded text-center font-bold text-zinc-900 bg-white"
                  />
                </div>
              </div>

              <p className="text-xs text-zinc-600">
                La prueba técnica situacional evalúa la resolución de 5 incidentes críticos del cargo aspirado bajo la rúbrica calibrada de 4 niveles (A: 5.0, B: 3.75, C: 2.50, D: 1.25).
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Dictamen de Análisis por Inteligencia Artificial
                </label>
                <textarea
                  rows={4}
                  value={aiAnalysis}
                  onChange={(e) => setAiAnalysis(e.target.value)}
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs text-zinc-900 bg-white"
                />
              </div>
            </div>
          )}

          {/* Step 3: Phase 3 */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-zinc-950">
                  Fase 3: Dictamen de Idoneidad y Aprobación de Comité
                </h4>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 font-mono block">Ponderación Consolidada</span>
                  <span className="text-base font-mono font-black text-zinc-950">{finalScore.toFixed(2)} / 5.00 pts</span>
                </div>
              </div>

              {/* Verdict box */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-300 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Veredicto Calculado</span>
                <span className="text-sm font-black text-zinc-950 uppercase tracking-tight block">
                  {verdict}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  {finalScore >= 4.50 ? '>= 4.50 pts: Prioritario para Promoción' : finalScore >= 3.75 ? '3.75 - 4.49 pts: Elegible / Apto' : '< 3.75 pts: Requiere Maduración'}
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Observaciones Formales del Comité de Ascensos
                </label>
                <textarea
                  rows={3}
                  value={committeeObservations}
                  onChange={(e) => setCommitteeObservations(e.target.value)}
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs text-zinc-900 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="authCommitte"
                  checked={authorized}
                  onChange={(e) => setAuthorized(e.target.checked)}
                  className="w-4 h-4 accent-[#F1B400] rounded"
                />
                <label htmlFor="authCommitte" className="text-xs font-bold text-zinc-800 cursor-pointer">
                  Acta firmada y aprobada por los miembros del Comité de Ascensos y Dirección de Talento Humano
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between rounded-b-2xl">
          <div className="flex gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                className="px-3 py-1.5 text-xs font-bold text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-100"
              >
                Anterior
              </button>
            )}
            {activeStep < 3 && (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                className="px-4 py-1.5 text-xs font-bold text-zinc-950 bg-zinc-200 hover:bg-zinc-300 rounded-lg flex items-center gap-1"
              >
                Siguiente <ChevronRight size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-300 text-zinc-700 text-xs font-bold rounded-lg hover:bg-zinc-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#F1B400] hover:text-black transition-colors shadow-md"
            >
              Guardar Expediente de Promoción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
