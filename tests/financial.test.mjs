import test from "node:test";
import assert from "node:assert/strict";
import { calculate, recordSchema } from "../lib/model.ts";

const order = (overrides = {}) => recordSchema.parse({
  id: "o1", kind: "order", reference: "A1", partner: "Swiggy",
  date: "2026-09-06", name: "Lunch", gross: 1000, discount: 50,
  refund: 100, fee: 100, food: 250, packaging: 30,
  status: "Delivered", ...overrides
});
const expense = recordSchema.parse({
  id: "e1", kind: "expense", name: "Rent", category: "Rent",
  date: "2026-09-06", amount: 200
});
const period = rows => calculate(rows, "2026-09-01", "2026-09-06");

test("calculates revenue, cost, profit, margin and 30-day run rate", () => {
  const result = period([order(), expense]);
  assert.equal(result.revenue, 850);
  assert.equal(result.cost, 580);
  assert.equal(result.profit, 270);
  assert.equal(result.margin, 270 / 850 * 100);
  assert.equal(result.forecast, 1350);
  assert.equal(result.orders, 1);
});

test("cancelled orders do not inflate revenue, costs, counts or forecast", () => {
  const result = period([order({id: "cancel", status: "Cancelled"}), expense]);
  assert.equal(result.orders, 0);
  assert.equal(result.revenue, 0);
  assert.equal(result.cost, 200);
  assert.equal(result.profit, -200);
  assert.equal(result.forecast, -1000);
});

test("filters by date inclusively and rounds decimal amounts", () => {
  const result = period([
    order({id: "first", date: "2026-09-01", gross: 10.01, discount: 0, refund: 0, fee: 0, food: 0, packaging: 0}),
    order({id: "last", gross: 20.02, discount: 0, refund: 0, fee: 0, food: 0, packaging: 0}),
    order({id: "outside", date: "2026-08-31"})
  ]);
  assert.equal(result.orders, 2);
  assert.equal(result.revenue, 30.03);
  assert.equal(result.profit, 30.03);
});

test("rejects impossible dates, invalid money and refunds above gross", () => {
  assert.equal(recordSchema.safeParse(order({date: "2026-02-30"})).success, false);
  assert.equal(recordSchema.safeParse({...order(), fee: -1}).success, false);
  assert.equal(recordSchema.safeParse({...order(), refund: 1001}).success, false);
});
