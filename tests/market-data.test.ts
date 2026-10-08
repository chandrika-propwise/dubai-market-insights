import assert from "node:assert/strict";
import test from "node:test";
import {
  allAreas,
  areaMetrics,
  areaRanking,
  exportCsv,
  market,
  reportingPeriod,
  snapshotFor,
} from "../src/lib/market-data";
test("September overview preserves the supplied totals, medians, and source dates", () => {
  const snapshot = snapshotFor(allAreas);
  assert.equal(snapshot.transactions, 11475);
  assert.equal(snapshot.salesValue, 29_820_000_000);
  assert.equal(snapshot.medianPrice, 1_325_000);
  assert.equal(snapshot.medianPriceSqft, 1671);
  assert.equal(snapshot.transactionsMom, -5);
  assert.equal(snapshot.salesValueMom, 3.4);
  assert.equal(snapshot.medianPriceMom, 9.6);
  assert.equal(reportingPeriod.start, "2026-09-01");
  assert.equal(reportingPeriod.end, "2026-09-30");
  assert.equal(reportingPeriod.dataThrough, "2026-10-06");
});
test("volume and value rankings use their supplied scope rather than re-ranking a partial list", () => {
  const volume = areaRanking("volume");
  assert.equal(volume.length, 10);
  assert.equal(volume[0].name, "Madinat Al Mataar");
  assert.equal(volume[0].transactions, 928);
  assert.equal(volume.at(-1)?.name, "Al Khairan 1");
  const value = areaRanking("value");
  assert.equal(value.length, 5);
  assert.equal(value[0].name, "Business Bay");
  assert.equal(value[0].salesValue, 1_500_000_000);
  assert.equal(value[2].name, "Al Yufrah 1");
  assert.equal(value[4].name, "Al Barsha South 4");
  assert.ok(!volume.some((row) => row.name === "Palm Jumeirah"));
});
test("missing metrics stay null and are never inferred from city-wide averages or percentages", () => {
  const wadi = snapshotFor("Wadi Al Safa 3");
  assert.equal(wadi.transactions, 658);
  assert.equal(wadi.salesValue, null);
  assert.equal(wadi.medianPrice, null);
  assert.equal(wadi.medianPriceSqft, null);
  assert.equal(wadi.transactionsMom, null);
  assert.equal(snapshotFor("Al Yufrah 1").transactions, null);
  assert.equal(snapshotFor("Al Yufrah 1").salesValue, 1_380_000_000);
  assert.equal(snapshotFor("Palm Jumeirah").transactions, 72);
  assert.equal(snapshotFor("Al Hebiah 1").transactionsMom, 113.6);
  assert.equal(snapshotFor("Unknown area").transactions, null);
});
test("shares, property performance, and yields retain their distinct meanings", () => {
  assert.equal(market.offPlanShare, 65.5);
  assert.equal(market.readyShare, 34.5);
  assert.equal(market.offPlanShare + market.readyShare, 100);
  assert.equal(market.apartmentShare, 78);
  assert.equal(market.villasTownhousesMom, 14.8);
  assert.equal(market.apartmentYield, 5);
  assert.equal(market.villaYield, 4.9);
  assert.equal(
    areaMetrics.find((row) => row.name === "Palm Jumeirah")?.volumeRank,
    null,
  );
});
test("area CSV exports exclude city-wide figures and omit unavailable values", () => {
  const csv = exportCsv("Wadi Al Safa 3");
  assert.ok(csv.includes('"658","sales"'));
  assert.ok(!csv.includes('"Sales value"'));
  assert.ok(!csv.includes("Median property price"));
  assert.ok(!csv.includes("11475"));
  assert.ok(!csv.includes("Business Bay"));
  assert.ok(csv.includes("2026-10-06"));
  assert.ok(csv.includes("Supplied by Propwise"));
  const city = exportCsv(allAreas);
  assert.ok(city.includes('"Median property price","1325000","AED"'));
  assert.ok(city.includes('"Off-plan transaction share","65.5","percent"'));
  assert.ok(
    city.includes('"Approximate gross villa rental yield","4.9","percent"'),
  );
});
