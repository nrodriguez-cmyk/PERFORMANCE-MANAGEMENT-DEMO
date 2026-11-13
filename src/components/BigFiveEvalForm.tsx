import React from 'react';
import { BIG_FIVE_20_ITEMS, BigFiveItem } from '../promotionQuestions';
import { processBigFiveScores } from '../utils/psychometricProcessor';
import { Brain, CheckCircle2, HelpCircle } from 'lucide-react';
import { BigFiveTrait } from '../types';

interface BigFiveEvalFormProps {
  responses: Record<string, number>;
  onChange: (responses: Record<string, number>) => void;
  readOnly?: boolean;
  theme?: 'dark' | 'light';
}

const SCALE_LABELS = [
  { value: 1, label: 'Totalmente en desacuerdo', shortLabel: '1 - Total desacuerdo' },
  { value: 2, label: 'En desacuerdo', shortLabel: '2 - En desacuerdo' },
  { value: 3, label: 'Neutral / Ocasional', shortLabel: '3 - Neutral / Ocasional' },
  { value: 4, label: 'De acuerdo', shortLabel: '4 - De acuerdo' },
  { value: 5, label: 'Totalmente de acuerdo', shortLabel: '5 - Total acuerdo' },
];

export function BigFiveEvalForm({
  responses,
  onChange,
  readOnly = false,
  theme = 'dark'
}: BigFiveEvalFormProps) {
  const isDark = theme === 'dark';

  const handleSelect = (itemId: string, val: number) => {
    if (readOnly) return;
    onChange({
      ...responses,
      [itemId]: val
    });
  };

  const answeredCount = BIG_FIVE_20_ITEMS.filter(it => Boolean(responses[it.id])).length;
  const progressPercent = Math.round((answeredCount / BIG_FIVE_20_ITEMS.length) * 100);

  // Group items by trait
  const traitsOrder: { key: BigFiveTrait; name: string; desc: string }[] = [
    { key: 'openness', name: 'Apertura a la Experiencia', desc: 'Curiosidad intelectual, creatividad, adaptabilidad ante nuevos métodos e innovación.' },
    { key: 'conscientiousness', name: 'Responsabilidad y Disciplina', desc: 'Orientación al logro, minuciosidad, orden operativo y cumplimiento sin supervisión.' },
    { key: 'extraversion', name: 'Extraversión y Energía Social', desc: 'Dinamismo comunicativo, entusiasmo, seguridad en público y asertividad relacional.' },
    { key: 'agreeableness', name: 'Amabilidad y Cooperación', desc: 'Empatía genuina, espíritu colaborativo, mediación de conflictos y apoyo mutuo.' },
    { key: 'emotional_stability', name: 'Estabilidad Emocional', desc: 'Templanza bajo presión, serenidad, autocontrol ante contingencias y resiliencia.' }
  ];

  return (
    <div className="space-y-6">
      {/* INSTRUCCIONES DE LA EVALUACIÓN */}
      <div className={`p-4 sm:p-5 rounded-2xl border-l-4 border-[#F1B400] shadow-sm space-y-3 transition-colors duration-200 ${
        isDark 
          ? 'bg-zinc-900/90 text-white border-y border-r border-zinc-800' 
          : 'bg-amber-50/90 text-zinc-900 border-y border-r border-amber-200/70'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className={`font-mono font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 ${
            isDark ? 'text-[#F1B400]' : 'text-amber-800'
          }`}>
            <Brain size={15} /> Instrucciones de la Evaluación Psicométrica
          </span>
          <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Progreso: <strong className={isDark ? 'text-white' : 'text-zinc-950'}>{answeredCount} de {BIG_FIVE_20_ITEMS.length}</strong>
          </span>
        </div>

        <p className={`text-xs sm:text-[13px] leading-relaxed font-sans text-justify ${
          isDark ? 'text-zinc-200' : 'text-zinc-800'
        }`}>
          A continuación encontrará 20 afirmaciones sobre situaciones, estilos y hábitos de trabajo. Indique con total sinceridad el grado en que cada afirmación describe su comportamiento habitual en el entorno laboral, utilizando la escala del 1 al 5. No existen respuestas correctas o incorrectas; responda según su experiencia real.
        </p>

        {/* Guía visual de la escala */}
        <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-zinc-800' : 'border-amber-200/80'}`}>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
            isDark ? 'text-[#F1B400]' : 'text-amber-800'
          }`}>
            Escala de Valoración:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {SCALE_LABELS.map(s => (
              <div 
                key={s.value} 
                className={`p-2 rounded-xl border text-center transition-colors ${
                  isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-2xs'
                }`}
              >
                <span className={`inline-block w-5 h-5 rounded-full font-mono font-black text-xs leading-5 mb-1 ${
                  isDark ? 'bg-zinc-800 text-[#F1B400]' : 'bg-amber-100 text-amber-900'
                }`}>
                  {s.value}
                </span>
                <p className={`text-[10px] font-medium leading-tight ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <div
            className="bg-[#F1B400] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* REACTIVOS CON SUS OPCIONES DE RESPUESTA (LISTADO SECUENCIAL DEL 1 AL 20) */}
      <div className="space-y-4">
        {BIG_FIVE_20_ITEMS.map((item) => {
          const selectedVal = responses[item.id] || 0;
          const isAnswered = selectedVal > 0;

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
                isDark
                  ? (isAnswered
                      ? 'bg-zinc-900/90 border-zinc-700 shadow-xs'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700')
                  : (isAnswered
                      ? 'bg-white border-amber-300 shadow-xs ring-1 ring-amber-300/40'
                      : 'bg-white border-zinc-200 hover:border-zinc-300')
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                      isDark ? 'bg-zinc-800 text-amber-400 border border-zinc-700' : 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                    }`}>
                      Pregunta {item.number} de {BIG_FIVE_20_ITEMS.length}
                    </span>
                    {isAnswered && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${
                        isDark ? 'text-emerald-400' : 'text-emerald-700'
                      }`}>
                        <CheckCircle2 size={12} /> Respondido ({selectedVal}/5)
                      </span>
                    )}
                  </div>
                  <p className={`text-xs sm:text-[13px] leading-relaxed font-sans ${
                    isDark ? 'text-zinc-100' : 'text-zinc-900 font-medium'
                  }`}>
                    {item.text}
                  </p>
                </div>

                {/* Escala de Radio Buttons 1 a 5 */}
                <div className="flex items-center gap-1.5 sm:gap-2 self-center sm:self-auto shrink-0 pt-2 md:pt-0">
                  {SCALE_LABELS.map((s) => {
                    const isSelected = selectedVal === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        disabled={readOnly}
                        onClick={() => handleSelect(item.id, s.value)}
                        title={s.label}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center transition-all border cursor-pointer ${
                          isSelected
                            ? (isDark
                                ? 'bg-[#F1B400] text-black border-[#F1B400] scale-110 shadow-lg ring-2 ring-amber-400/50 z-10'
                                : 'bg-[#F1B400] text-black border-[#F1B400] scale-110 shadow-md ring-2 ring-amber-300 z-10')
                            : (isDark
                                ? 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-[#F1B400] hover:text-[#F1B400]'
                                : 'bg-white text-zinc-700 border-zinc-300 hover:border-[#F1B400] hover:bg-amber-50/50')
                        }`}
                      >
                        {s.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
