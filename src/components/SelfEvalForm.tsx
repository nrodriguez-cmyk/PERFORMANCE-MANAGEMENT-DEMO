import React from 'react';
import { EvaluationData, SelfEvalQuestion, EmployeeInfo } from '../types';

interface SelfEvalFormProps {
  title: string;
  description?: string;
  questions: SelfEvalQuestion[];
  data: EvaluationData;
  employeeInfo?: EmployeeInfo;
  onChange: (data: EvaluationData) => void;
  onEmployeeInfoChange?: (info: EmployeeInfo) => void;
  isSupervisor?: boolean;
  theme?: 'dark' | 'light';
}

export function SelfEvalForm({ 
  title, 
  description, 
  questions, 
  data, 
  onChange, 
  isSupervisor,
  theme = 'dark'
}: SelfEvalFormProps) {
  const isDark = theme === 'dark';

  const handleScoreChange = (questionId: string, score: number) => {
    onChange({
      ...data,
      scores: {
        ...data.scores,
        [questionId]: score
      }
    });
  };

  // Group questions by block
  const blocks: Record<string, SelfEvalQuestion[]> = {};
  questions.forEach(q => {
    if (!blocks[q.block]) blocks[q.block] = [];
    blocks[q.block].push(q);
  });

  return (
    <div className={`p-4 sm:p-5 text-xs font-sans rounded-2xl border transition-colors duration-200 ${
      isDark 
        ? 'bg-zinc-950/90 border-zinc-800 text-zinc-100 shadow-xl' 
        : 'bg-white border-zinc-200 text-zinc-900 shadow-xs'
    }`}>
      {title && (
        <h2 className={`text-xs font-bold uppercase mb-2 border-b pb-1 font-mono tracking-wider ${
          isDark ? 'text-[#F1B400] border-[#F1B400]/30' : 'text-amber-700 border-amber-200'
        }`}>
          {title}
        </h2>
      )}
      {description && (
        <p className={`text-[10px] mb-6 italic ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {description}
        </p>
      )}

      {/* Instrucciones */}
      <div className={`p-4 sm:p-5 mb-6 rounded-2xl border transition-colors duration-200 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
      }`}>
        <h3 className={`text-xs sm:text-sm font-bold mb-2 uppercase tracking-wider ${
          isDark ? 'text-zinc-100' : 'text-zinc-900'
        }`}>
          {isSupervisor ? "Instrucciones y Acuerdo del Evaluador" : "Instrucciones y Acuerdo"}
        </h3>
        <p className={`text-[11px] sm:text-xs leading-relaxed text-justify mb-4 ${
          isDark ? 'text-zinc-300' : 'text-zinc-700'
        }`}>
          {isSupervisor 
            ? "Mediante el presente documento, manifiesto mi compromiso con el proceso de evaluación de desempeño, cuyo propósito fundamental es promover el desarrollo profesional y la mejora continua del colaborador. Entiendo que mi rol como evaluador es clave y que esta herramienta busca brindar retroalimentación constructiva para potenciar sus fortalezas y abordar sus áreas de oportunidad."
            : "Mediante el presente documento, manifiesto mi conformidad con la aplicación de esta evaluación de desempeño, la cual tiene como propósito fundamental promover mi desarrollo profesional y la mejora continua dentro del equipo. Entiendo que esta es una herramienta constructiva para reflexionar sobre mi progreso y mis áreas de oportunidad."
          }
        </p>
        <div className={`p-3.5 border-l-4 border-[#F1B400] rounded-r-xl ${
          isDark ? 'bg-zinc-950/80 text-zinc-300' : 'bg-amber-50/80 text-amber-950'
        }`}>
          <p className="text-[11px] italic">
            {isSupervisor
              ? "\"Al completar este formulario, me comprometo a brindar una evaluación honesta, reflexiva y estrictamente profesional sobre el desempeño del colaborador, basándome en hechos y observaciones objetivas durante el período evaluado.\""
              : "\"Al completar este formulario, me comprometo a brindar respuestas honestas y reflexivas sobre mi desempeño.\""
            }
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className={`p-3.5 border-l-4 border-[#F1B400] rounded-r-xl flex flex-wrap gap-4 text-[10px] uppercase font-mono tracking-wide ${
          isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-amber-50/90 text-zinc-800'
        }`}>
          <span><strong className={isDark ? 'text-[#F1B400]' : 'text-amber-700'}>1</strong> = Casi nunca</span>
          <span><strong className={isDark ? 'text-[#F1B400]' : 'text-amber-700'}>2</strong> = Rara vez</span>
          <span><strong className={isDark ? 'text-[#F1B400]' : 'text-amber-700'}>3</strong> = A veces</span>
          <span><strong className={isDark ? 'text-[#F1B400]' : 'text-amber-700'}>4</strong> = La mayoría de las veces</span>
          <span><strong className={isDark ? 'text-[#F1B400]' : 'text-amber-700'}>5</strong> = Casi siempre</span>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {Object.entries(blocks).map(([blockName, blockQuestions]) => (
          <div key={blockName} className={`p-5 rounded-2xl border ${
            isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <h4 className={`font-black uppercase mb-4 tracking-wider font-mono text-xs ${
              isDark ? 'text-[#F1B400]' : 'text-amber-800'
            }`}>
              {blockName}
            </h4>
            <div className="space-y-5">
              {blockQuestions.map((q) => {
                const currentScore = data.scores[q.id] || 0;
                return (
                  <div key={q.id} className={`pt-4 first:pt-0 border-t ${
                    isDark ? 'border-zinc-800' : 'border-zinc-200 first:border-0'
                  }`}>
                    <h5 className={`font-bold mb-1 text-xs ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{q.title}</h5>
                    <p className={`text-[11px] mb-3 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{q.text}</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleScoreChange(q.id, val)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs transition-all border ${
                            currentScore === val 
                              ? 'bg-[#F1B400] text-black border-[#F1B400] scale-105 shadow-md ring-2 ring-amber-400/40' 
                              : (isDark 
                                  ? 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-[#F1B400]' 
                                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-[#F1B400] hover:bg-amber-50/50')
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
