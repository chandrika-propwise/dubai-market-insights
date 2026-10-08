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

test("rental property area data remains separate from all-property rentals and city totals", () => {
  const apartments = areaRanking("volume", allAreas, "Rentals", "Apartments");
  assert.equal(apartments.length, 10);
  assert.equal(apartments[0].name, "Al Barsha South 4");
  assert.deepEqual(
    apartments.map((r) => r.transactions),
    [3234, 2259, 2246, 2131, 1647, 1608, 1495, 1181, 1111, 937],
  );
  assert.deepEqual(
    apartments.map((r) => r.salesValue),
    [
      218_400_000,
      223_800_000,
      312_900_000,
      142_600_000,
      null,
      131_300_000,
      99_200_000,
      null,
      375_600_000,
      null,
    ],
  );
  const aptValues = areaRanking("value", allAreas, "Rentals", "Apartments");
  assert.equal(aptValues.length, 7);
  assert.equal(aptValues[0].name, "Burj Khalifa");
  const bay = snapshotFor("Business Bay", "Rentals", "Apartments");
  assert.equal(bay.transactions, 2259);
  assert.equal(bay.salesValue, 223_800_000);
  assert.equal(bay.transactionsMom, null);
  assert.equal(snapshotFor("Business Bay", "Rentals").transactions, 4044);
  assert.equal(
    snapshotFor(allAreas, "Rentals", "Apartments").transactions,
    null,
  );
  const villas = areaRanking(
    "volume",
    allAreas,
    "Rentals",
    "Villas and townhouses",
  );
  assert.deepEqual(
    villas.map((r) => r.transactions),
    [468, 452, 395, 272, 266, 231, 220, 187, 177, 163],
  );
  assert.deepEqual(
    villas.map((r) => r.salesValue),
    [
      46_700_000,
      57_900_000,
      77_000_000,
      76_900_000,
      93_900_000,
      54_600_000,
      null,
      null,
      null,
      null,
    ],
  );
  const villaValues = areaRanking(
    "value",
    allAreas,
    "Rentals",
    "Villas and townhouses",
  );
  assert.equal(villaValues.length, 6);
  assert.equal(villaValues[0].name, "Hadaeq Sheikh Mohammed Bin Rashid");
  assert.equal(
    snapshotFor("Jebel Ali 1", "Rentals", "Villas and townhouses").transactions,
    231,
  );
  assert.equal(
    snapshotFor("Al Warsan 1", "Rentals", "Apartments").salesValue,
    null,
  );
  const csv = exportCsv(allAreas, "Rentals", "Apartments");
  assert.ok(
    csv.includes(
      '"Business Bay · Apartments","Registered rental contracts","2259"',
    ),
  );
  assert.ok(
    csv.includes('"Burj Khalifa · Apartments","Rental value","375600000"'),
  );
  assert.ok(!csv.includes("Rental contracts MoM"));
  assert.ok(!csv.includes("4044"));
  assert.ok(!csv.includes("Madinat Hind 4"));
  const area = exportCsv("Jebel Ali 1", "Rentals", "Villas and townhouses");
  assert.ok(area.includes('"231","rentals"'));
  assert.ok(area.includes('"54600000","AED"'));
  assert.ok(!area.includes("Apartments"));
  assert.equal(
    areaRanking("volume", allAreas, "Rentals", "Penthouse").length,
    0,
  );
});
