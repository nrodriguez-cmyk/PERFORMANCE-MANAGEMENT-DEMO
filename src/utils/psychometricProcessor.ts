import { BigFiveTrait, BigFiveResult } from '../types';
import { BIG_FIVE_20_ITEMS } from '../promotionQuestions';

export type LikertScores = Record<string, number>; // item id -> 1 to 5

export function processBigFiveScores(answers: LikertScores): BigFiveResult {
  const traitBuckets: Record<BigFiveTrait, number[]> = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    emotional_stability: []
  };

  BIG_FIVE_20_ITEMS.forEach(item => {
    const rawVal = answers[item.id] || 3; // default neutral 3
    const finalScore = item.inverted ? (6 - rawVal) : rawVal;
    traitBuckets[item.trait].push(finalScore);
  });

  const raw: Record<BigFiveTrait, number> = {
    openness: 3,
    conscientiousness: 3,
    extraversion: 3,
    agreeableness: 3,
    emotional_stability: 3
  };

  const normalized: Record<BigFiveTrait, number> = {
    openness: 60,
    conscientiousness: 60,
    extraversion: 60,
    agreeableness: 60,
    emotional_stability: 60
  };

  const interpretations: Record<BigFiveTrait, string> = {
    openness: '',
    conscientiousness: '',
    extraversion: '',
    agreeableness: '',
    emotional_stability: ''
  };

  let totalSum = 0;
  let totalCount = 0;

  (Object.keys(traitBuckets) as BigFiveTrait[]).forEach(trait => {
    const arr = traitBuckets[trait];
    const avg = arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
    raw[trait] = Number(avg.toFixed(2));
    
    // Normalization to 0-100: ((score - 1) / 4) * 100
    const norm = Math.round(((avg - 1) / 4) * 100);
    normalized[trait] = Math.max(0, Math.min(100, norm));

    totalSum += avg;
    totalCount += 1;

    // Interpretations
    if (trait === 'openness') {
      interpretations[trait] = avg >= 4.0 
        ? 'Alta receptividad al cambio e innovación en procesos' 
        : avg >= 3.0 ? 'Aceptación moderada de cambios guiados' : 'Marcada preferencia por rutinas y métodos tradicionales';
    } else if (trait === 'conscientiousness') {
      interpretations[trait] = avg >= 4.0 
        ? 'Sobresaliente disciplina, autoexigencia y orden estricto' 
        : avg >= 3.0 ? 'Cumplimiento adecuado bajo supervisión habitual' : 'Tendencia a desorden o inconsistencia en entregables';
    } else if (trait === 'extraversion') {
      interpretations[trait] = avg >= 4.0 
        ? 'Gran dinamismo, comunicación asertiva y liderazgo motivador' 
        : avg >= 3.0 ? 'Interacción social efectiva en círculos directos' : 'Preferencia por trabajo individualizado con baja exposición';
    } else if (trait === 'agreeableness') {
      interpretations[trait] = avg >= 4.0 
        ? 'Empatía genuina, espíritu colaborativo y orientación al cliente' 
        : avg >= 3.0 ? 'Cooperación estándar con apego a reglas funcionales' : 'Poco interés en conciliar desacuerdos con pares';
    } else if (trait === 'emotional_stability') {
      interpretations[trait] = avg >= 4.0 
        ? 'Elevada templanza, resiliencia y autocontrol bajo presión' 
        : avg >= 3.0 ? 'Manejo balanceado del estrés cotidiano de tienda' : 'Vulnerabilidad ante imprevistos o sobrecarga de tareas';
    }
  });

  const overallAvg = totalCount > 0 ? (totalSum / totalCount) : 3;

  return {
    raw,
    normalized,
    interpretations,
    suitabilityScore: Number(overallAvg.toFixed(2))
  };
}
