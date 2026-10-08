/** User-supplied DLD-based figures. No live DLD feed or independent verification. */
export const reportingPeriod = {
  month: "2026-09",
  label: "September 2026",
  start: "2026-09-01",
  end: "2026-09-30",
  dataThrough: "2026-10-06",
  source: "DLD-registered transactions",
  provenance:
    "Figures supplied by Propwise; not independently retrieved from DLD.",
} as const;
export const market = {
  transactions: 11475,
  salesValue: 29_820_000_000,
  medianPrice: 1_325_000,
  medianPriceSqft: 1671,
  transactionsMom: -5,
  salesValueMom: 3.4,
  medianPriceMom: 9.6,
  offPlanShare: 65.5,
  readyShare: 34.5,
  apartmentShare: 78,
  villasTownhousesMom: 14.8,
  apartmentYield: 5,
  villaYield: 4.9,
} as const;
export type AreaMetric = {
  name: string;
  transactions: number | null;
  /** AED value: sales or rentals depending on the selected dataset. */
  salesValue: number | null;
  transactionsMom: number | null;
  volumeRank: number | null;
  valueRank: number | null;
};
export const areaMetrics: readonly AreaMetric[] = [
  {
    name: "Madinat Al Mataar",
    transactions: 928,
    salesValue: 1_460_000_000,
    transactionsMom: null,
    volumeRank: 1,
    valueRank: 2,
  },
  {
    name: "Al Barsha South 4",
    transactions: 814,
    salesValue: 1_300_000_000,
    transactionsMom: null,
    volumeRank: 2,
    valueRank: 5,
  },
  {
    name: "Wadi Al Safa 3",
    transactions: 658,
    salesValue: null,
    transactionsMom: null,
    volumeRank: 3,
    valueRank: null,
  },
  {
    name: "Jebel Ali Industrial 2",
    transactions: 624,
    salesValue: null,
    transactionsMom: null,
    volumeRank: 4,
    valueRank: null,
  },
  {
    name: "Jebel Ali 1",
    transactions: 543,
    salesValue: 1_260_000_000,
    transactionsMom: null,
    volumeRank: 5,
    valueRank: null,
  },
  {
    name: "Wadi Al Safa 5",
    transactions: 467,
    salesValue: 859_300_000,
    transactionsMom: null,
    volumeRank: 6,
    valueRank: null,
  },
  {
    name: "Business Bay",
    transactions: 437,
    salesValue: 1_500_000_000,
    transactionsMom: null,
    volumeRank: 7,
    valueRank: 1,
  },
  {
    name: "Al Hebiah 5",
    transactions: 410,
    salesValue: null,
    transactionsMom: null,
    volumeRank: 8,
    valueRank: null,
  },
  {
    name: "Al Hebiah 1",
    transactions: 408,
    salesValue: 826_500_000,
    transactionsMom: 113.6,
    volumeRank: 9,
    valueRank: null,
  },
  {
    name: "Al Khairan 1",
    transactions: 391,
    salesValue: 1_100_000_000,
    transactionsMom: null,
    volumeRank: 10,
    valueRank: null,
  },
  // Supplemental areas: do not invent a transaction-volume rank for these rows.
  {
    name: "Al Yufrah 1",
    transactions: null,
    salesValue: 1_380_000_000,
    transactionsMom: null,
    volumeRank: null,
    valueRank: 3,
  },
  {
    name: "Palm Jumeirah",
    transactions: 72,
    salesValue: 1_370_000_000,
    transactionsMom: null,
    volumeRank: null,
    valueRank: 4,
  },
];
export type TransactionType = "Sales" | "Rentals";
export const propertyTypes = [
  { name: "Apartments", transactions: 8952, share: 78 },
  { name: "Villas and townhouses", transactions: 972, share: 8.5 },
  { name: "Land", transactions: 695, share: 6.1 },
  { name: "Commercial and other", transactions: 856, share: 7.5 },
] as const;
const rentalRows: [string, number, number | null][] = [
  ["Business Bay", 4044, 387_600_000],
  ["Al Barsha South 4", 3399, 246_100_000],
  ["Jebel Ali 1", 2657, 216_100_000],
  ["Marsa Dubai", 2316, 346_400_000],
  ["Hor Al Anz", 2227, null],
  ["Al Khabaisi", 2221, null],
  ["Al Warsan 1", 1977, null],
  ["Al Murar", 1976, null],
  ["Al Merkadh", 1676, 175_700_000],
  ["Port Saeed", 1555, null],
];
const valueOrder = [...rentalRows]
  .filter((r) => r[2] !== null)
  .sort((a, b) => b[2]! - a[2]!);
