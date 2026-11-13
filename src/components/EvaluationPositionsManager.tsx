import React, { useState, useMemo, useEffect } from 'react';
import {
  OFFICIAL_POSITION_FAMILIES,
  PositionFamily,
  getEnabledPositionFamilies,
  setEnabledPositionFamilies,
  resolvePositionFamilyId,
  isPositionEvaluationEnabled,
  getCustomPositionOverrides,
  setCustomPositionOverride,
  resetToLeadershipOnly,
  setAllPositionsEnabled
} from '../utils/evaluationPositionsConfig';
import { CANGURO_COLLABORATORS } from '../data/canguroUniverso';
import {
  Briefcase, CheckCircle2, XCircle, Search, Sliders, ShieldCheck,
  RotateCcw, Users, AlertCircle, ChevronDown, ChevronUp, Sparkles, Filter, Check
} from 'lucide-react';

export function EvaluationPositionsManager() {
  const [familiesEnabled, setFamiliesEnabled] = useState<Record<string, boolean>>(() => getEnabledPositionFamilies());
  const [customOverrides, setCustomOverrides] = useState<Record<string, boolean>>(() => getCustomPositionOverrides());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>('all');
  const [showGranularList, setShowGranularList] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Censo total de colaboradores
  const totalEmployees = CANGURO_COLLABORATORS.length;

  // Mapa de cargos únicos y conteo de personas en el censo
  const uniquePositionsMap = useMemo(() => {
    const map: Record<string, { count: number; familyId: string }> = {};
    CANGURO_COLLABORATORS.forEach(c => {
      const pos = c.info?.position || 'Sin Cargo Definido';
      if (!map[pos]) {
        map[pos] = {
          count: 0,
          familyId: resolvePositionFamilyId(pos)
        };
      }
      map[pos].count += 1;
    });
    return map;
  }, []);

  // Conteo de colaboradores por familia de cargo
  const familyCensusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    OFFICIAL_POSITION_FAMILIES.forEach(f => { counts[f.id] = 0; });

    Object.entries(uniquePositionsMap).forEach(([pos, data]) => {
      counts[data.familyId] = (counts[data.familyId] || 0) + data.count;
    });
    return counts;
  }, [uniquePositionsMap]);

  // Total de colaboradores actualmente habilitados para evaluación
  const enabledCollaboratorsCount = useMemo(() => {
    return CANGURO_COLLABORATORS.filter(c => {
      const pos = c.info?.position || '';
      return isPositionEvaluationEnabled(pos);
    }).length;
  }, [familiesEnabled, customOverrides]);

  const disabledCollaboratorsCount = totalEmployees - enabledCollaboratorsCount;
  const enabledPercent = totalEmployees > 0 ? ((enabledCollaboratorsCount / totalEmployees) * 100).toFixed(1) : '0';

  // Handler para conmutar una familia completa
  const handleToggleFamily = (familyId: string) => {
    const nextVal = !familiesEnabled[familyId];
    const updated = { ...familiesEnabled, [familyId]: nextVal };
    setFamiliesEnabled(updated);
    setEnabledPositionFamilies(updated);

    const fam = OFFICIAL_POSITION_FAMILIES.find(f => f.id === familyId);
    setNoticeMessage(`${nextVal ? 'Habilitados' : 'Inhabilitados'}: ${fam?.name || familyId} para la evaluación.`);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Preset: Solo Liderazgo (Gerentes, Coordinadores y Supervisores)
  const handleSetLeadershipOnly = () => {
    const updated = resetToLeadershipOnly();
    setFamiliesEnabled(updated);
    setCustomOverrides({});
    setNoticeMessage('¡Configuración aplicada! Se evaluarán exclusivamente Gerentes, Coordinadores y Supervisores.');
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // Preset: Habilitar todos
  const handleEnableAll = () => {
    const updated = setAllPositionsEnabled(true);
    setFamiliesEnabled(updated);
    setNoticeMessage('¡Todos los cargos habilitados! Todo el personal participará en el ciclo de evaluación.');
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // Preset: Deshabilitar todos
  const handleDisableAll = () => {
    const updated = setAllPositionsEnabled(false);
    setFamiliesEnabled(updated);
    setNoticeMessage('Todos los cargos inhabilitados temporalmente.');
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // Conmutar un cargo específico de forma individual
  const handleToggleSpecificCargo = (posName: string, currentEnabled: boolean) => {
    setCustomPositionOverride(posName, !currentEnabled);
    setCustomOverrides(getCustomPositionOverrides());
  };

  // Quitar override y volver a la regla de la familia
  const handleResetSpecificCargo = (posName: string) => {
    setCustomPositionOverride(posName, null);
    setCustomOverrides(getCustomPositionOverrides());
  };

  // Lista filtrada de cargos individuales
  const filteredPositionsList = useMemo(() => {
    const entries = Object.entries(uniquePositionsMap);
    return entries.filter(([name, data]) => {
      const matchSearch = searchQuery === '' || name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFamily = selectedFamilyFilter === 'all' || data.familyId === selectedFamilyFilter;
      return matchSearch && matchFamily;
    }).sort((a, b) => b[1].count - a[1].count);
  }, [uniquePositionsMap, searchQuery, selectedFamilyFilter]);

  // Identificar si la configuración activa es exactamente "Solo Liderazgo"
  const isLeadershipOnlyActive = useMemo(() => {
    return familiesEnabled['gerentes'] === true &&
      familiesEnabled['coordinadores'] === true &&
      familiesEnabled['supervisores'] === true &&
      !familiesEnabled['directores'] &&
      !familiesEnabled['especialistas'] &&
      !familiesEnabled['analistas'] &&
      !familiesEnabled['asesores'] &&
      !familiesEnabled['operadores'] &&
      !familiesEnabled['encargados'] &&
      Object.keys(customOverrides).length === 0;
  }, [familiesEnabled, customOverrides]);

  return (
    <div className="bg-white border-2 border-amber-400/80 rounded-2xl p-5 sm:p-6 shadow-md space-y-5 animate-in fade-in">
      {/* 1. CABECERA DEL MÓDULO DE HABILITACIÓN DE CARGOS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-zinc-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
              Control de Elegibilidad & Alcance
            </span>
            {isLeadershipOnlyActive && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <Check size={12} /> Modelo Activo: Solo Liderazgo (Gerentes, Coord. y Sup.)
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-black uppercase text-zinc-950 flex items-center gap-2">
            <Briefcase size={20} className="text-[#D99C00]" /> Habilitación de Cargos para la Evaluación del Desempeño
          </h3>
          <p className="text-xs text-zinc-600 mt-1 max-w-3xl leading-relaxed">
            Active o desactive los grupos de cargos que serán evaluados en este ciclo institucional.
            Los colaboradores en cargos <strong>no habilitados</strong> (ej: especialistas, analistas, directores u operativos) no tendrán evaluaciones activas asignadas ni computarán en el tablero hasta su habilitación.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handleSetLeadershipOnly}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isLeadershipOnlyActive
                ? 'bg-[#F1B400] text-black font-black ring-2 ring-amber-400'
                : 'bg-zinc-950 hover:bg-zinc-800 text-white'
            }`}
            title="Activar únicamente Gerentes, Coordinadores y Supervisores"
          >
            <Sparkles size={14} className={isLeadershipOnlyActive ? 'text-black' : 'text-[#F1B400]'} />
            <span>Solo Liderazgo (Recomendado)</span>
          </button>

          <button
            onClick={handleEnableAll}
            className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl transition-all border border-zinc-200 flex items-center gap-1 cursor-pointer"
            title="Habilitar todos los cargos del censo (100%)"
          >
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Habilitar Todos</span>
          </button>

          <button
            onClick={handleDisableAll}
            className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl transition-all border border-zinc-200 flex items-center gap-1 cursor-pointer"
            title="Inhabilitar todas las evaluaciones temporalmente"
          >
            <XCircle size={13} className="text-rose-600" />
            <span>Deshabilitar Todos</span>
          </button>
        </div>
      </div>

      {noticeMessage && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={16} className="text-amber-600 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* 2. BARRA DE MÉTRICAS DEL CENSO (POBLACIÓN HABILITADA VS. TOTAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 tracking-wider block">
              Colaboradores Habilitados
            </span>
            <span className="text-xl font-black font-mono text-emerald-950">
              {enabledCollaboratorsCount} <span className="text-xs font-normal text-emerald-700 font-sans">colaboradores ({enabledPercent}%)</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider block">
              No Evaluados en esta Fase
            </span>
            <span className="text-xl font-black font-mono text-zinc-800">
              {disabledCollaboratorsCount} <span className="text-xs font-normal text-zinc-500 font-sans">colaboradores</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-200/60 text-zinc-600 flex items-center justify-center font-black">
            <XCircle size={22} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-amber-800 tracking-wider block">
              Total Censo Institucional
            </span>
            <span className="text-xl font-black font-mono text-amber-950">
              {totalEmployees} <span className="text-xs font-normal text-amber-800 font-sans">registrados</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* 3. MATRIZ DE LAS 9 FAMILIAS DE CARGOS CON SWITCHES INTERACTIVOS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black uppercase text-zinc-800 font-mono flex items-center gap-1.5">
            <Sliders size={14} className="text-[#D99C00]" /> Configuración por Familia Jerárquica:
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            Haga clic en cada switch para activar o desactivar la familia completa
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {OFFICIAL_POSITION_FAMILIES.map(fam => {
            const isEnabled = familiesEnabled[fam.id] ?? fam.defaultEnabled;
            const count = familyCensusCounts[fam.id] || 0;
            const percentOfTotal = totalEmployees > 0 ? ((count / totalEmployees) * 100).toFixed(1) : '0';

            return (
              <div
                key={fam.id}
                className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  isEnabled
                    ? 'border-emerald-400 bg-emerald-50/30 shadow-xs'
                    : 'border-zinc-200 bg-zinc-50/50 opacity-70 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-zinc-200/80">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black uppercase tracking-tight ${isEnabled ? 'text-zinc-950' : 'text-zinc-500'}`}>
                          {fam.name}
                        </span>
                        <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          isEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-zinc-200 text-zinc-600'
                        }`}>
                          {isEnabled ? 'EVALUAR' : 'EXCLUIDO'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                        {count} en censo ({percentOfTotal}%)
                      </span>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleFamily(fam.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-emerald-600' : 'bg-zinc-300'
                      }`}
                      role="switch"
                      aria-checked={isEnabled}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-600 mt-2 leading-tight">
                    {fam.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-zinc-400">
                    Palabra clave: {fam.keywords.join(', ')}
                  </span>
                  <span className={`font-bold ${isEnabled ? 'text-emerald-700' : 'text-zinc-400'}`}>
                    {isEnabled ? '● Habilitado' : '○ No se evalúa'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SECCIÓN EXPANDIBLE: AUDITORÍA Y CONTROL FINO POR CARGO INDIVIDUAL */}
      <div className="pt-2 border-t border-zinc-200">
        <button
          onClick={() => setShowGranularList(!showGranularList)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-800 transition-all cursor-pointer border border-zinc-200"
        >
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#D99C00]" />
            <span>Auditoría Granular de Cargos Específicos del Censo ({Object.keys(uniquePositionsMap).length} cargos únicos detectados)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500">
              {showGranularList ? 'Ocultar listado' : 'Ver y ajustar por cargo específico'}
            </span>
            {showGranularList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {showGranularList && (
          <div className="mt-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3 animate-in fade-in">
            {/* Buscador y filtro de familia */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar cargo específico (ej: Gerente de Tienda, Auditor, Asesor...)"
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg focus:ring-1 focus:ring-[#F1B400] outline-none"
                />
              </div>

              <select
                value={selectedFamilyFilter}
                onChange={(e) => setSelectedFamilyFilter(e.target.value)}
                className="w-full sm:w-auto text-xs bg-white border border-zinc-300 rounded-lg p-1.5 font-bold text-zinc-700 outline-none"
              >
                <option value="all">Todas las familias</option>
                {OFFICIAL_POSITION_FAMILIES.map(fam => (
                  <option key={fam.id} value={fam.id}>{fam.name}</option>
                ))}
              </select>
            </div>

            {/* Tabla de Cargos */}
            <div className="max-h-80 overflow-y-auto border border-zinc-200 rounded-xl bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-white font-mono text-[10px] uppercase sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5">Cargo Oficial en Censo</th>
                    <th className="p-2.5">Familia Jerárquica</th>
                    <th className="p-2.5 text-center">Colaboradores</th>
                    <th className="p-2.5 text-center">Estado Evaluación</th>
                    <th className="p-2.5 text-right">Acción Individual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredPositionsList.map(([posName, data]) => {
                    const clean = posName.trim().toLowerCase();
                    const hasOverride = customOverrides[clean] !== undefined;
                    const isEnabled = isPositionEvaluationEnabled(posName);
                    const fam = OFFICIAL_POSITION_FAMILIES.find(f => f.id === data.familyId);

                    return (
                      <tr key={posName} className={`hover:bg-zinc-50 ${isEnabled ? 'bg-emerald-50/20' : ''}`}>
                        <td className="p-2.5 font-bold text-zinc-900">
                          {posName}
                        </td>
                        <td className="p-2.5">
                          <span className="text-[10.5px] text-zinc-600 font-medium">{fam?.name || data.familyId}</span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-zinc-800">
                          {data.count}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-black ${
                            isEnabled
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-zinc-200 text-zinc-600'
                          }`}>
                            {isEnabled ? 'HABILITADO' : 'INACTIVO'}
                          </span>
                          {hasOverride && (
                            <span className="block text-[8.5px] text-amber-700 font-mono mt-0.5">
                              (Ajuste manual)
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleSpecificCargo(posName, isEnabled)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                              isEnabled
                                ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            {isEnabled ? 'Inhabilitar' : 'Habilitar'}
                          </button>
                          {hasOverride && (
                            <button
                              type="button"
                              onClick={() => handleResetSpecificCargo(posName)}
                              className="px-2 py-1 text-[9px] font-mono text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
                              title="Restablecer al estado de su familia"
                            >
                              Restablecer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

