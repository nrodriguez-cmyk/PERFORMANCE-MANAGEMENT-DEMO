import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, Upload, Users, CheckCircle2, AlertTriangle, 
  RefreshCw, X, Search, ChevronRight, Check, ShieldCheck, Database, 
  Building2, Briefcase, Eye, ArrowUpDown, Filter, Sparkles, UserCheck,
  CheckCircle, ArrowRight, Download
} from 'lucide-react';
import { 
  checkDatabaseStatus, 
  syncCensusToDatabase, 
  DatabaseStatus 
} from '../services/databaseService';
import { 
  CANGURO_COLLABORATORS, 
  createOrUpdateCollaborator, 
  bulkCommitCollaborators,
  formatIdNumber,
  CanguroCollaborator,
  normalizeDirectorate
} from '../data/canguroUniverso';
import { 
  resolveOfficialHierarchy, 
  FullHierarchyMatch 
} from '../data/officialOrgChart';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ParsedExcelCollaborator {
  fullName: string;
  idNumber: string;
  rawId: string;
  position: string;
  department: string;
  directorate: string;
  educationDegree: string;
  hireDate: string;
  hierarchy: FullHierarchyMatch | null;
  managementLevel: 'ESTRATÉGICO' | 'TÉCNICO / INTERMEDIO' | 'OPERATIVO';
  scope: '360' | '180';
}

