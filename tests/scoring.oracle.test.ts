/**
 * Suite oráculo de cálculo (requeriment.md §6.4-6.7).
 * Codifica las reglas OFICIALES; contra la implementación actual está EN ROJO por diseño.
 * No ajustar los valores esperados para "pasar": corregir src/ en una ola posterior.
 */
import { describe, it, expect } from 'vitest';
import { calculateConsolidatedMetrics } from '../src/utils/realEvaluationMetrics';
import { mapToNineBox } from '../src/utils/scoreAlignment';
import {
  getOfficialCompetencyQuestions,
  resolveEmployeeCompetencyProfile,
  ALL_OFFICIAL_COMPETENCIES,
} from '../src/data/canguroCompetencyDictionary';
import { MERIT_TIERS, resolvePromotionThreshold } from '../src/types';
import { getManagementLevel } from '../src/utils/responsibilityResolver';

// ---------- Oráculo (reglas oficiales) ----------
type Mod = '360p' | '360s' | '180p' | '180s';
const W = {
  '360p': { sup: 0.45, sub: 0.25, peer: 0.15, self: 0.15 },
  '360s': { sup: 0.5, sub: 0.3, peer: 0, self: 0.2 },
  '180p': { sup: 0.55, sub: 0, peer: 0.25, self: 0.2 },
  '180s': { sup: 0.7, sub: 0, peer: 0, self: 0.3 },
} as const;
type Src = 'sup' | 'sub' | 'peer' | 'self';
type Vals = Record<Src, number>;
const r2 = (n: number) => Math.round((n + 1e-9) * 100) / 100;
const oracleTier = (f: number) => (f >= 4.75 ? 5 : f >= 4.25 ? 4 : f >= 3.75 ? 3 : f >= 3.0 ? 2 : 1);
const block = (mod: Mod, v: Vals) =>
  r2((Object.keys(W[mod]) as Src[]).reduce((a, k) => a + W[mod][k] * (v[k] ?? 0), 0));
const oracleFinal = (mod: Mod, b1: Vals, b2: Vals) => {
  const B1 = block(mod, b1), B2 = block(mod, b2);
  const F = r2(0.6 * B1 + 0.4 * B2);
  return { B1, B2, F, tier: oracleTier(F) };
};

// ---------- Helpers de construcción (IDs ficticios, sin datos reales) ----------
const opB1 = (v: number) => {
  const s: Record<string, number> = {};
  for (let i = 1; i <= 4; i++) s[`op_kpi_${i}`] = v;
  for (let i = 1; i <= 4; i++) s[`op_cond_${i}`] = v;
  for (let i = 1; i <= 3; i++) s[`op_strat_${i}`] = v;
  return s;
};
const b2Ids = (pos: string, dir: string): string[] =>
  getOfficialCompetencyQuestions(pos, dir).map((q: any) => q.id);
const mk = (b1: number, b2: number, pos: string, dir: string, extra: Record<string, number> = {}) => {
  const scores: Record<string, number> = { ...opB1(b1), ...extra };
  b2Ids(pos, dir).forEach((id) => (scores[id] = b2));
  return { scores, comments: '', submittedAt: '2026-01-01T00:00:00Z', isLocked: true } as any;
};
const pot = (v: number) => {
  const s: Record<string, number> = {};
  for (let i = 1; i <= 18; i++) s[`pot_${i}`] = v;
  return s;
};
const DIR = 'Dirección de Operaciones';

