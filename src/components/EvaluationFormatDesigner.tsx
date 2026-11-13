import React, { useState } from 'react';
import { Question } from '../types';
import { Sliders, Plus, Trash2, Edit3, Check, Eye } from 'lucide-react';

interface EvaluationFormatDesignerProps {
  questions: Question[];
  onSaveQuestions: (updated: Question[]) => void;
  scope?: '180' | '360';
  targetPosition?: string;
}

export function EvaluationFormatDesigner({
  questions = [],
  onSaveQuestions,
  scope = '360',
  targetPosition = 'Cargo General'
}: EvaluationFormatDesignerProps) {
  const [items, setItems] = useState<Question[]>(questions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCompetency, setEditCompetency] = useState('');
  const [editText, setEditText] = useState('');
  const [editSituation, setEditSituation] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Ponderaciones Oficiales (60% Bloque 1 / 30% Bloque 2 / 10% Bloque 3 = 100%)
  const [block1Weight, setBlock1Weight] = useState(60);
  const [block2Weight, setBlock2Weight] = useState(30);
  const [block3Weight, setBlock3Weight] = useState(10);

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditCompetency(q.competency);
    setEditText(q.text);
    setEditSituation(q.situation || '');
  };

  const saveEdit = (id: string) => {
    const updated = items.map(q => {
      if (q.id === id) {
        return {
          ...q,
          competency: editCompetency.trim() || q.competency,
          text: editText.trim() || q.text,
          situation: editSituation.trim() || q.situation
        };
      }
      return q;
    });
    setItems(updated);
    setEditingId(null);
    onSaveQuestions(updated);
  };

  const addNewQuestion = () => {
    const newQ: Question = {
      id: `custom_q_${Date.now()}`,
      competency: 'Nueva Competencia Específica',
      text: 'Describa el comportamiento o estándar esperado en el puesto.',
      situation: 'Describa una situación crítica de toma de decisiones en tienda u oficina.',
      category: 'cardinal',
      options: [
        { id: 'opt_a', score: 5.00, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Resuelve con visión sistémica, anticipación e innovación modelando al equipo.' },
        { id: 'opt_b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Ejecuta con autonomía y apego riguroso al procedimiento estándar.' },
        { id: 'opt_c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Requiere supervisión puntual ante situaciones imprevistas.' },
        { id: 'opt_d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Actúa de forma reactiva o requiere instrucciones directas continuas.' },
      ]
    };
    const updated = [...items, newQ];
    setItems(updated);
    onSaveQuestions(updated);
    startEdit(newQ);
  };

  const removeQuestion = (id: string) => {
    if (window.confirm('¿Desea eliminar este reactivo del formato de evaluación?')) {
      const updated = items.filter(q => q.id !== id);
      setItems(updated);
      onSaveQuestions(updated);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-zinc-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#D99C00]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
              Diseñador y Editor de Formatos de Evaluación
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Parametrización de reactivos situacionales, rúbricas de 4 niveles y ponderaciones para: <strong className="text-zinc-800">{targetPosition}</strong> ({scope}°)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            <Eye size={13} /> {previewMode ? 'Modo Edición' : 'Vista Previa'}
          </button>
          <button
            onClick={addNewQuestion}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1B400] text-black font-bold uppercase text-[10px] tracking-wider rounded-lg hover:bg-amber-500 transition-colors shadow-xs"
          >
            <Plus size={12} /> Agregar Reactivo
          </button>
        </div>
      </div>

      {/* Official Weight Configuration (60% Block 1 / 30% Block 2 / 10% Block 3 = 100%) */}
      <div className="mb-6 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
        <h4 className="text-xs font-bold uppercase text-zinc-950 mb-2 font-mono">
          Ponderación Oficial del Sistema de Gobierno (100% Calificación Total)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-zinc-900">B1: Indicadores Clave (KPI´s)</span>
              <span className="font-mono font-black text-amber-700 text-sm">{block1Weight}%</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Cumplimiento cuantificable de KPI, metas operativas y entregables clave.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-zinc-900">B2: Competencias</span>
              <span className="font-mono font-black text-blue-700 text-sm">{block2Weight}%</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Competencias cardinales y específicas por área (Modelo DTH-GFD-MC-01).
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-zinc-900">B3: Potencial & Liderazgo</span>
              <span className="font-mono font-black text-purple-700 text-sm">{block3Weight}%</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Agilidad de aprendizaje, aspiración, visión y potencial de liderazgo (Eje Y 9-Box).
            </p>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold uppercase text-zinc-500 border-b border-zinc-100 pb-2">
          <span>Reactivos Configurados ({items.length})</span>
          <span className="text-[10px] font-mono text-zinc-400">Rúbrica de 4 Opciones: A (5.0), B (3.75), C (2.50), D (1.25)</span>
        </div>

        {items.map((q, idx) => {
          const isEditing = editingId === q.id;

          if (isEditing) {
            return (
              <div key={q.id} className="p-4 rounded-xl border-2 border-[#F1B400] bg-amber-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-800">Editando Pregunta #{idx + 1}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(q.id)}
                      className="px-3 py-1 bg-zinc-950 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 flex items-center gap-1"
                    >
                      <Check size={12} /> Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Competencia Evaluada</label>
                  <input
                    type="text"
                    value={editCompetency}
                    onChange={(e) => setEditCompetency(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Definición Conductual</label>
                  <textarea
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Caso Situacional Simulado</label>
                  <textarea
                    rows={2}
                    value={editSituation}
                    onChange={(e) => setEditSituation(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
            );
          }

          return (
            <div
              key={q.id}
              className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      #{idx + 1}
                    </span>
                    <h5 className="text-xs font-bold text-zinc-950 uppercase">
                      {q.competency}
                    </h5>
                  </div>
                  <p className="text-xs text-zinc-600">
                    {q.text}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => startEdit(q)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded hover:bg-zinc-100"
                    title="Editar reactivo"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                    title="Eliminar reactivo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {q.situation && (
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700">
                  <strong className="text-zinc-900 block mb-0.5 uppercase text-[9px] font-mono">Situación Crítica:</strong>
                  {q.situation}
                </div>
              )}

              {/* Options breakdown */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-100">
                  {q.options.map((opt) => (
                    <div key={opt.id} className="p-2 rounded bg-zinc-50/50 border border-zinc-100 text-[10px]">
                      <div className="flex items-center justify-between font-mono mb-0.5">
                        <span className="font-bold text-zinc-900">Nivel {opt.levelLetter || 'A'} ({opt.score.toFixed(2)} pts)</span>
                        <span className="text-[9px] text-zinc-500">{opt.levelLabel}</span>
                      </div>
                      <p className="text-zinc-600 line-clamp-2">{opt.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
