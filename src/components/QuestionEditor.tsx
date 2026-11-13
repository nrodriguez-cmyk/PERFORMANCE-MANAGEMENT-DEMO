import React, { useState } from 'react';
import { Question } from '../types';
import { Trash2, Plus, Edit2, Save } from 'lucide-react';

interface QuestionEditorProps {
  title: string;
  description: string;
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

export function QuestionEditor({ title, description, questions, onChange }: QuestionEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Question>>({});

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setDraft(q);
  };

  const handleSave = () => {
    if (editingId) {
      onChange(questions.map(q => q.id === editingId ? { ...q, ...draft } as Question : q));
    }
    setEditingId(null);
    setDraft({});
  };

  const handleDelete = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
  };

  const handleAdd = () => {
    const newId = `q${Date.now()}`;
    const newQuestion: Question = {
      id: newId,
      competency: 'Nueva Competencia',
      text: 'Descripción de la competencia o pregunta a evaluar.',
    };
    onChange([...questions, newQuestion]);
  };

  return (
    <div className="bg-[#111] border border-[#F1B400] p-4 text-xs">
      <div className="flex justify-between items-center border-b border-[#F1B400]/30 pb-2 mb-4">
        <div>
          <h2 className="text-[#F1B400] text-xs font-bold uppercase tracking-widest">{title}</h2>
          <p className="text-[10px] text-gray-400 italic mt-1">{description}</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-2 bg-black border border-[#F1B400]/50 text-[#F1B400] uppercase font-bold text-[9px] hover:bg-[#F1B400]/10 transition-colors"
        >
          <Plus size={12} /> Agregar
        </button>
      </div>

      <div className="space-y-3">
        {questions.map(q => {
          const isEditing = editingId === q.id;

          return (
            <div key={q.id} className="bg-black border border-[#F1B400]/30 p-3 flex " >
              {isEditing ? (
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    value={draft.competency || ''}
                    onChange={e => setDraft({ ...draft, competency: e.target.value })}
                    className="bg-transparent border-b border-[#F1B400]/50 text-[#E0E0E0] text-[11px] font-bold uppercase focus:outline-none focus:border-[#F1B400] placeholder-gray-600"
                    placeholder="Competencia"
                  />
                  <textarea
                    value={draft.text || ''}
                    onChange={e => setDraft({ ...draft, text: e.target.value })}
                    className="bg-transparent border-b border-[#F1B400]/50 text-gray-400 text-[10px] focus:outline-none focus:border-[#F1B400] resize-none h-12 placeholder-gray-600"
                    placeholder="Descripción/Pregunta"
                  />
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={handleSave}
                      className="flex items-center gap-1 px-3 py-1 bg-[#F1B400] text-black uppercase font-bold text-[9px] hover:bg-[#F1B400]/80 transition"
                    >
                      <Save size={12} /> Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-bold text-[#E0E0E0] mb-1 uppercase tracking-wider">{q.competency}</h4>
                    <p className="text-[10px] text-gray-400">{q.text}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 ml-4">
                    <button 
                      onClick={() => handleEdit(q)}
                      className="text-gray-500 hover:text-[#F1B400] transition"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(q.id)}
                      className="text-gray-500 hover:text-red-500 transition"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {questions.length === 0 && (
          <div className="text-center p-4 text-gray-500 italic border border-[#F1B400]/10 border-dashed">
            No hay preguntas configuradas.
          </div>
        )}
      </div>
    </div>
  );
}
