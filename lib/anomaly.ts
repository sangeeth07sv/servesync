import type { RecordData } from "./model";

export type FeeAnomaly = {
  reference: string;
  partner: string;
  date: string;
  rate: number;
  baseline: number;
  fee: number;
  gross: number;
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Robust, explainable outlier detection. A minimum history prevents early false alarms. */
export function detectFeeAnomalies(rows: RecordData[], start: string, end: string): FeeAnomaly[] {
  const orders = rows.filter((row): row is Extract<RecordData, { kind: "order" }> =>
    row.kind === "order" && row.date >= start && row.date <= end && row.gross > 0 && row.status !== "Cancelled"
  );
  const byPartner = new Map<string, typeof orders>();
  for (const order of orders) byPartner.set(order.partner, [...(byPartner.get(order.partner) ?? []), order]);
  const result: FeeAnomaly[] = [];
  for (const [partner, group] of byPartner) {
    if (group.length < 8) continue;
    for (const order of group) {
      const history = group.filter(candidate => candidate.id !== order.id);
      const rates = history.map(candidate => candidate.fee / candidate.gross);
      const baseline = median(rates);
      const deviation = median(rates.map(rate => Math.abs(rate - baseline)));
      const rate = order.fee / order.gross;
      // Require both a practical gap and a robust statistical gap.
      if (rate - baseline < 0.05 || rate - baseline < Math.max(3.5 * 1.4826 * deviation, 0.05)) continue;
      result.push({ reference: order.reference, partner, date: order.date, rate, baseline, fee: order.fee, gross: order.gross });
    }
  }
  return result.sort((a, b) => (b.rate - b.baseline) - (a.rate - a.baseline)).slice(0, 5);
}
