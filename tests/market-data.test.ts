import assert from "node:assert/strict";
import test from "node:test";
import {
  allAreas,
  areaMetrics,
  areaRanking,
  exportCsv,
  market,
  propertyTypes,
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

test("new sales values preserve supplied precision", () => {
  assert.equal(snapshotFor("Jebel Ali 1").salesValue, 1_260_000_000);
  assert.equal(snapshotFor("Wadi Al Safa 5").salesValue, 859_300_000);
  assert.equal(snapshotFor("Al Hebiah 1").salesValue, 826_500_000);
  assert.equal(snapshotFor("Al Khairan 1").salesValue, 1_100_000_000);
});
test("rental area rankings and missing values are separate from sales and city totals", () => {
  const volume = areaRanking("volume", allAreas, "Rentals");
  assert.equal(volume.length, 10);
  assert.equal(volume[0].name, "Business Bay");
  assert.equal(volume[0].transactions, 4044);
  assert.equal(snapshotFor("Business Bay", "Rentals").salesValue, 387_600_000);
  assert.equal(snapshotFor("Business Bay").transactions, 437);
  assert.equal(snapshotFor("Marsa Dubai", "Rentals").salesValue, 346_400_000);
  assert.equal(snapshotFor("Hor Al Anz", "Rentals").salesValue, null);
  assert.equal(snapshotFor(allAreas, "Rentals").transactions, null);
  assert.equal(snapshotFor(allAreas, "Rentals").salesValue, null);
  const values = areaRanking("value", allAreas, "Rentals");
  assert.equal(values.length, 10);
  assert.equal(values[0].name, "Burj Khalifa");
  assert.equal(values[2].name, "Marsa Dubai");
  assert.equal(snapshotFor("Business Bay", "Rentals").medianPrice, null);
});
test("supplied property counts and reported rounded shares are preserved", () => {
  assert.deepEqual(
    propertyTypes.map((row) => row.transactions),
    [8952, 972, 695, 856],
  );
  assert.deepEqual(
    propertyTypes.map((row) => row.share),
    [78, 8.5, 6.1, 7.5],
  );
  assert.equal(
    propertyTypes.reduce((total, row) => total + row.transactions, 0),
    market.transactions,
  );
  assert.equal(
    propertyTypes.reduce((total, row) => total + row.share, 0),
    100.1,
  );
  const csv = exportCsv(allAreas);
  assert.ok(
    csv.includes('"All Dubai · Apartments","Sales transactions","8952"'),
  );
});
test("rental exports omit sales-only figures and never infer a city rental total", () => {
  const csv = exportCsv(allAreas, "Rentals");
  assert.ok(
    csv.includes(
      '"Business Bay","Registered rental contracts","4044","rentals"',
    ),
  );
  assert.ok(csv.includes('"Marsa Dubai","Rental value","346400000","AED"'));
  for (const metric of [
    "Median property price",
    "Off-plan",
    "Sales value",
    "8952",
    '"All Dubai","Rentals transactions"',
  ])
    assert.ok(!csv.includes(metric));
  const area = exportCsv("Hor Al Anz", "Rentals");
  assert.ok(area.includes('"2227","rentals"'));
  assert.ok(!area.includes('"Rental value"'));
  assert.ok(!area.includes("Business Bay"));
});

test("property snapshots use supplied city counts and never allocate to areas or rentals", () => {
  for (const row of propertyTypes) {
    const category = snapshotFor(allAreas, "Sales", row.name);
    assert.equal(category.transactions, row.transactions);
    assert.equal(category.salesValue, null);
    assert.equal(category.medianPrice, null);
    assert.equal(
      snapshotFor("Business Bay", "Sales", row.name).transactions,
      null,
    );
    assert.equal(snapshotFor(allAreas, "Rentals", row.name).transactions, null);
  }
  assert.equal(snapshotFor(allAreas, "Sales", "Penthouse").transactions, null);
  assert.equal(
    snapshotFor(allAreas, "Sales", "Villas and townhouses").transactionsMom,
    14.8,
  );
  const csv = exportCsv(allAreas, "Sales", "Apartments");
  assert.ok(
    csv.includes('"All Dubai · Apartments","Sales transactions","8952"'),
  );
  assert.ok(csv.includes('"Reported sales transaction share","78","percent"'));
  for (const absent of [
    "11475",
    "Business Bay",
    "Off-plan",
    "Median property price",
    "Villas and townhouses",
  ])
    assert.ok(!csv.includes(absent));
  assert.equal(exportCsv(allAreas, "Sales", "Penthouse").split("\n").length, 1);
});

test("updated rental ranks, values, comparisons and unknown contract counts match the source", () => {
  const counts = areaRanking("volume", allAreas, "Rentals");
  assert.deepEqual(
    counts.map((row) => row.transactionsMom),
    [10.1, 3.6, 4.3, 11.7, 18.6, 83.7, -12.9, 42.1, 23.5, 6.4],
  );
  const values = areaRanking("value", allAreas, "Rentals");
  assert.deepEqual(
    values.map((row) => row.name),
    [
      "Burj Khalifa",
      "Business Bay",
      "Marsa Dubai",
      "Al Barsha South 4",
      "Al Thanyah 5",
      "Jebel Ali 1",
      "Jebel Ali Industrial 1",
      "Palm Jumeirah",
      "Hadaeq Sheikh Mohammed Bin Rashid",
      "Al Merkadh",
    ],
  );
  assert.deepEqual(
    values.map((row) => row.salesValue),
    [
      455_400_000, 387_600_000, 346_400_000, 246_100_000, 226_700_000,
      216_100_000, 192_600_000, 188_500_000, 186_700_000, 175_700_000,
    ],
  );
  const burj = snapshotFor("Burj Khalifa", "Rentals");
  assert.equal(burj.transactions, null);
  assert.equal(burj.transactionsMom, null);
  assert.equal(burj.salesValue, 455_400_000);
  assert.equal(snapshotFor("Palm Jumeirah", "Rentals").transactions, null);
  assert.equal(snapshotFor("Palm Jumeirah").transactions, 72);
  const csv = exportCsv(allAreas, "Rentals");
  assert.ok(
    csv.includes(
      '"Al Warsan 1","Rental contracts MoM","-12.9","percent","vs August 2026"',
    ),
  );
  assert.ok(csv.includes('"Burj Khalifa","Rental value","455400000","AED"'));
  assert.ok(csv.includes('"DLD-registered rental contracts"'));
  assert.ok(!csv.includes('"All Dubai","Registered rental contracts"'));
  assert.ok(
    !exportCsv("Burj Khalifa", "Rentals").includes(
      '"Registered rental contracts"',
    ),
  );
});
