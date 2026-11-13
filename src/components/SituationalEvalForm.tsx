import React from 'react';
import { EvaluationData, Question } from '../types';

interface SituationalEvalFormProps {
  title: string;
  description?: string;
  questions: Question[];
  data: EvaluationData;
  onChange: (data: EvaluationData) => void;
  isSelf?: boolean;
  isSupervisor?: boolean;
  onSubmit?: () => void;
  isSaved?: boolean;
  disabledSubmit?: boolean;
  theme?: 'dark' | 'light';
}

export function SituationalEvalForm({
  title,
  description,
  questions,
  data,
  onChange,
  theme = 'dark'
}: SituationalEvalFormProps) {
  const isDark = theme === 'dark';

  const handleOptionSelect = (questionId: string, optionId: string, score: number) => {
    const checkedBehaviors = data.checkedBehaviors || {};
    
    onChange({
      ...data,
      scores: {
        ...data.scores,
        [questionId]: score
      },
      checkedBehaviors: {
        ...checkedBehaviors,
        [questionId]: [optionId]
      }
    });
  };

  return (
    <div className={`p-4 sm:p-5 text-xs font-sans rounded-2xl border transition-colors duration-200 ${
      isDark 
        ? 'bg-zinc-950/90 border-zinc-800/90 text-zinc-100 shadow-xl' 
        : 'bg-white border-zinc-200 text-zinc-900 shadow-xs'
    }`}>
      {title ? (
        <h2 className={`text-xs font-bold uppercase mb-2 border-b pb-1 font-mono tracking-wider ${
          isDark 
            ? 'text-[#F1B400] border-[#F1B400]/30' 
            : 'text-amber-700 border-amber-200'
        }`}>
          {title}
        </h2>
      ) : null}

      {description ? (
        <p className={`text-[10px] mb-6 italic ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {description}
        </p>
      ) : (
        <div className={`p-4 border-l-4 border-[#F1B400] mb-6 rounded-r-xl transition-colors duration-200 ${
          isDark 
            ? 'bg-zinc-900/90 text-zinc-200 border-zinc-800' 
            : 'bg-amber-50/80 text-amber-950 border-amber-200/60'
        }`}>
          <p className="text-[11px] leading-relaxed">
            En cada reactivo se presenta una situación laboral hipotética. Seleccione la opción de respuesta que mejor describa su reacción o forma de actuar habitual ante este escenario.
          </p>
        </div>
      )}

      <div className="space-y-6 sm:space-y-8">
        {questions.map((q, idx) => {
          const selectedOptionId = data.checkedBehaviors?.[q.id]?.[0];

          return (
            <div 
              key={q.id} 
              className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-zinc-900/80 border-zinc-800/90 shadow-sm' 
                  : 'bg-zinc-50/80 border-zinc-200 shadow-2xs'
              }`}
            >
              <div className="mb-4">
                <div className={`flex items-center justify-between pb-2 mb-3 border-b ${
                  isDark ? 'border-zinc-800' : 'border-zinc-200'
                }`}>
                  <h4 className={`text-sm font-black uppercase tracking-wider font-mono ${
                    isDark ? 'text-[#F1B400]' : 'text-amber-700'
                  }`}>
                    Pregunta {idx + 1}
                  </h4>
                  <span className={`text-[10px] font-mono ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    Pregunta {idx + 1} de {questions.length}
                  </span>
                </div>

                <div className={`p-4 border-l-4 border-[#F1B400] rounded-r-xl mb-4 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-zinc-950/90 text-zinc-200 border-zinc-800/80' 
                    : 'bg-white text-zinc-800 border-zinc-200 shadow-2xs'
                }`}>
                  <h5 className={`text-[10px] uppercase tracking-widest font-bold mb-1.5 ${
                    isDark ? 'text-[#F1B400]' : 'text-amber-800'
                  }`}>
                    Situación Planteada
                  </h5>
                  <p className="text-xs sm:text-[13px] leading-relaxed font-sans">
                    {q.situation || q.text}
                  </p>
                </div>
              </div>

              {q.options && (
                <div className="flex flex-col space-y-2.5">
                  <h5 className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    Seleccione su Reacción Habitual ante esta Situación:
                  </h5>
                  {q.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <label 
                        key={opt.id} 
                        onClick={() => handleOptionSelect(q.id, opt.id, opt.score)}
                        className={`flex gap-3.5 items-start sm:items-center cursor-pointer p-3.5 sm:p-4 border rounded-xl transition-all duration-150 ${
                          isSelected 
                            ? (isDark 
                                ? 'bg-amber-950/40 border-[#F1B400] ring-1 ring-[#F1B400]/40 text-amber-100 shadow-sm' 
                                : 'bg-amber-50/90 border-[#F1B400] ring-1 ring-[#F1B400]/40 text-amber-950 font-medium shadow-xs')
                            : (isDark 
                                ? 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-[#F1B400]/50 hover:bg-zinc-900' 
                                : 'bg-white border-zinc-200 text-zinc-700 hover:border-[#F1B400] hover:bg-amber-50/40 shadow-2xs')
                        }`}
                      >
                        <div className={`mt-0.5 sm:mt-0 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border transition-colors ${
                          isSelected 
                            ? 'border-[#F1B400] bg-transparent' 
                            : (isDark ? 'border-zinc-600 bg-zinc-900' : 'border-zinc-300 bg-zinc-50')
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#F1B400]"></div>}
                        </div>

                        <span className={`text-[11px] sm:text-xs flex-1 leading-relaxed ${
                          isSelected 
                            ? (isDark ? 'text-zinc-100 font-medium' : 'text-zinc-900 font-semibold') 
                            : (isDark ? 'text-zinc-300' : 'text-zinc-700')
                        }`}>
                          {opt.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
