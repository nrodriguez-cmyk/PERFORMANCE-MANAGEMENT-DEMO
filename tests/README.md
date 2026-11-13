# Suite oráculo de cálculo (Vitest)

Esta suite codifica las reglas oficiales de `requeriment.md` §6.4 a §6.7 y las contrasta con `src/utils/realEvaluationMetrics.ts` y módulos relacionados.
Cubre: fórmula 60% B1 + 40% B2, pesos por fuente (tabla 6.4) en las cuatro modalidades, tramos T1 a T5 (tabla 6.6) en sus límites, ejes del Nine-Box (Desempeño = B1, Potencial = B2), ausencia de imputación (sin datos = pendiente) y dictamen de promoción.
También incluye el Bloque 2 del Director y el nivel gerencial de cargos operativos.
Está EN ROJO por diseño: hoy el código usa otros pesos (p. ej. el ejemplo oficial da 3,20 y el código 3,79), un potencial proxy y umbrales distintos entre vistas.
No se deben editar los valores esperados para "pasar"; una ola posterior corregirá `src/`.
Ejecutar con `npm test` (usa `vitest run`, entorno node, localStorage simulado en `tests/setup.ts`).
Los datos son ficticios; no se usan cédulas ni nombres reales.
