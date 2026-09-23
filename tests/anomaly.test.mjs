import test from "node:test";
import assert from "node:assert/strict";
import { detectFeeAnomalies } from "./anomaly.ts";

const order = (id, fee, partner = "Swiggy") => ({id: String(id), kind: "order", reference: `ORD-${id}`, partner, date: "2026-09-24", name: "Meal", gross: 100, discount: 0, refund: 0, fee, food: 25, packaging: 5, status: "Delivered"});

test("flags an unusually high fee against seven comparable orders", () => {
  const rows = [...Array.from({length: 7}, (_, i) => order(i, 15)), order(7, 35)];
  const flagged = detectFeeAnomalies(rows, "2026-09-01", "2026-09-30");
  assert.equal(flagged.length, 1);
  assert.equal(flagged[0].reference, "ORD-7");
  assert.equal(flagged[0].baseline, 0.15);
});

test("requires enough comparable orders, excludes cancellations and keeps partners separate", () => {
  assert.equal(detectFeeAnomalies([...Array.from({length: 6}, (_, i) => order(i, 15)), order(7, 35)], "2026-09-01", "2026-09-30").length, 0);
  assert.equal(detectFeeAnomalies([...Array.from({length: 7}, (_, i) => order(i, 15)), order(7, 35, "Zomato")], "2026-09-01", "2026-09-30").length, 0);
  const cancelled = {...order(7, 35), status: "Cancelled"};
  assert.equal(detectFeeAnomalies([...Array.from({length: 7}, (_, i) => order(i, 15)), cancelled], "2026-09-01", "2026-09-30").length, 0);
});

test("does not flag ordinary fees or data outside the selected period", () => {
  const rows = [...Array.from({length: 8}, (_, i) => order(i, 15)), {...order(8, 35), date: "2026-08-24"}];
  assert.deepEqual(detectFeeAnomalies(rows, "2026-09-01", "2026-09-30"), []);
});
