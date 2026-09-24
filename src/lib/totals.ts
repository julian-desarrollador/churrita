import type { MonthTotals, Movement } from "@/lib/types";

export function totalsFrom(movements: Pick<Movement, "kind" | "amount">[]): MonthTotals {
  const totals = { ganancia: 0, gasto: 0, inversion: 0, resultado: 0 };
  for (const movement of movements) {
    totals[movement.kind] += movement.amount;
  }
  totals.resultado = totals.ganancia - totals.gasto - totals.inversion;
  return totals;
}
