import { CANGURO_COLLABORATORS, SUCCESSION_CRITICAL_POSITIONS } from '../src/data/canguroUniverso.js';

console.log('Total collaborators loaded:', CANGURO_COLLABORATORS.length);
console.log('Sample collaborator 0:', CANGURO_COLLABORATORS[0].info);
console.log('Sample collaborator last:', CANGURO_COLLABORATORS[CANGURO_COLLABORATORS.length - 1].info);
console.log('Critical succession positions count:', SUCCESSION_CRITICAL_POSITIONS.length);
for (const pos of SUCCESSION_CRITICAL_POSITIONS) {
  console.log(`- Position: ${pos.title} | Current Occupant: ${pos.currentOccupant} | Successors: ${pos.successors.length} (${pos.successors.map(s => s.employeeName).join(', ')})`);
}
