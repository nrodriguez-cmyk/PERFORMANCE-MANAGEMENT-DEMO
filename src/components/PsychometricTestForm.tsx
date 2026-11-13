import React, { useState } from 'react';
import { BIG_FIVE_20_ITEMS } from '../promotionQuestions';
import { processBigFiveScores, LikertScores } from '../utils/psychometricProcessor';
import { BigFiveResult } from '../types';
import { Brain, CheckCircle, Award } from 'lucide-react';

interface PsychometricTestFormProps {
  candidateName: string;
  candidateId: string;
  onComplete: (result: BigFiveResult) => void;
  initialAnswers?: LikertScores;
}

export function PsychometricTestForm({
  candidateName = 'Postulante',
  onComplete,
  initialAnswers = {}
}: PsychometricTestFormProps) {
  const [answers, setAnswers] = useState<LikertScores>(() => {
    const defaultAnswers: LikertScores = {};
    BIG_FIVE_20_ITEMS.forEach(item => {
      defaultAnswers[item.id] = initialAnswers[item.id] || 4; // pre-filled or 4
    });
    return defaultAnswers;
  });

  const [submitted, setSubmitted] = useState(false);

  const handleScoreSelect = (itemId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [itemId]: score }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = processBigFiveScores(answers);
    setSubmitted(true);
    onComplete(result);
  };

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / BIG_FIVE_20_ITEMS.length) * 100);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-zinc-900 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-[#D99C00]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
              Medición de Predisposición Conductual y Adecuación al nuevo Cargo (20 Reactivos)
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Fase 1: Evaluación psicométrica estandarizada de 5 factores de personalidad laboral (O, C, E, A, N).
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-zinc-800">
            {answeredCount} / {BIG_FIVE_20_ITEMS.length} respondidos
          </span>
          <div className="w-32 h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-[#F1B400]" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-xs text-amber-950 mb-6">
        <strong>Instrucciones al Postulante:</strong> Indique con honestidad el grado en que cada afirmación describe su forma habitual de actuar y pensar en su entorno de trabajo, desde 1 (Totalmente en Desacuerdo) hasta 5 (Totalmente de Acuerdo).
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {BIG_FIVE_20_ITEMS.map((item) => {
          const currentVal = answers[item.id] || 3;

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors bg-white flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold text-zinc-400">
                    Item #{item.number}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                    {item.traitName}
                  </span>
                </div>
                <p className="text-xs text-zinc-800 font-medium">
                  {item.text}
                </p>
              </div>

              {/* 1-5 Likert Radio Group */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                <span className="text-[9px] text-zinc-400 uppercase font-mono mr-1 hidden sm:inline">Desacuerdo</span>
                {[1, 2, 3, 4, 5].map((score) => {
                  const isChecked = currentVal === score;
                  return (
                    <button
                      type="button"
                      key={score}
                      onClick={() => handleScoreSelect(item.id, score)}
                      className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                        isChecked
                          ? 'bg-[#F1B400] text-black ring-2 ring-amber-400 shadow-xs'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {score}
                    </button>
                  );
                })}
                <span className="text-[9px] text-zinc-400 uppercase font-mono ml-1 hidden sm:inline">Acuerdo</span>
              </div>
            </div>
          );
        })}

        {/* Action Button */}
        <div className="pt-4 border-t border-zinc-200 flex justify-end items-center gap-3">
          {submitted && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle size={14} /> Respuestas procesadas y guardadas
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800 transition-colors shadow-md flex items-center gap-2"
          >
            <Award size={14} className="text-[#F1B400]" /> Procesar y Calcular Perfil Psicométrico
          </button>
        </div>
      </form>
    </div>
  );
}