// ---------- A. Fórmula y pesos por fuente ----------
describe('Fórmula y pesos por fuente (6.4)', () => {
  const vals: Vals = { self: 5, sup: 3, peer: 4, sub: 2 };
  const cases: Array<[string, Mod, string, boolean, boolean]> = [
    ['CAL-01', '360p', 'Coordinador', true, true],
    ['CAL-02', '360s', 'Coordinador', false, true],
    ['CAL-03', '180p', 'Analista', true, false],
    ['CAL-04', '180s', 'Analista', false, false],
  ];
  describe.each(cases)('%s %s', (_id, mod, pos, withPeer, withSub) => {
    const exp = oracleFinal(mod, vals, vals);
    const got = calculateConsolidatedMetrics(
      mk(5, 5, pos, DIR),
      mk(3, 3, pos, DIR),
      withPeer ? mk(4, 4, pos, DIR) : undefined,
      withSub ? mk(2, 2, pos, DIR) : undefined,
      withSub,
    );
    it(`B1 ponderado = ${exp.B1.toFixed(2)}`, () => expect(Number(got.block1Score)).toBeCloseTo(exp.B1, 2));
    it(`B2 ponderado = ${exp.B2.toFixed(2)}`, () => expect(Number(got.block2Score)).toBeCloseTo(exp.B2, 2));
    it(`nota final = ${exp.F.toFixed(2)}`, () => expect(Number(got.finalScore)).toBeCloseTo(exp.F, 2));
    it(`tramo = T${exp.tier}`, () => expect(got.meritTier.id).toBe(exp.tier));
  });

  it('ejemplo conocido: 360 con pares, Sup 3 / Sub 2 / Pares 4 / Auto 5 => 3.20 (T2)', () => {
    const g = calculateConsolidatedMetrics(
      mk(5, 5, 'Coordinador', DIR),
      mk(3, 3, 'Coordinador', DIR),
      mk(4, 4, 'Coordinador', DIR),
      mk(2, 2, 'Coordinador', DIR),
      true,
    );
    expect(Number(g.finalScore)).toBeCloseTo(3.2, 2);
    expect(g.meritTier.id).toBe(2);
  });
});

// ---------- B. Tramos (6.6) ----------
describe('Tramos de mérito (6.6)', () => {
  const bounds = [2.99, 3.0, 3.74, 3.75, 4.24, 4.25, 4.74, 4.75, 5.0];
  describe.each(bounds)('nota %s', (v) => {
    const pos = 'Analista';
    const g1 = calculateConsolidatedMetrics(mk(v, v, pos, DIR), mk(v, v, pos, DIR), mk(v, v, pos, DIR), undefined, false);
    const g2 = calculateConsolidatedMetrics(
      mk(v, v, pos, DIR, pot(v)),
      mk(v, v, pos, DIR, pot(v)),
      mk(v, v, pos, DIR, pot(v)),
      undefined,
      false,
    );
    it('nota final = v (sin Bloque 3, 60/40)', () => expect(Number(g1.finalScore)).toBeCloseTo(v, 2));
    it(`tramo T${oracleTier(v)} (sin Bloque 3)`, () => expect(g1.meritTier.id).toBe(oracleTier(v)));
    it(`tramo T${oracleTier(v)} (con potencial = v)`, () => expect(g2.meritTier.id).toBe(oracleTier(v)));
    it('habilita sucesión solo si T5 (>= 4.75)', () => expect(g2.enablesSuccession).toBe(v >= 4.75));
    it(`CargoPerformanceBreakdown.getTierForScore => T${oracleTier(v)}`, async (ctx) => {
      let mod: any;
      try {
        mod = await import('../src/components/CargoPerformanceBreakdown');
      } catch {
        mod = null;
      }
      // Si no es importable en node se marca como omitida (no como aprobada).
      if (!mod?.getTierForScore) ctx.skip();
      const t = mod.getTierForScore(v).label as string;
      expect(Number((t.match(/T(\d)/) || [])[1] || 0)).toBe(oracleTier(v));
    });
  });

  it('tabla MERIT_TIERS coincide con la 6.6', () => {
    const got = [1, 2, 3, 4, 5].map((i) => `${(MERIT_TIERS as any)[i].minScore}-${(MERIT_TIERS as any)[i].maxScore}`);
    expect(got).toEqual(['1-2.99', '3-3.74', '3.75-4.24', '4.25-4.74', '4.75-5']);
  });
});

