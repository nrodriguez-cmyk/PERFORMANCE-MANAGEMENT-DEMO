import { CANGURO_COLLABORATORS, CanguroCollaborator } from '../data/canguroUniverso';
import { getManagementLevel, ManagementLevel } from './responsibilityResolver';
import { OFFICIAL_ORGANIGRAMAS, resolveOfficialHierarchy } from '../data/officialOrgChart';

export interface EvaluationTargetOption {
  id: string;
  name: string;
  position: string;
  idNumber: string;
  department: string;
  directorate: string;
  managementLevel: ManagementLevel;
  groupLabel: 'Supervisor Inmediato (Organigrama Oficial)' | 'Reportes Directos (Organigrama Oficial)' | 'Misma Dirección / Departamento' | 'Otras Áreas / Red Nacional' | 'Pares Directos (Organigrama Oficial)';
}

export interface EvaluationRelationsResult {
  immediateSupervisor: EvaluationTargetOption | null;
  peers: EvaluationTargetOption[];
  subordinates: EvaluationTargetOption[];
  isFromOfficialOrgChart: boolean;
}

/**
 * Resuelve y organiza con precisión la lista de Supervisor Inmediato, Pares y Subordinados directos
 * basándose en los Organigramas Corporativos Oficiales y en la base de datos de colaboradores.
 */
