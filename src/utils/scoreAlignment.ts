import { NINE_BOX_MATRIX, NineBoxCell } from '../types';

export interface GaussianPoint {
  x: number; // score from 1.0 to 5.0
  y: number; // probability density
  isEmployeePoint?: boolean;
}

export interface NineBoxPosition {
  xLevel: 'Bajo' | 'Medio' | 'Alto';
  yLevel: 'Bajo' | 'Medio' | 'Alto';
  xScore: number;
  yScore: number;
  cell: NineBoxCell;
}

/**
 * Calculates Gaussian Bell Curve points
 * Universo Canguro parameters: Mean (mu) = 3.90, Std Dev (sigma) = 0.55
 */
export function generateGaussianCurve(
  employeeScore: number,
  mu: number = 3.90,
  sigma: number = 0.55,
  pointsCount: number = 60
): { points: GaussianPoint[]; employeePoint: GaussianPoint; cargoAvg: number; directorateAvg: number; globalMedian: number } {
  const points: GaussianPoint[] = [];
  const minX = 1.0;
  const maxX = 5.0;
  const step = (maxX - minX) / (pointsCount - 1);

  // Normal PDF formula
  const pdf = (x: number) => {
    const coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mu) / sigma, 2);
    return coeff * Math.exp(exponent);
  };

  for (let i = 0; i < pointsCount; i++) {
    const x = Number((minX + (i * step)).toFixed(2));
    const y = Number(pdf(x).toFixed(4));
    points.push({ x, y });
  }

  const employeeY = Number(pdf(Math.min(5.0, Math.max(1.0, employeeScore))).toFixed(4));
  const employeePoint: GaussianPoint = {
    x: Number(employeeScore.toFixed(2)),
    y: employeeY,
    isEmployeePoint: true
  };

  return {
    points,
    employeePoint,
    cargoAvg: Number((mu + 0.08).toFixed(2)),
    directorateAvg: Number((mu - 0.05).toFixed(2)),
    globalMedian: mu
  };
}

/**
 * Maps performance (X) and potential (Y) to the Nine-Box Matrix
 * Eje X (Desempeño): Bajo < 3.00, Medio 3.00 - 4.24, Alto >= 4.25
 * Eje Y (Potencial): Bajo < 3.00, Medio 3.00 - 4.24, Alto >= 4.25
 */
export function mapToNineBox(performanceScore: number, potentialScore: number): NineBoxPosition {
  const getXLevel = (val: number): 'Bajo' | 'Medio' | 'Alto' => {
    if (val >= 4.25) return 'Alto';
    if (val >= 3.00) return 'Medio';
    return 'Bajo';
  };

  const getYLevel = (val: number): 'Bajo' | 'Medio' | 'Alto' => {
    if (val >= 4.25) return 'Alto';
    if (val >= 3.00) return 'Medio';
    return 'Bajo';
  };

  const xLevel = getXLevel(performanceScore);
  const yLevel = getYLevel(potentialScore);

  const key = `${yLevel}-${xLevel}`;
  const cell = NINE_BOX_MATRIX[key] || {
    x: xLevel,
    y: yLevel,
    title: 'Talento Clave',
    action: 'Estabilidad y desarrollo en tramo óptimo Canguro',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  };

  return {
    xLevel,
    yLevel,
    xScore: Number(performanceScore.toFixed(2)),
    yScore: Number(potentialScore.toFixed(2)),
    cell
  };
}