// ---------- C. Nine-Box ----------
describe('Nine-Box: Desempeño = B1, Potencial = B2', () => {
  const pos = 'Analista';
  const g = calculateConsolidatedMetrics(mk(4.5, 4.5, pos, DIR), mk(4.5, 2, pos, DIR), mk(4.5, 2, pos, DIR), undefined, false);
  const exp = oracleFinal(
    '180p',
    { self: 4.5, sup: 4.5, peer: 4.5, sub: 0 },
    { self: 4.5, sup: 2, peer: 2, sub: 0 },
  );
  it('eje Potencial = B2 ponderado', () => expect(g.potentialScore).toBeCloseTo(exp.B2, 2));
  it('eje Desempeño = B1 ponderado', () => expect(g.finalScore).toBeCloseTo(exp.B1, 2));

  const nbCases: Array<[number, number]> = [[2.99, 2.99], [3.0, 3.0], [4.24, 4.24], [4.25, 4.25], [3.9, 3.9], [2.5, 2.5], [4.0, 4.0]];
  // Umbrales no definidos en el alcance: se exige consistencia con la tabla de tramos (3.00 / 4.25)
  const lvl = (x: number) => (x >= 4.25 ? 'Alto' : x >= 3 ? 'Medio' : 'Bajo');
  // Réplica de ExecutiveTalentDashboard.tsx:311-312 (umbrales distintos entre vistas)
  const execX = (x: number) => (x >= 4.0 ? 'Alto' : x >= 3.0 ? 'Medio' : 'Bajo');
  const execY = (y: number) => (y >= 3.9 ? 'Alto' : y >= 2.5 ? 'Medio' : 'Bajo');
  // Omitido hasta que se resuelva D-04 (cortes Bajo/Medio/Alto del Nine-Box): el alcance no los define.
  it.skip.each(nbCases)('[pendiente D-04] celda coherente entre vistas (Desempeño=%s, Potencial=%s)', (x, y) => {
    const nb = mapToNineBox(x, y);
    expect(`${nb.yLevel}-${nb.xLevel}`).toBe(`${lvl(y)}-${lvl(x)}`);
    expect(`${execY(y)}-${execX(x)}`).toBe(`${nb.yLevel}-${nb.xLevel}`);
  });
});

// ---------- D. Sin imputación ----------
describe('Sin imputación: sin datos => pendiente', () => {
  it('sin evaluaciones no es evaluado y no hay nota por defecto (3.5)', () => {
    const g = calculateConsolidatedMetrics(undefined, undefined, undefined, undefined, false);
    expect(g.isEvaluated).toBe(false);
    expect(g.finalScore).toBe(0);
    expect(g.finalScore).not.toBe(3.5);
    expect(g.meritTier.id as number).toBe(0);
  });
  it('sin reactivos pot_* no se inventa potencial', () => {
    const sup = mk(4, 4, 'Analista', DIR);
    const g = calculateConsolidatedMetrics(undefined, sup, undefined, undefined, false);
    expect(g.potentialScore).toBe(0);
  });
  it('Potencial = B2 (AMB-04), no un proxy derivado (B2_auto x 0,98)', () => {
    const e = mk(4, 4, 'Analista', DIR);
    const g = calculateConsolidatedMetrics(e, e, e, undefined, false);
    expect(g.potentialScore).toBeCloseTo(g.block2Score, 2);
  });
});

// ---------- E. Dictamen de promoción ----------
describe('Dictamen de promoción (85/70/60)', () => {
  const prom: Array<[number, string]> = [
    [85, 'APROBADO'], [84.9, 'APROBADO'], [70, 'APROBADO'],
    [69.9, 'APROBADO CONDICIONADO'], [60, 'APROBADO CONDICIONADO'], [59.9, 'NO APROBADO'],
  ];
  it.each(prom)('resolvePromotionThreshold(%s) => %s', (s, exp) => {
    expect(resolvePromotionThreshold(s).finalRuling).toBe(exp);
  });
});

// ---------- F. Nivel gerencial ----------
describe('getManagementLevel', () => {
  it.each(['Analista de Servicio al Cliente', 'Asesor de Comercio Electrónico'])('"%s" => OPERATIVO', (p) => {
    expect(getManagementLevel(p)).toBe('OPERATIVO');
  });
});

// ---------- G. Bloque 2 del Director ----------
describe('Bloque 2 del Director', () => {
  it('incluye competencias de Junta Directiva (brd-*) en el promedio', () => {
    const ids = b2Ids('Director', 'Dirección de Tecnología');
    const scores: Record<string, number> = {};
    ids.forEach((id) => (scores[id] = id.startsWith('brd') ? 1.25 : 5));
    const e = { scores, comments: '' } as any;
    const B2 = calculateConsolidatedMetrics(e, e, e, e, true).block2Score;
    const nb = ids.filter((i) => i.startsWith('brd')).length;
    const exp = r2(((ids.length - nb) * 5 + nb * 1.25) / ids.length);
    expect(Number(B2)).toBeCloseTo(exp, 2);
  });
});

