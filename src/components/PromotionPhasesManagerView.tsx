import React, { useState } from 'react';
import { PromotionDossier, EmployeeInfo } from '../types';
import { PromotionResultsView } from './PromotionResultsView';
import { PromotionPhasesManagerModal } from './PromotionPhasesManagerModal';
import { Award, Plus, Sparkles } from 'lucide-react';

interface PromotionPhasesManagerViewProps {
  employeeInfo: EmployeeInfo;
  dossier?: PromotionDossier;
  onUpdateDossier: (dossier: PromotionDossier) => void;
}

export function PromotionPhasesManagerView({
  employeeInfo,
  dossier,
  onUpdateDossier
}: PromotionPhasesManagerViewProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-3">
        <div>
          <h3 className="text-sm font-black uppercase text-zinc-950 tracking-wider flex items-center gap-2">
            <Award size={18} className="text-[#D99C00]" /> Concurso de Promociones y Ascensos — Universo Canguro
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Proceso trifásico de evaluación por mérito y madurez técnica para postulantes a cargos superiores.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white hover:bg-[#F1B400] hover:text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs"
        >
          <Sparkles size={13} /> {dossier ? 'Editar Fases del Concurso' : 'Iniciar Concurso de Promoción'}
        </button>
      </div>

      <PromotionResultsView
        dossier={dossier}
        employeeInfo={employeeInfo}
        onOpenPhasesManager={() => setModalOpen(true)}
      />

      <PromotionPhasesManagerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeInfo={employeeInfo}
        existingDossier={dossier}
        onSaveDossier={onUpdateDossier}
      />
    </div>
  );
}
