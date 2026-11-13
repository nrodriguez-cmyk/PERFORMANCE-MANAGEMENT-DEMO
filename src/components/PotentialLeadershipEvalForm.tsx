import React from 'react';
import {
  POTENTIAL_18_ITEMS,
  POTENTIAL_SCALE_OPTIONS,
  POTENTIAL_INSTRUCTIONS_HEADER,
  getPotentialItemsForRole,
  getPotentialInstructionsHeader
} from '../data/potentialLeadershipQuestions';
import { CheckCircle2, HelpCircle } from 'lucide-react';

interface PotentialLeadershipEvalFormProps {
  responses: Record<string, number>;
  onChange: (responses: Record<string, number>) => void;
  readOnly?: boolean;
  theme?: 'dark' | 'light';
  evaluatorRole?: 'self' | 'supervisor' | 'peer' | 'subordinate' | string;
}

export function PotentialLeadershipEvalForm({
  responses,
  onChange,
  readOnly = false,
  theme = 'dark',
  evaluatorRole = 'self'
}: PotentialLeadershipEvalFormProps) {
  const isDark = theme === 'dark';
  const items = getPotentialItemsForRole(evaluatorRole);
  const instructionsHeader = getPotentialInstructionsHeader(evaluatorRole);

  const handleSelect = (itemId: string, val: number) => {
    if (readOnly) return;
    onChange({
      ...responses,
      [itemId]: val
    });
  };

  const answeredCount = items.filter(it => Boolean(responses[it.id])).length;
  const progressPercent = Math.round((answeredCount / items.length) * 100);

  return (
    <div className="space-y-6">
      {/* Cabecera Oficial Obligatoria */}
      <div className={`p-4 sm:p-5 rounded-2xl border-l-4 border-[#F1B400] shadow-sm space-y-3 transition-colors duration-200 ${
        isDark 
          ? 'bg-zinc-900/90 text-white border-y border-r border-zinc-800' 
          : 'bg-amber-50/90 text-zinc-900 border-y border-r border-amber-200/70'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className={`font-mono font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 ${
            isDark ? 'text-[#F1B400]' : 'text-amber-800'
          }`}>
            <HelpCircle size={14} /> Instrucciones de Respuesta
          </span>
          <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Progreso: <strong className={isDark ? 'text-white' : 'text-zinc-950'}>{answeredCount} de {items.length}</strong>
          </span>
        </div>
        <p className={`text-xs sm:text-sm leading-relaxed font-sans text-justify ${
          isDark ? 'text-zinc-200' : 'text-zinc-800'
        }`}>
          "{instructionsHeader}"
        </p>

        {/* Significado visual de la escala en las instrucciones */}
        <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-zinc-800' : 'border-amber-200/80'}`}>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
            isDark ? 'text-[#F1B400]' : 'text-amber-800'
          }`}>
            Significado de la Escala de Respuesta:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border text-center transition-colors ${
              isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-2xs'
            }`}>
              <span className={`inline-block w-6 h-6 rounded-full font-mono font-black text-xs leading-6 mb-1 ${
                isDark ? 'bg-zinc-800 text-[#F1B400]' : 'bg-amber-100 text-amber-900'
              }`}>
                1
              </span>
              <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Totalmente identificado con la frase de la izquierda
              </p>
            </div>
            <div className={`p-2.5 rounded-xl border text-center transition-colors ${
              isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-2xs'
            }`}>
              <span className={`inline-block w-6 h-6 rounded-full font-mono font-black text-xs leading-6 mb-1 ${
                isDark ? 'bg-zinc-800 text-[#F1B400]' : 'bg-amber-100 text-amber-900'
              }`}>
                2
              </span>
              <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Más cercano a la frase de la izquierda
              </p>
            </div>
            <div className={`p-2.5 rounded-xl border text-center transition-colors ${
              isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-2xs'
            }`}>
              <span className={`inline-block w-6 h-6 rounded-full font-mono font-black text-xs leading-6 mb-1 ${
                isDark ? 'bg-zinc-800 text-[#F1B400]' : 'bg-amber-100 text-amber-900'
              }`}>
                3
              </span>
              <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Situación intermedia / Depende del contexto
              </p>
            </div>
            <div className={`p-2.5 rounded-xl border text-center transition-colors ${
              isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-2xs'
            }`}>
              <span className={`inline-block w-6 h-6 rounded-full font-mono font-black text-xs leading-6 mb-1 ${
                isDark ? 'bg-zinc-800 text-[#F1B400]' : 'bg-amber-100 text-amber-900'
              }`}>
                4
              </span>
              <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Más cercano a la frase de la derecha
              </p>
            </div>
            <div className={`p-2.5 rounded-xl border text-center transition-colors ${
              isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-2xs'
            }`}>
              <span className={`inline-block w-6 h-6 rounded-full font-mono font-black text-xs leading-6 mb-1 ${
                isDark ? 'bg-zinc-800 text-[#F1B400]' : 'bg-amber-100 text-amber-900'
              }`}>
                5
              </span>
              <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Totalmente identificado con la frase de la derecha
              </p>
            </div>
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

      {/* Listado de los 18 Reactivos Contrapuestos */}
      <div className="space-y-5">
        {items.map((item, idx) => {
          const selectedVal = responses[item.id] || 0;
          const isAnswered = selectedVal > 0;

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                isDark
                  ? (isAnswered
                      ? 'bg-zinc-900/90 border-zinc-700 shadow-sm'
                      : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700')
                  : (isAnswered
                      ? 'bg-white border-zinc-300 shadow-xs'
                      : 'bg-zinc-50/70 border-zinc-200 hover:border-zinc-300')
              }`}
            >
              {/* Indicador sutil de número correlativo */}
              <div className={`flex items-center justify-between pb-3 mb-3 border-b ${
                isDark ? 'border-zinc-800' : 'border-zinc-100'
              }`}>
                <span className={`text-[11px] font-mono font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Pregunta {idx + 1} de {items.length}
                </span>
                {isAnswered && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                    isDark 
                      ? 'text-emerald-300 bg-emerald-950/70 border border-emerald-800/50' 
                      : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  }`}>
                    <CheckCircle2 size={12} /> Respondido
                  </span>
                )}
              </div>

              {/* Contenedor Contrapuesto: Frase Izquierda vs Frase Derecha (SIEMPRE HORIZONTAL) */}
              <div className="flex flex-row items-stretch gap-2 sm:gap-3 md:gap-4 w-full">
                
                {/* Tarjeta Frase Izquierda (OBLIGATORIAMENTE A LA IZQUIERDA) */}
                <div
                  onClick={() => !readOnly && handleSelect(item.id, 1)}
                  className={`flex-1 min-w-0 p-3 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedVal === 1 || selectedVal === 2
                      ? (isDark 
                          ? 'bg-amber-950/40 border-[#F1B400] text-amber-100 shadow-xs ring-1 ring-[#F1B400]/40' 
                          : 'bg-amber-50/90 border-[#F1B400] text-zinc-900 shadow-xs ring-1 ring-amber-300')
                      : (isDark 
                          ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700' 
                          : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700 hover:border-zinc-300')
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`text-[9px] sm:text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                      selectedVal === 1 || selectedVal === 2
                        ? 'bg-[#F1B400] text-black border-[#F1B400]'
                        : isDark ? 'bg-zinc-900 text-zinc-400 border-zinc-700' : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                    }`}>
                      ← Opción Izquierda
                    </span>
                  </div>
                  <p className={`text-xs sm:text-[13px] leading-relaxed font-medium font-sans ${
                    isDark ? 'text-zinc-100' : 'text-zinc-900'
                  }`}>
                    {item.leftText}
                  </p>
                </div>

                {/* Escala Central de 5 Opciones (EN EL CENTRO CONECTANDO IZQUIERDA Y DERECHA) */}
                <div className="shrink-0 flex flex-col justify-center items-center py-1 px-1 sm:px-2 w-[125px] sm:w-[165px] md:w-[195px]">
                  <div className="w-full flex items-center justify-between gap-1 sm:gap-1.5">
                    {POTENTIAL_SCALE_OPTIONS.map((opt) => {
                      const isSelected = selectedVal === opt.value;

                      return (
                        <label
                          key={opt.value}
                          className="flex flex-col items-center flex-1 cursor-pointer group text-center"
                          title={`Opción ${opt.value}: ${opt.label}`}
                        >
                          <input
                            type="radio"
                            name={`item_${item.id}`}
                            value={opt.value}
                            checked={isSelected}
                            disabled={readOnly}
                            onChange={() => handleSelect(item.id, opt.value)}
                            className="sr-only"
                          />
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-mono font-black text-xs sm:text-sm transition-all border-2 select-none ${
                              isSelected
                                ? (isDark 
                                    ? 'bg-[#F1B400] text-black border-[#F1B400] scale-110 shadow-lg ring-2 ring-amber-400/50' 
                                    : 'bg-[#F1B400] text-black border-[#F1B400] scale-110 shadow-md ring-2 ring-amber-300')
                                : (isDark 
                                    ? 'bg-zinc-950 text-zinc-300 border-zinc-700 group-hover:border-[#F1B400] group-hover:text-[#F1B400]' 
                                    : 'bg-white text-zinc-700 border-zinc-300 group-hover:border-[#F1B400] group-hover:bg-amber-50/50')
                            }`}
                          >
                            {opt.value}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Tarjeta Frase Derecha (OBLIGATORIAMENTE A LA DERECHA) */}
                <div
                  onClick={() => !readOnly && handleSelect(item.id, 5)}
                  className={`flex-1 min-w-0 p-3 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedVal === 4 || selectedVal === 5
                      ? (isDark 
                          ? 'bg-amber-950/40 border-[#F1B400] text-amber-100 shadow-xs ring-1 ring-[#F1B400]/40' 
                          : 'bg-amber-50/90 border-[#F1B400] text-zinc-900 shadow-xs ring-1 ring-amber-300')
                      : (isDark 
                          ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700' 
                          : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700 hover:border-zinc-300')
                  }`}
                >
                  <div className="flex items-center justify-end gap-1.5 mb-1.5">
                    <span className={`text-[9px] sm:text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                      selectedVal === 4 || selectedVal === 5
                        ? 'bg-[#F1B400] text-black border-[#F1B400]'
                        : isDark ? 'bg-zinc-900 text-zinc-400 border-zinc-700' : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                    }`}>
                      Opción Derecha →
                    </span>
                  </div>
                  <p className={`text-xs sm:text-[13px] leading-relaxed font-medium font-sans text-right sm:text-left ${
                    isDark ? 'text-zinc-100' : 'text-zinc-900'
                  }`}>
                    {item.rightText}
                  </p>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