export const rentalAreaMetrics: readonly AreaMetric[] = rentalRows.map(
  ([name, transactions, salesValue], i) => ({
    name,
    transactions,
    salesValue,
    transactionsMom: null,
    volumeRank: i + 1,
    valueRank:
      salesValue === null
        ? null
        : valueOrder.findIndex((r) => r[0] === name) + 1,
  }),
);
export function areasFor(type: TransactionType) {
  return type === "Sales" ? areaMetrics : rentalAreaMetrics;
}
export function money(value: number) {
  return value >= 1e9 ? `${billions(value)}bn` : `${(value / 1e6).toFixed(1)}m`;
}
export const allAreas = "All Dubai";
export type Snapshot = {
  transactions: number | null;
  salesValue: number | null;
  medianPrice: number | null;
  medianPriceSqft: number | null;
  transactionsMom: number | null;
  salesValueMom: number | null;
  medianPriceMom: number | null;
};
export function snapshotFor(
  area: string,
  type: TransactionType = "Sales",
): Snapshot {
  if (area === allAreas && type === "Sales") return market;
  const row = areasFor(type).find((r) => r.name === area);
  return {
    transactions: row?.transactions ?? null,
    salesValue: row?.salesValue ?? null,
    medianPrice: null,
    medianPriceSqft: null,
    transactionsMom: row?.transactionsMom ?? null,
    salesValueMom: null,
    medianPriceMom: null,
  };
}
export function areaRanking(
  metric: "volume" | "value",
  area = allAreas,
  type: TransactionType = "Sales",
): AreaMetric[] {
  if (area !== allAreas) return areasFor(type).filter((r) => r.name === area);
  const rank = metric === "volume" ? "volumeRank" : "valueRank";
  return areasFor(type)
    .filter((r) => r[rank] !== null)
    .sort((a, b) => a[rank]! - b[rank]!);
}
export function number(value: number) {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(
    value,
  );
}
export function billions(value: number) {
  return (value / 1e9).toFixed(2);
}
export function exportCsv(area: string, type: TransactionType = "Sales") {
  const rows: (string | number)[][] = [];
  const add = (
    scope: string,
    name: string,
    value: number | null,
    unit: string,
    comparison = "",
  ) => {
    if (value !== null)
      rows.push([
        reportingPeriod.month,
        reportingPeriod.start,
        reportingPeriod.end,
        reportingPeriod.dataThrough,
        scope,
        name,
        value,
        unit,
        comparison,
        reportingPeriod.source,
        "Supplied by Propwise",
      ]);
  };
  const snapshot = snapshotFor(area, type);
  add(
    area,
    `${type === "Sales" ? "Sales" : "Rental"} transactions`,
    snapshot.transactions,
    type.toLowerCase(),
  );
  add(
    area,
    `${type === "Sales" ? "Sales" : "Rental"} value`,
    snapshot.salesValue,
    "AED",
  );
  add(area, "Median property price", snapshot.medianPrice, "AED");
  add(area, "Median price per sqft", snapshot.medianPriceSqft, "AED/sqft");
  add(
    area,
    "Transactions MoM",
    snapshot.transactionsMom,
    "percent",
    "vs August 2026",
  );
  add(
    area,
    "Sales value MoM",
    snapshot.salesValueMom,
    "percent",
    "vs August 2026",
  );
  add(
    area,
    "Median property price MoM",
    snapshot.medianPriceMom,
    "percent",
    "vs August 2026",
  );
  if (area === allAreas && type === "Sales") {
    add(allAreas, "Off-plan transaction share", market.offPlanShare, "percent");
    add(allAreas, "Ready transaction share", market.readyShare, "percent");
    add(
      allAreas,
      "Apartment transaction share",
      market.apartmentShare,
      "percent",
    );
    add(
      allAreas,
      "Villas/townhouses MoM",
      market.villasTownhousesMom,
      "percent",
      "vs August 2026",
    );
    add(
      allAreas,
      "Approximate gross apartment rental yield",
      market.apartmentYield,
      "percent",
    );
    add(
      allAreas,
      "Approximate gross villa rental yield",
      market.villaYield,
      "percent",
    );
    for (const row of areaMetrics) {
      add(row.name, "Sales transactions", row.transactions, "sales");
      add(row.name, "Sales value", row.salesValue, "AED");
      add(
        row.name,
        "Transactions MoM",
        row.transactionsMom,
        "percent",
        "vs August 2026",
      );
    }
  }
  if (area === allAreas && type === "Sales") {
    for (const row of propertyTypes) {
      add(
        `All Dubai · ${row.name}`,
        "Sales transactions",
        row.transactions,
        "sales",
      );
      add(
        `All Dubai · ${row.name}`,
        "Reported sales transaction share",
        row.share,
        "percent",
      );
    }
  }
  if (area === allAreas && type === "Rentals") {
    for (const row of rentalAreaMetrics) {
      add(row.name, "Rental transactions", row.transactions, "rentals");
      add(row.name, "Rental value", row.salesValue, "AED");
    }
  }
  const header = [
    "Reporting month",
    "Period start",
    "Period end",
    "Data available through",
    "Scope",
    "Metric",
    "Value",
    "Unit",
    "Comparison",
    "Underlying source",
    "Provenance",
  ];
  return [header, ...rows]
    .map((row) =>
      row
        .map((value) => '"' + String(value).replaceAll('"', '""') + '"')
        .join(","),
    )
    .join("\n");
}