// ---------- H. Asignación de competencias (§4.1-4.3) ----------
describe('Asignación de competencias y nivel esperado', () => {
  const names = (arr: any[]) => arr.map((c: any) => c.name);
  const CARD = ['Orientación al Cliente', 'Aprendizaje e Innovación', 'Capacidad de Análisis', 'Trabajo en Equipo', 'Adaptabilidad y Flexibilidad'];
  const SUP = ['Liderar con el Ejemplo', 'Orientación al Logro', 'Desarrollo de Equipos'];
  const BRD = ['Líder de Líderes', 'Pensamiento Estratégico', 'Gestión del Cambio y Desarrollo de la Organización'];
  const SALES = ['Gestión de Indicadores', 'Visual Merchandising', 'Negociación Comercial'];
  const SUPP = ['Orientación al Servicio', 'Optimización de Procesos', 'Administración de Infraestructura y Recursos Críticos'];
  const CTRL = ['Prevención de Pérdidas y Control de Inventarios', 'Estructuración y Control Presupuestario', 'Gestión de Riesgos y Auditoría de Procesos'];
  const grp: Record<string, string[]> = {
    'Dirección Comercial': SALES, 'Dirección de Operaciones': SALES,
    'Dirección de Transporte y Logística': SUPP, 'Dirección de Tecnología': SUPP, 'Dirección de Talento Humano': SUPP,
    'Dirección de Administración y Finanzas': CTRL, 'Dirección de Control Interno': CTRL, 'Dirección de Compras': CTRL,
  };
  const expLevel: Record<string, string> = {
    Director: 'A', Gerente: 'B', Supervisor: 'B', Coordinador: 'C', Especialista: 'C', Responsable: 'C',
    'Encargado de Tienda': 'C', Analista: 'D', 'Asesor Integral': 'D', 'Operador Integral': 'D',
  };
  const posCases: Array<[string, string]> = [
    ['Coordinador', 'Dirección de Operaciones'], ['Analista', 'Dirección de Administración y Finanzas'],
    ['Director', 'Dirección de Tecnología'], ['Supervisor', 'Dirección Comercial'], ['Gerente', 'Dirección de Control Interno'],
    ['Especialista', 'Dirección de Talento Humano'], ['Responsable', 'Dirección de Compras'],
    ['Encargado de Tienda', 'Dirección de Operaciones'], ['Asesor Integral', 'Dirección de Operaciones'],
    ['Operador Integral', 'Dirección de Transporte y Logística'],
  ];
  it.each(posCases)('competencias de %s (%s)', (pos, dir) => {
    const p: any = resolveEmployeeCompetencyProfile(pos, dir);
    const isSup = ['Coordinador', 'Supervisor', 'Gerente', 'Director'].includes(pos);
    const exp = [...CARD, ...(isSup ? SUP : []), ...(pos === 'Director' ? BRD : []), ...grp[dir]];
    const got = names(p.activeCompetencies);
    expect(got.length).toBe(exp.length);
    expect(exp.every((n) => got.includes(n))).toBe(true);
  });
  it.each(posCases)('nivel esperado (tabla 4.3) de %s', (pos, dir) => {
    expect((resolveEmployeeCompetencyProfile(pos, dir) as any).expectedLevel).toBe(expLevel[pos]);
  });
  it.each(Object.keys(grp))('grupo de área para %s', (dir) => {
    const got = names((resolveEmployeeCompetencyProfile('Analista', dir) as any).areaCompetencies);
    expect(grp[dir].every((n) => got.includes(n))).toBe(true);
  });
  it('nombres literales de las 20 competencias (§4.1/4.2)', () => {
    const all = names(ALL_OFFICIAL_COMPETENCIES);
    const scopeAll = [...CARD, ...SUP, ...BRD, ...SALES, ...SUPP, ...CTRL];
    expect(all.length).toBe(20);
    expect(scopeAll.every((n) => all.includes(n))).toBe(true);
  });
  it('opciones del caso situacional con letras A/B/C/D distintas', () => {
    const q: any = (getOfficialCompetencyQuestions as any)('Analista', DIR, false, false, undefined, 'self')[0];
    expect(new Set(q.options.map((o: any) => o.levelLetter)).size).toBe(4);
  });
});