export function getCollaboratorEvaluationRelations(
  currentIdNumber: string = '',
  currentPosition: string = '',
  currentDirectorate: string = '',
  currentDepartment: string = '',
  collaborators: CanguroCollaborator[] = CANGURO_COLLABORATORS
): EvaluationRelationsResult {
  const cleanCurrentId = (currentIdNumber || '').replace(/\D/g, '');
  const userMgmtLevel = getManagementLevel(currentPosition);
  const userPosClean = (currentPosition || '').toLowerCase().trim();
  const userDirClean = (currentDirectorate || '').toLowerCase().trim();
  const userDeptClean = (currentDepartment || '').toLowerCase().trim();

  // 1. INTENTAR RESOLVER JERARQUÍA EXACTA A TRAVÉS DE LOS ORGANIGRAMAS CORPORATIVOS OFICIALES
  const officialHierarchy = resolveOfficialHierarchy(
    cleanCurrentId,
    currentPosition,
    currentDirectorate,
    currentDepartment
  );

  if (officialHierarchy) {
    const immediateSupervisor: EvaluationTargetOption | null = officialHierarchy.immediateSupervisor
      ? {
          id: officialHierarchy.immediateSupervisor.idNumber,
          name: officialHierarchy.immediateSupervisor.name,
          position: officialHierarchy.immediateSupervisor.position,
          idNumber: officialHierarchy.immediateSupervisor.idNumber,
          department: officialHierarchy.immediateSupervisor.department,
          directorate: officialHierarchy.immediateSupervisor.directorate,
          managementLevel: getManagementLevel(officialHierarchy.immediateSupervisor.position),
          groupLabel: 'Supervisor Inmediato (Organigrama Oficial)'
        }
      : null;

    const peers: EvaluationTargetOption[] = officialHierarchy.officialPeers.map(p => ({
      id: p.idNumber,
      name: p.name,
      position: p.position,
      idNumber: p.idNumber,
      department: p.department,
      directorate: p.directorate,
      managementLevel: getManagementLevel(p.position),
      groupLabel: 'Pares Directos (Organigrama Oficial)'
    }));

    const subordinates: EvaluationTargetOption[] = officialHierarchy.officialSubordinates.map(s => ({
      id: s.idNumber,
      name: s.name,
      position: s.position,
      idNumber: s.idNumber,
      department: s.department,
      directorate: s.directorate,
      managementLevel: getManagementLevel(s.position),
      groupLabel: 'Reportes Directos (Organigrama Oficial)'
    }));

    return {
      immediateSupervisor,
      peers,
      subordinates,
      isFromOfficialOrgChart: true
    };
  }

  // 2. FALLBACK HEURÍSTICO SI NO SE UBICÓ DIRECTAMENTE EN EL ORGANIGRAMA ESTRICTO
  const currentPerson = collaborators.find(c => {
    const cid = (c.info?.idNumber || '').replace(/\D/g, '');
    return cleanCurrentId && cid === cleanCurrentId;
  });
  const currentFullName = currentPerson
    ? `${currentPerson.info?.firstName || ''} ${currentPerson.info?.lastName || ''}`.toLowerCase()
    : '';

  // Excluir al propio usuario evaluador de las listas de destino
  const candidates = (collaborators || []).filter(c => {
    const cid = (c.info?.idNumber || '').replace(/\D/g, '');
    if (cleanCurrentId && cid === cleanCurrentId) return false;
    const cName = `${c.info?.firstName || ''} ${c.info?.lastName || ''}`.trim();
    if (!cName) return false;
    return true;
  });

  const isSameDirOrDept = (c: CanguroCollaborator): boolean => {
    const cDir = (c.info?.directorate || '').toLowerCase().trim();
    const cDept = (c.info?.department || '').toLowerCase().trim();
    return (
      (userDirClean.length > 2 && (cDir.includes(userDirClean) || userDirClean.includes(cDir))) ||
      (userDeptClean.length > 2 && (cDept.includes(userDeptClean) || userDeptClean.includes(cDept)))
    );
  };

  const toOption = (
    c: CanguroCollaborator,
    group: EvaluationTargetOption['groupLabel']
  ): EvaluationTargetOption => ({
    id: c.info?.id || c.info?.idNumber || '',
    name: `${c.info?.firstName || ''} ${c.info?.lastName || ''}`.trim(),
    position: c.info?.position || 'Colaborador',
    idNumber: c.info?.idNumber || '',
    department: c.info?.department || 'General',
    directorate: c.info?.directorate || 'General',
    managementLevel: getManagementLevel(c.info?.position || ''),
    groupLabel: group
  });

  // DETERMINAR SUBORDINADOS (FALLBACK)
  let directReportCandidates: CanguroCollaborator[] = [];
  let otherSubCandidates: CanguroCollaborator[] = [];

  if (userMgmtLevel === 'ESTRATÉGICO') {
    otherSubCandidates = candidates.filter(c => {
      const lvl = getManagementLevel(c.info?.position || '');
      return (lvl === 'TÉCNICO / INTERMEDIO' || lvl === 'OPERATIVO') && isSameDirOrDept(c);
    });
  } else if (userMgmtLevel === 'TÉCNICO / INTERMEDIO') {
    otherSubCandidates = candidates.filter(c => {
      const lvl = getManagementLevel(c.info?.position || '');
      return lvl === 'OPERATIVO' && isSameDirOrDept(c);
    });
  }

  directReportCandidates.sort((a, b) => `${a.info.firstName} ${a.info.lastName}`.localeCompare(`${b.info.firstName} ${b.info.lastName}`, 'es'));
  otherSubCandidates.sort((a, b) => `${a.info.firstName} ${a.info.lastName}`.localeCompare(`${b.info.firstName} ${b.info.lastName}`, 'es'));

  const finalSubordinates: EvaluationTargetOption[] = [
    ...directReportCandidates.map(c => toOption(c, 'Reportes Directos (Organigrama Oficial)')),
    ...otherSubCandidates.slice(0, 30).map(c => toOption(c, 'Misma Dirección / Departamento'))
  ];

  // DETERMINAR PARES
  const peerCandidates = candidates.filter(c => {
    const lvl = getManagementLevel(c.info?.position || '');
    return lvl === userMgmtLevel;
  });

  const directPeers = peerCandidates.filter(isSameDirOrDept).sort((a, b) => {
    const nA = `${a.info.firstName} ${a.info.lastName}`;
    const nB = `${b.info.firstName} ${b.info.lastName}`;
    return nA.localeCompare(nB, 'es');
  });

  const crossDeptPeers = peerCandidates.filter(c => !isSameDirOrDept(c)).sort((a, b) => {
    const nA = `${a.info.firstName} ${a.info.lastName}`;
    const nB = `${b.info.firstName} ${b.info.lastName}`;
    return nA.localeCompare(nB, 'es');
  });

  const finalPeers: EvaluationTargetOption[] = [
    ...directPeers.map(c => toOption(c, 'Pares Directos (Organigrama Oficial)')),
    ...crossDeptPeers.slice(0, 25).map(c => toOption(c, 'Otras Áreas / Red Nacional'))
  ];

  return {
    immediateSupervisor: null,
    peers: finalPeers,
    subordinates: finalSubordinates,
    isFromOfficialOrgChart: false
  };
}
