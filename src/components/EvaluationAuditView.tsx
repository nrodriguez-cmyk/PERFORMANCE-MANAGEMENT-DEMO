import React, { useState } from 'react';
import { CANGURO_COLLABORATORS, CanguroCollaborator } from '../data/canguroUniverso';
import { AuditEvaluationsViewer } from './AuditEvaluationsViewer';
import { AppState } from '../types';
import { ShieldCheck, Activity, Users, AlertCircle, CheckCircle2, Clock, Search, Filter } from 'lucide-react';

interface EvaluationAuditViewProps {
  currentState: AppState;
  onSelectCollaborator?: (collab: CanguroCollaborator) => void;
}

export function EvaluationAuditView({ currentState, onSelectCollaborator }: EvaluationAuditViewProps) {
  const [subTab, setSubTab] = useState<'overview' | 'items'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDirectorate, setFilterDirectorate] = useState('ALL');

  // Calculate statistics across national chain
  const totalCollaborators = CANGURO_COLLABORATORS.length;
  let totalInstruments = 0;
  let completedInstruments = 0;

  const collaboratorsWithStatus = CANGURO_COLLABORATORS.map(c => {
    const hasSub = ['Coordinador', 'Supervisor', 'Gerente', 'Director'].includes(c.info.position);
    const required = hasSub ? 4 : 3;
    let completed = 0;

    const selfDone = !!c.selfEval?.submittedAt;
    const supDone = !!c.supervisorEval?.submittedAt;
    const peerDone = !!c.peerEval?.submittedAt;
    const subDone = hasSub ? !!c.subordinateEval?.submittedAt : true;

    if (selfDone) completed++;
    if (supDone) completed++;
    if (peerDone) completed++;
    if (hasSub && subDone) completed++;

    totalInstruments += required;
    completedInstruments += completed;

    const isFinished = completed >= required;
    const isPending = completed === 0;

    return {
      ...c,
      status: isFinished ? 'completed' : isPending ? 'pending' : 'in_progress',
      completionPct: Math.round((completed / required) * 100),
      selfDone,
      supDone,
      peerDone,
      subDone,
      hasSub
    };
  });

  const overallProgressPct = totalInstruments > 0
    ? Math.round((completedInstruments / totalInstruments) * 100)
    : 85;

  const filteredList = collaboratorsWithStatus.filter(c => {
    const matchesSearch = `${c.info.firstName} ${c.info.lastName} ${c.info.idNumber} ${c.info.position} ${c.info.department}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDir = filterDirectorate === 'ALL' || c.info.directorate === filterDirectorate;
    return matchesSearch && matchesDir;
  });

  const directorates = Array.from(new Set(CANGURO_COLLABORATORS.map(c => c.info.directorate)));

  return (
    <div className="space-y-6">
      {/* Subprocess Nav Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              subTab === 'overview'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            Subproceso 1: Tablero de Avance Organizacional
          </button>
          <button
            onClick={() => setSubTab('items')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              subTab === 'items'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            Subproceso 2: Auditoría Detallada Ítem a Ítem
          </button>
        </div>

        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
          ETAPA 4: MONITOREO Y AUDITORÍA EN VIVO
        </span>
      </div>

      {subTab === 'overview' ? (
        <>
          {/* Executive Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Avance Global Nacional</span>
                <Activity size={14} className="text-[#D99C00]" />
              </div>
              <div className="text-2xl font-mono font-black text-zinc-950">{overallProgressPct}%</div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#F1B400]" style={{ width: `${overallProgressPct}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Colaboradores Censados</span>
                <Users size={14} className="text-blue-600" />
              </div>
              <div className="text-2xl font-mono font-black text-zinc-950">{totalCollaborators}</div>
              <span className="text-[10px] text-zinc-400 font-mono">Red de Tiendas + Sede Central</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Completadas al 100%</span>
                <CheckCircle2 size={14} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-mono font-black text-emerald-950">
                {collaboratorsWithStatus.filter(c => c.status === 'completed').length}
              </div>
              <span className="text-[10px] text-emerald-800 font-mono">Expedientes listos para calibración</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Pendientes / En Proceso</span>
                <AlertCircle size={14} className="text-amber-500" />
              </div>
              <div className="text-2xl font-mono font-black text-amber-900">
                {collaboratorsWithStatus.filter(c => c.status !== 'completed').length}
              </div>
              <span className="text-[10px] text-amber-700 font-mono">Con alertas automáticas activas</span>
            </div>
          </div>

          {/* National Collaborators Progress Table */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-zinc-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 mb-4 gap-3">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                  Tablero de Avance Organizacional — Universo Canguro
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Seguimiento en tiempo real de recepción de instrumentos por colaborador.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Buscar colaborador, cédula o cargo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
                  />
                </div>

                <select
                  value={filterDirectorate}
                  onChange={(e) => setFilterDirectorate(e.target.value)}
                  className="py-1.5 px-2.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-800"
                >
                  <option value="ALL">Todas las Direcciones</option>
                  {directorates.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-white font-mono text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Colaborador / Cédula</th>
                    <th className="p-3">Cargo y Dirección</th>
                    <th className="p-3 text-center">Auto</th>
                    <th className="p-3 text-center">Supervisor</th>
                    <th className="p-3 text-center">Pares</th>
                    <th className="p-3 text-center">Subord.</th>
                    <th className="p-3 text-center">Progreso</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredList.map((collab) => (
                    <tr key={collab.info.id || collab.info.idNumber} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-zinc-900 block">
                          {collab.info.firstName} {collab.info.lastName}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {collab.info.idNumber}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="text-zinc-800 font-medium block">
                          {collab.info.position}
                        </span>
                        <span className="text-[10px] text-zinc-500 truncate max-w-[200px] block">
                          {collab.info.department}
                        </span>
                      </td>

                      {/* Auto badge */}
                      <td className="p-3 text-center">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${collab.selfDone ? 'bg-emerald-500' : 'bg-zinc-300'}`} title={collab.selfDone ? 'Recibido' : 'Pendiente'} />
                      </td>

                      {/* Supervisor badge */}
                      <td className="p-3 text-center">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${collab.supDone ? 'bg-emerald-500' : 'bg-zinc-300'}`} title={collab.supDone ? 'Recibido' : 'Pendiente'} />
                      </td>

                      {/* Peer badge */}
                      <td className="p-3 text-center">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${collab.peerDone ? 'bg-emerald-500' : 'bg-zinc-300'}`} title={collab.peerDone ? 'Recibido' : 'Pendiente'} />
                      </td>

                      {/* Subordinate badge */}
                      <td className="p-3 text-center">
                        {collab.hasSub ? (
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${collab.subDone ? 'bg-emerald-500' : 'bg-zinc-300'}`} title={collab.subDone ? 'Recibido' : 'Pendiente'} />
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-mono">N/A</span>
                        )}
                      </td>

                      {/* Progress Pct */}
                      <td className="p-3 text-center font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          collab.completionPct === 100
                            ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}>
                          {collab.completionPct}%
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onSelectCollaborator && onSelectCollaborator(collab)}
                          className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-zinc-900 text-white hover:bg-[#F1B400] hover:text-black transition-colors"
                        >
                          Auditar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <AuditEvaluationsViewer state={currentState} />
      )}
    </div>
  );
}
