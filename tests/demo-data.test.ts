import assert from "node:assert/strict";
import test from "node:test";
import {
  categories,
  change,
  defaultFilters,
  demoRecords,
  periods,
  ranking,
  selectRecords,
  summarize,
  trend,
} from "../src/lib/demo-data";
test("every period has complete non-negative fictional records", () => {
  for (const month of periods) {
    const rows = selectRecords({ ...defaultFilters, month });
    assert.equal(rows.length, 6 * 5 * 3 * 2);
    assert.ok(
      rows.every((r) => r.transactions > 0 && r.sales > 0 && r.areaSqft > 0),
    );
  }
});
test("combined filters select exact segments and conserve aggregate totals", () => {
  const filters = {
    ...defaultFilters,
    area: "Dubai Marina",
    developer: "Emaar",
    propertyType: "Villa",
    category: "Ready",
  };
  const rows = selectRecords(filters);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].area, filters.area);
  assert.equal(rows[0].developer, filters.developer);
  assert.equal(rows[0].propertyType, filters.propertyType);
  assert.equal(rows[0].category, filters.category);
  const s = summarize(rows);
  assert.equal(s.offPlan, 0);
  assert.equal(s.ready, s.transactions);
  assert.equal(s.price, s.sales / rows[0].areaSqft);
});
test("category partitions and rankings reconcile with selected totals", () => {
  const stats = summarize(selectRecords(defaultFilters));
  assert.equal(stats.transactions, stats.offPlan + stats.ready);
  assert.equal(
    categories.reduce(
      (total, category) =>
        total +
        summarize(selectRecords({ ...defaultFilters, category })).transactions,
      0,
    ),
    stats.transactions,
  );
  for (const field of ["area", "developer"] as const) {
    const ranked = ranking(selectRecords(defaultFilters), field);
    assert.equal(
      ranked.reduce((s, r) => s + r.transactions, 0),
      stats.transactions,
    );
    assert.ok(
      ranked.every(
        (r, i) => !i || ranked[i - 1].transactions >= r.transactions,
      ),
    );
  }
});
test("history respects period and applies all segment filters", () => {
  const filters = { ...defaultFilters, month: "2026-06", area: "Business Bay" };
  const history = trend(filters);
  assert.equal(history.length, 3);
  assert.equal(
    history.at(-1)?.transactions,
    summarize(selectRecords(filters)).transactions,
  );
  assert.equal(trend({ ...filters, month: periods[0] }).length, 1);
});
test("missing comparison is unavailable, not fabricated", () => {
  assert.equal(change(10, 0), null);
  assert.equal(change(120, 100), 20);
  assert.equal(change(80, 100), -20);
  assert.deepEqual(summarize([]), {
    transactions: 0,
    sales: 0,
    price: 0,
    offPlan: 0,
    ready: 0,
  });
  assert.ok(demoRecords.length > 0);
});
