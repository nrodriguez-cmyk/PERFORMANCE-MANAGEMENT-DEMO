import React from 'react';
import { EvaluationData, Question } from '../types';

interface EvalFormProps {
  title: string;
  description?: string;
  questions: Question[];
  data: EvaluationData;
  onChange: (data: EvaluationData) => void;
  theme?: 'dark' | 'light';
}

export function EvalForm({ 
  title, 
  description, 
  questions, 
  data, 
  onChange,
  theme = 'dark'
}: EvalFormProps) {
  const isDark = theme === 'dark';

  const handleScoreChange = (id: string, value: number) => {
    onChange({
      ...data,
      scores: {
        ...data.scores,
        [id]: value
      }
    });
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...data,
      comments: e.target.value
    });
  };

  return (
    <div className={`p-4 sm:p-5 text-xs font-sans rounded-2xl border transition-colors duration-200 ${
      isDark 
        ? 'bg-zinc-950/90 border-zinc-800 text-zinc-100 shadow-xl' 
        : 'bg-white border-zinc-200 text-zinc-900 shadow-xs'
    }`}>
      <h2 className={`text-xs font-bold uppercase mb-2 border-b pb-1 font-mono tracking-wider ${
        isDark ? 'text-[#F1B400] border-[#F1B400]/30' : 'text-amber-700 border-amber-200'
      }`}>
        {title}
      </h2>
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
          Instrucciones y Acuerdo del Evaluador
        </h3>
        <p className={`text-[11px] sm:text-xs leading-relaxed text-justify mb-4 ${
          isDark ? 'text-zinc-300' : 'text-zinc-700'
        }`}>
          Mediante el presente documento, manifiesto mi compromiso con el proceso de evaluación de desempeño, cuyo propósito fundamental es promover el desarrollo profesional y la mejora continua del colaborador. Entiendo que mi rol como evaluador es clave y que esta herramienta busca brindar retroalimentación constructiva para potenciar sus fortalezas y abordar sus áreas de oportunidad.
        </p>
        <div className={`p-3.5 border-l-4 border-[#F1B400] rounded-r-xl ${
          isDark ? 'bg-zinc-950/80 text-zinc-300' : 'bg-amber-50/80 text-amber-950'
        }`}>
          <p className="text-[11px] italic">
            "Al completar este formulario, me comprometo a brindar una evaluación honesta, reflexiva y estrictamente profesional sobre el desempeño del colaborador, basándome en hechos y observaciones objetivas durante el período evaluado."
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

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className={`p-4 rounded-xl border transition-all ${
            isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className={`text-xs font-bold mb-1 uppercase tracking-wider font-mono ${
                  isDark ? 'text-zinc-200' : 'text-zinc-800'
                }`}>
                  {q.competency}
                </h4>
                <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{q.text}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => handleScoreChange(q.id, score)}
                    className={`w-8 h-8 rounded-lg font-mono text-xs flex items-center justify-center transition-all border ${
                      data.scores[q.id] === score
                        ? 'bg-[#F1B400] text-black border-[#F1B400] font-black scale-105 shadow-md ring-2 ring-amber-400/40 z-10'
                        : (isDark 
                            ? 'bg-zinc-950 text-zinc-400 border-zinc-700 hover:border-[#F1B400] hover:text-white' 
                            : 'bg-white text-zinc-600 border-zinc-300 hover:border-[#F1B400] hover:bg-amber-50/50')
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className={`mt-6 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <label className={`block text-xs font-bold mb-2 uppercase tracking-wider font-mono ${
            isDark ? 'text-zinc-200' : 'text-zinc-800'
          }`}>
            OBSERVACIONES
          </label>
          <textarea
            value={data.comments}
            onChange={handleCommentsChange}
            rows={3}
            className={`w-full p-3.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#F1B400] transition-colors resize-none ${
              isDark 
                ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600' 
                : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
            }`}
            placeholder="Escribe comentarios observables o descriptivos..."
          />
        </div>
      </div>
    </div>
  );
}