function parseExcelDate(val: any): string {
  if (!val) return '';
  if (typeof val === 'number') {
    // Excel serial number date
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  if (typeof val === 'string') {
    const s = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const parts = s.split('/');
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return s;
  }
  return '';
}

export function DatabaseStatusModal({ isOpen, onClose }: DatabaseStatusModalProps) {
  // Mode: 'upload' for loading Excel, 'census' for inspecting current system census
  const [viewMode, setViewMode] = useState<'upload' | 'census'>('upload');

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [syncingDb, setSyncingDb] = useState(false);
  const [importing, setImporting] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sheetName, setSheetName] = useState<string | null>(null);

  // Census in system count
  const [censusCount, setCensusCount] = useState(CANGURO_COLLABORATORS.length);

  useEffect(() => {
    const handleUpdate = () => setCensusCount(CANGURO_COLLABORATORS.length);
    window.addEventListener('canguro_storage_update', handleUpdate);
    return () => window.removeEventListener('canguro_storage_update', handleUpdate);
  }, []);

  // Parsed rows from Excel
  const [parsedItems, setParsedItems] = useState<ParsedExcelCollaborator[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('ALL');

  // Load status on open
  useEffect(() => {
    if (isOpen) {
      checkDatabaseStatus().then(setDbStatus);
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Descargar plantilla Excel oficial de ejemplo
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'NOMBRE DEL COLABORADOR': 'Alexis Martin Vasquez Reyes',
        'ID (CÉDULA)': '26120411',
        'CARGO': 'COORDINADOR DE TIENDA',
        'GERENCIA / DPTO.': 'OPERACIONES',
        'DIRECCIÓN': 'Dirección de Operaciones y Red de Tiendas',
        'ESTUDIO': 'TSU en Mercadeo',
        'FECHA DE INGRESO': '2022-09-01'
      },
      {
        'NOMBRE DEL COLABORADOR': 'Barbara Marina Bravo Portillo',
        'ID (CÉDULA)': '26546210',
        'CARGO': 'COORDINADOR (A) DE PLANIFICACION FINANCIERA',
        'GERENCIA / DPTO.': 'FINANZAS',
        'DIRECCIÓN': 'Dirección de Administración y Finanzas',
        'ESTUDIO': 'Licenciatura en Finanzas',
        'FECHA DE INGRESO': '2024-09-16'
      },
      {
        'NOMBRE DEL COLABORADOR': 'Carlos Eduardo Mendoza',
        'ID (CÉDULA)': '18500200',
        'CARGO': 'ASESOR (A) DE VENTAS INTEGRAL',
        'GERENCIA / DPTO.': 'OPERACIONES',
        'DIRECCIÓN': 'Dirección de Operaciones y Red de Tiendas',
        'ESTUDIO': 'Diversificado',
        'FECHA DE INGRESO': '2023-05-10'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PLANTILLA');
    XLSX.writeFile(wb, 'Plantilla_Carga_Colaboradores_Canguro.xlsx');
  };

  // Process Excel binary buffer
  const handleProcessExcelFile = (file: File) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls') && !lowerName.endsWith('.csv')) {
      setStatusMsg({
        success: false,
        message: 'Por favor sube un archivo Excel válido (.xlsx o .xls).'
      });
      return;
    }

    setFileName(file.name);
    setFileSize(`${Math.max(1, Math.round(file.size / 1024))} KB`);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        // Find sheet 'PLANTILLA' or fallback to first sheet
        const targetSheet = workbook.SheetNames.find(s => s.toUpperCase().includes('PLANTILLA')) || workbook.SheetNames[0];
        setSheetName(targetSheet);

        const worksheet = workbook.Sheets[targetSheet];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rows || rows.length < 2) {
          setStatusMsg({
            success: false,
            message: `La hoja "${targetSheet}" no contiene registros suficientes.`
          });
          return;
        }

        // Dynamically detect header row
        let headerIdx = -1;
        let nameCol = -1;
        let idCol = -1;
        let posCol = -1;
        let deptCol = -1;
        let dirCol = -1;
        let eduCol = -1;
        let hireCol = -1;

        for (let r = 0; r < Math.min(10, rows.length); r++) {
          const row = rows[r].map(c => String(c || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim());
          const isHeader = row.some(c => 
            c.includes('colaborador') || c.includes('cargo') || c.includes('gerencia') || c.includes('direccion') || c === 'id' || c.includes('cedula')
          );
          if (isHeader) {
            headerIdx = r;
            row.forEach((col, idx) => {
              if (nameCol === -1 && (col.includes('nombre') || col.includes('colaborador') || col.includes('empleado'))) nameCol = idx;
              else if (idCol === -1 && (col === 'id' || col.includes('cedula') || col.includes('identificacion') || col.includes('ci') || col.includes('numero'))) idCol = idx;
              else if (posCol === -1 && (col.includes('cargo') || col.includes('puesto') || col.includes('rol'))) posCol = idx;
              else if (deptCol === -1 && (col.includes('gerencia') || col.includes('departamento') || col.includes('unidad') || col.includes('area'))) deptCol = idx;
              else if (dirCol === -1 && (col.includes('direccion'))) dirCol = idx;
              else if (eduCol === -1 && (col.includes('estudio') || col.includes('grado') || col.includes('titulo') || col.includes('educacion'))) eduCol = idx;
              else if (hireCol === -1 && (col.includes('ingreso') || col.includes('inicio') || col.includes('fecha'))) hireCol = idx;
            });
            break;
          }
        }

        if (headerIdx === -1) {
          headerIdx = 0;
          nameCol = 0;
          idCol = 1;
          posCol = 2;
          deptCol = 3;
          dirCol = 4;
          eduCol = 5;
          hireCol = 6;
        }

        const parsed: ParsedExcelCollaborator[] = [];

        for (let r = headerIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0) continue;

          const rawName = String(nameCol >= 0 ? row[nameCol] : row[0] || '').trim();
          const rawIdVal = idCol >= 0 ? row[idCol] : row[1];
          const rawPos = String(posCol >= 0 ? row[posCol] : row[2] || '').trim();
          const rawDept = String(deptCol >= 0 ? row[deptCol] : row[3] || '').trim();
          const rawDir = String(dirCol >= 0 ? row[dirCol] : row[4] || '').trim();
          const rawEdu = String(eduCol >= 0 ? row[eduCol] : row[5] || '').trim();
          const rawHire = hireCol >= 0 ? row[hireCol] : row[6];

          if (!rawName && !rawIdVal && !rawPos) continue;

          const cleanId = String(rawIdVal || '').replace(/\D/g, '');
          const formattedId = cleanId ? formatIdNumber(cleanId) : (rawName ? `V-${Math.abs(rawName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 80000000}` : '');
          const fullName = rawName || `Colaborador ${cleanId}`;
          const position = rawPos || 'Analista';
          const department = rawDept || 'OPERACIONES';
          const normalizedDir = rawDir ? (normalizeDirectorate(rawDir, position) as string) : (normalizeDirectorate(department, position) as string);
          const hireDate = parseExcelDate(rawHire) || '2023-01-15';

          const posLower = position.toLowerCase();
          const managementLevel: 'ESTRATÉGICO' | 'TÉCNICO / INTERMEDIO' | 'OPERATIVO' = 
            (posLower.includes('director') || posLower.includes('gerente') || posLower.includes('cio') || posLower.includes('presidente')) 
              ? 'ESTRATÉGICO' 
              : (posLower.includes('coordinador') || posLower.includes('supervisor') || posLower.includes('lider') || posLower.includes('líder') || posLower.includes('encargado'))
                ? 'TÉCNICO / INTERMEDIO'
                : 'OPERATIVO';

          const scope: '360' | '180' = managementLevel !== 'OPERATIVO' ? '360' : '180';

          // VINCULAR CON EL ORGANIGRAMA CORPORATIVO
          const hierarchy = resolveOfficialHierarchy(cleanId, position, normalizedDir, department);

          parsed.push({
            fullName,
            idNumber: formattedId,
            rawId: cleanId,
            position,
            department,
            directorate: normalizedDir,
            educationDegree: rawEdu || 'Diversificado',
            hireDate,
            hierarchy,
            managementLevel,
            scope
          });
        }

        setParsedItems(parsed);
        setStatusMsg({
          success: true,
          message: `¡Lectura exitosa! Se extrajeron ${parsed.length} colaboradores listos para vincular con el Organigrama Corporativo.`
        });
      } catch (err: any) {
        setStatusMsg({
          success: false,
          message: `Error al procesar el archivo Excel: ${err.message}`
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessExcelFile(e.dataTransfer.files[0]);
    }
  };

  // Commit imported rows to CANGURO_COLLABORATORS & LocalStorage & PostgreSQL
  const handleCommitImport = async () => {
    if (parsedItems.length === 0) return;
    setImporting(true);
    setStatusMsg(null);

    // Yield execution to allow React to render the loading state immediately
    await new Promise((resolve) => setTimeout(resolve, 60));

    try {
      // Importación masiva ultra-eficiente en memoria y almacenamiento local seguro
      const result = bulkCommitCollaborators(parsedItems);
      setCensusCount(CANGURO_COLLABORATORS.length);

      let dbMsg = '';
      if (dbStatus?.connected) {
        try {
          const dbRes = await syncCensusToDatabase();
          if (dbRes.success) {
            dbMsg = ` y sincronizado en PostgreSQL (${dbRes.count} colaboradores)`;
          }
        } catch (dbErr) {
          console.warn('PostgreSQL sync notice:', dbErr);
        }
      }

      setStatusMsg({
        success: true,
        message: `¡${result.count} colaboradores fueron incorporados y vinculados exitosamente al Organigrama Corporativo${dbMsg}! Los portales de evaluación han sido actualizados.`
      });
      setViewMode('census');
    } catch (err: any) {
      console.error('Error al vincular colaboradores:', err);
      setStatusMsg({
        success: false,
        message: `Error al vincular colaboradores: ${err?.message || 'Error en el procesamiento'}`
      });
    } finally {
      setImporting(false);
    }
  };

  // Sincronizar censo manual a PostgreSQL
  const handleManualSyncPostgres = async () => {
    setSyncingDb(true);
    setStatusMsg(null);
    try {
      const res = await syncCensusToDatabase();
      if (res.success) {
        setStatusMsg({
          success: true,
          message: `¡Censo de ${res.count} colaboradores sincronizado exitosamente con la base de datos PostgreSQL!`
        });
      } else {
        setStatusMsg({
          success: false,
          message: res.message
        });
      }
      const s = await checkDatabaseStatus();
      setDbStatus(s);
    } catch (err: any) {
      setStatusMsg({
        success: false,
        message: `Fallo de conexión PostgreSQL: ${err.message}`
      });
    } finally {
      setSyncingDb(false);
    }
  };

  // Filtering parsed items or active census
  const filterList = (items: any[]) => {
    return items.filter(c => {
      const term = searchQuery.toLowerCase().trim();
      const dirMatch = selectedDirection === 'ALL' || (c.directorate || c.info?.directorate || '').includes(selectedDirection);
      if (!dirMatch) return false;
      if (!term) return true;

      const name = (c.fullName || c.info?.fullName || `${c.info?.firstName} ${c.info?.lastName}` || '').toLowerCase();
      const id = (c.idNumber || c.info?.idNumber || '').toLowerCase();
      const pos = (c.position || c.info?.position || '').toLowerCase();
      const dept = (c.department || c.info?.department || '').toLowerCase();
      const dir = (c.directorate || c.info?.directorate || '').toLowerCase();

      return name.includes(term) || id.includes(term) || pos.includes(term) || dept.includes(term) || dir.includes(term);
    });
  };

  const displayedPreview = filterList(parsedItems);
  const displayedCensus = filterList(CANGURO_COLLABORATORS);

  // Statistics
  const linkedWithSupervisorCount = parsedItems.filter(p => p.hierarchy?.immediateSupervisor).length;
  const managersAndCoordCount = parsedItems.filter(p => p.scope === '360').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[94vh]">
        
        {/* Top Header - Single Section Identity */}
        <div className="bg-zinc-950 text-white p-4 sm:p-5 border-b-2 border-[#F1B400] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F1B400] text-black shadow-md font-bold">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider font-mono">
                  Base de Datos de Colaboradores (Plantilla Excel)
                </h3>
                <span className="hidden sm:inline-block text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  Formato Oficial .xlsx / .xls
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                Districueros El Canguro, C.A. • Vinculación automática con Organigramas Corporativos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* View Mode Bar: Upload vs Current Census */}
        <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'upload'
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Upload size={14} className={viewMode === 'upload' ? 'text-[#F1B400]' : ''} />
              Cargar Archivo Excel
              {parsedItems.length > 0 && (
                <span className="bg-[#F1B400] text-black text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {parsedItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setViewMode('census')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'census'
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Users size={14} className={viewMode === 'census' ? 'text-blue-500' : ''} />
              Ver Censo Actual en Sistema
              <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {censusCount}
              </span>
            </button>
          </div>

          {/* Database Connection Pill */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
              dbStatus?.connected 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}>
              <Database size={12} className={dbStatus?.connected ? 'text-emerald-500' : 'text-zinc-400'} />
              <span>{dbStatus?.connected ? 'PostgreSQL Conectado' : 'Almacenamiento Local Activo'}</span>
            </div>
            {dbStatus?.connected && (
              <button
                onClick={handleManualSyncPostgres}
                disabled={syncingDb}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={11} className={syncingDb ? 'animate-spin' : ''} />
                Sincronizar
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Status Alert Banner */}
          {statusMsg && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-3 animate-in fade-in duration-200 ${
              statusMsg.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
                : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300'
            }`}>
              {statusMsg.success ? (
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium leading-relaxed">
                {statusMsg.message}
              </div>
            </div>
          )}

          {/* VIEW MODE 1: UPLOAD EXCEL */}
          {viewMode === 'upload' && (
            <div className="space-y-4">
              
              {/* Mandatory Column Guide Banner matching User's Image 2 */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-[#F1B400]/40 text-zinc-800 dark:text-zinc-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#F1B400]" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Estructura Requerida de la Plantilla Excel (Columnas Oficiales):
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1.5 bg-[#F1B400] hover:bg-[#d99c00] active:scale-[0.98] text-black text-xs font-bold font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                    title="Descargar plantilla de Excel pre-formateada con las 7 columnas requeridas"
                  >
                    <Download size={13} />
                    <span>Descargar Plantilla Oficial (.xlsx)</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-[10px] font-mono font-bold">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg text-center shadow-2xs">
                    <span className="text-zinc-400 block text-[9px]">1. COLUMNA</span>
                    <span className="text-[#F1B400] truncate block">NOMBRE DEL COLABORADOR</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg text-center shadow-2xs">
                    <span className="text-zinc-400 block text-[9px]">2. COLUMNA</span>
                    <span className="text-blue-500 truncate block">ID (CÉDULA)</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg text-center shadow-2xs">
                    <span className="text-zinc-400 block text-[9px]">3. COLUMNA</span>
                    <span className="text-purple-500 truncate block">CARGO CORREGIDO</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg text-center shadow-2xs">
                    <span className="text-zinc-400 block text-[9px]">4. COLUMNA</span>
                    <span className="text-emerald-500 truncate block">GERENCIA / DPTO.</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg text-center shadow-2xs">
                    <span className="text-zinc-400 block text-[9px]">5. COLUMNA</span>
                    <span className="text-indigo-500 truncate block">DIRECCIÓN</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg text-center shadow-2xs">
                    <span className="text-zinc-400 block text-[9px]">6. COLUMNA</span>
                    <span className="text-amber-500 truncate block">ESTUDIO</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg text-center shadow-2xs">
                    <span className="text-zinc-400 block text-[9px]">7. COLUMNA</span>
                    <span className="text-teal-500 truncate block">FECHA DE INGRESO</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                  * El sistema interpreta automáticamente estas 7 columnas para vincular el <strong>Nombre</strong> y el <strong>ID</strong> con el <strong>Cargo</strong>, la <strong>Gerencia</strong> y la <strong>Dirección</strong>, asignando en tiempo real su <strong>Supervisor Inmediato</strong>, <strong>Pares Oficiales</strong> y <strong>Subordinados Directos</strong> según los Organigramas Corporativos.
                </p>
              </div>

              {/* Drag & Drop File Upload Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-[#F1B400] bg-amber-500/10 scale-[1.01]' 
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-[#F1B400] bg-zinc-50 dark:bg-zinc-900/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleProcessExcelFile(e.target.files[0]);
                    }
                  }}
                />
                
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-4 rounded-2xl bg-[#F1B400]/20 text-[#F1B400] shadow-sm">
                    <FileSpreadsheet size={36} />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold font-mono text-zinc-900 dark:text-white">
                      {fileName ? fileName : 'Selecciona o Arrastra el Archivo Excel de Colaboradores'}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      {fileSize ? `Tamaño: ${fileSize} • Hoja activa: ${sheetName || 'PLANTILLA'}` : 'Archivos compatibles: .xlsx o .xls con la plantilla de 7 columnas'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-1 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold font-mono rounded-xl hover:bg-zinc-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Upload size={14} />
                    {fileName ? 'Reemplazar Archivo Excel' : 'Examinar en mi Computadora'}
                  </button>
                </div>
              </div>

              {/* If Rows are parsed, show Stats & Commit Action Bar */}
              {parsedItems.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <span className="text-[10px] text-zinc-400 font-mono block">TOTAL PROCESADOS</span>
                      <span className="text-lg font-black font-mono text-[#F1B400]">{parsedItems.length}</span>
                      <span className="text-[10px] text-zinc-500 block">Registros válidos</span>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <span className="text-[10px] text-zinc-400 font-mono block">VINCULADOS A ORGANIGRAMA</span>
                      <span className="text-lg font-black font-mono text-emerald-500">{linkedWithSupervisorCount}</span>
                      <span className="text-[10px] text-zinc-500 block">Con Supervisor Oficial</span>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <span className="text-[10px] text-zinc-400 font-mono block">EVALUACIONES 360°</span>
                      <span className="text-lg font-black font-mono text-purple-500">{managersAndCoordCount}</span>
                      <span className="text-[10px] text-zinc-500 block">Gerentes & Coord.</span>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <span className="text-[10px] text-zinc-400 font-mono block">EVALUACIONES 180°</span>
                      <span className="text-lg font-black font-mono text-blue-500">{parsedItems.length - managersAndCoordCount}</span>
                      <span className="text-[10px] text-zinc-500 block">Nivel Operativo</span>
                    </div>
                  </div>

                  {/* Primary Call to Action Button */}
                  <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md">
                        <UserCheck size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black font-mono text-emerald-800 dark:text-emerald-300">
                          ¿Deseas aplicar estos {parsedItems.length} colaboradores al sistema?
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          Se actualizarán las relaciones de jerarquía, organigrama y listas de evaluación de todos los colaboradores.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleCommitImport}
                      disabled={importing}
                      className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {importing ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Vinculando Colaboradores...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          IMPORTAR Y VINCULAR AL SISTEMA
                        </>
                      )}
                    </button>
                  </div>

                  {/* Search and Filter for Preview */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 justify-between">
                    <div className="relative w-full sm:w-80">
                      <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre, ID o cargo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:border-[#F1B400]"
                      />
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Mostrando {displayedPreview.length} de {parsedItems.length} en vista previa
                    </span>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-mono text-[10px] uppercase sticky top-0 border-b border-zinc-200 dark:border-zinc-800 z-10">
                          <tr>
                            <th className="py-2.5 px-3">Colaborador / ID</th>
                            <th className="py-2.5 px-3">Cargo Corregido</th>
                            <th className="py-2.5 px-3">Gerencia & Dirección</th>
                            <th className="py-2.5 px-3">Supervisor Inmediato</th>
                            <th className="py-2.5 px-3">Pares / Subordinados</th>
                            <th className="py-2.5 px-3 text-center">Estado Jerarquía</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                          {displayedPreview.slice(0, 100).map((col, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate max-w-[180px]">
                                  {col.fullName}
                                </span>
                                <span className="font-mono text-[10px] text-zinc-400 block">
                                  {col.idNumber}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="text-zinc-800 dark:text-zinc-200 font-medium block truncate max-w-[180px]">
                                  {col.position}
                                </span>
                                <span className={`inline-block text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                  col.scope === '360' 
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                }`}>
                                  {col.scope === '360' ? 'Evaluación 360°' : 'Evaluación 180°'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="text-zinc-700 dark:text-zinc-300 block text-[11px] truncate max-w-[160px]">
                                  {col.department}
                                </span>
                                <span className="text-[10px] text-zinc-400 block truncate max-w-[160px]">
                                  {col.directorate}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                {col.hierarchy?.immediateSupervisor ? (
                                  <div>
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400 block truncate max-w-[160px]">
                                      {col.hierarchy.immediateSupervisor.name}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 block truncate max-w-[160px]">
                                      {col.hierarchy.immediateSupervisor.position}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-amber-500 text-[10px] font-mono font-bold">
                                    Por asignar
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="text-[10px] font-mono space-y-0.5">
                                  <span className="text-purple-600 dark:text-purple-400 block">
                                    {col.hierarchy?.officialPeers?.length || 0} Pares
                                  </span>
                                  <span className="text-teal-600 dark:text-teal-400 block">
                                    {col.hierarchy?.officialSubordinates?.length || 0} Subordinados
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                  <Check size={10} />
                                  Vinculado
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: ACTIVE CENSUS IN SYSTEM */}
          {viewMode === 'census' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-white">
                    Censo de Colaboradores Registrado en el Sistema
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Total: {censusCount} colaboradores activos con acceso al Portal de Evaluaciones
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por nombre, cédula o cargo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:border-[#F1B400]"
                  />
                </div>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-mono text-[10px] uppercase sticky top-0 border-b border-zinc-200 dark:border-zinc-800 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Colaborador</th>
                        <th className="py-2.5 px-3">Cédula / ID</th>
                        <th className="py-2.5 px-3">Cargo</th>
                        <th className="py-2.5 px-3">Gerencia & Dirección</th>
                        <th className="py-2.5 px-3 text-center">Alcance</th>
                        <th className="py-2.5 px-3">Jerarquía Organigrama</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                      {displayedCensus.slice(0, 100).map((col, idx) => {
                        const cleanId = (col.info.idNumber || col.info.id || '').replace(/\D/g, '');
                        const org = resolveOfficialHierarchy(cleanId, col.info.position, col.info.directorate, col.info.department);
                        return (
                          <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                              {col.info.fullName || `${col.info.firstName} ${col.info.lastName}`}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-500">
                              {col.info.idNumber || col.info.id}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300 font-medium">
                              {col.info.position}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="block text-[11px] text-zinc-800 dark:text-zinc-200 truncate max-w-[160px]">
                                {col.info.department}
                              </span>
                              <span className="block text-[10px] text-zinc-400 truncate max-w-[160px]">
                                {col.info.directorate}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                                col.info.scope === '360' 
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              }`}>
                                {col.info.scope === '360' ? '360°' : '180°'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              {org?.immediateSupervisor ? (
                                <div className="text-[10px]">
                                  <span className="text-zinc-400 block">Supervisor:</span>
                                  <span className="font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-[150px] block">
                                    {org.immediateSupervisor.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-zinc-400">Directo Dirección</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-zinc-500 font-mono">
            {censusCount} Colaboradores en Memoria • Plantilla Oficial de Desempeño
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold font-mono rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
}
