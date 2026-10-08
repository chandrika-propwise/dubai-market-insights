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
export const allPropertyTypes = "All property types";
export const propertyTypes = [
  { name: "Apartments", transactions: 8952, share: 78 },
  { name: "Villas and townhouses", transactions: 972, share: 8.5 },
  { name: "Land", transactions: 695, share: 6.1 },
  { name: "Commercial and other", transactions: 856, share: 7.5 },
] as const;
const rentalContracts: [string, number, number][] = [
  ["Business Bay", 4044, 10.1],
  ["Al Barsha South 4", 3399, 3.6],
  ["Jebel Ali 1", 2657, 4.3],
  ["Marsa Dubai", 2316, 11.7],
  ["Hor Al Anz", 2227, 18.6],
  ["Al Khabaisi", 2221, 83.7],
  ["Al Warsan 1", 1977, -12.9],
  ["Al Murar", 1976, 42.1],
  ["Al Merkadh", 1676, 23.5],
  ["Port Saeed", 1555, 6.4],
];
const rentalValues: [string, number][] = [
  ["Burj Khalifa", 455_400_000],
  ["Business Bay", 387_600_000],
  ["Marsa Dubai", 346_400_000],
  ["Al Barsha South 4", 246_100_000],
  ["Al Thanyah 5", 226_700_000],
  ["Jebel Ali 1", 216_100_000],
  ["Jebel Ali Industrial 1", 192_600_000],
  ["Palm Jumeirah", 188_500_000],
  ["Hadaeq Sheikh Mohammed Bin Rashid", 186_700_000],
  ["Al Merkadh", 175_700_000],
];
// Merge the two supplied top-ten lists by name. A value-only area has no inferred contract count or volume rank.
export const rentalAreaMetrics: readonly AreaMetric[] = [
  ...new Set([
    ...rentalContracts.map((row) => row[0]),
    ...rentalValues.map((row) => row[0]),
  ]),
].map((name) => {
  const volumeIndex = rentalContracts.findIndex((row) => row[0] === name);
  const valueIndex = rentalValues.findIndex((row) => row[0] === name);
  return {
    name,
    transactions: volumeIndex < 0 ? null : rentalContracts[volumeIndex][1],
    salesValue: valueIndex < 0 ? null : rentalValues[valueIndex][1],
    transactionsMom: volumeIndex < 0 ? null : rentalContracts[volumeIndex][2],
    volumeRank: volumeIndex < 0 ? null : volumeIndex + 1,
    valueRank: valueIndex < 0 ? null : valueIndex + 1,
  };
});
const rentalPropertyRows: Record<string, [string, number, number | null][]> = {
  Apartments: [
    ["Al Barsha South 4", 3234, 218_400_000],
    ["Business Bay", 2259, 223_800_000],
    ["Marsa Dubai", 2246, 312_900_000],
    ["Jebel Ali 1", 2131, 142_600_000],
    ["Al Warsan 1", 1647, null],
    ["Al Merkadh", 1608, 131_300_000],
    ["Al Barsha South 3", 1495, 99_200_000],
    ["Nadd Hessa", 1181, null],
    ["Burj Khalifa", 1111, 375_600_000],
    ["Al Nahda 2", 937, null],
  ],
  "Villas and townhouses": [
    ["Madinat Hind 4", 468, 46_700_000],
    ["Mirdif", 452, 57_900_000],
    ["Wadi Al Safa 5", 395, 77_000_000],
    ["Al Thanayah 4", 272, 76_900_000],
    ["Hadaeq Sheikh Mohammed Bin Rashid", 266, 93_900_000],
    ["Jebel Ali 1", 231, 54_600_000],
    ["Wadi Al Safa 7", 220, null],
    ["Al Yelayiss 2", 187, null],
    ["Al Hebiah 5", 177, null],
    ["Madinat Al Mataar", 163, null],
  ],
};
export function hasRentalPropertyData(propertyType: string) {
  return Object.hasOwn(rentalPropertyRows, propertyType);
}
function rentalPropertyAreas(propertyType: string): AreaMetric[] {
  const rows = hasRentalPropertyData(propertyType)
    ? rentalPropertyRows[propertyType]
    : [];
  const byValue = rows
    .filter((row) => row[2] !== null)
    .toSorted((a, b) => b[2]! - a[2]!);
  return rows.map(([name, transactions, salesValue], index) => ({
    name,
    transactions,
    salesValue,
    transactionsMom: null,
    volumeRank: index + 1,
    valueRank:
      salesValue === null
        ? null
        : byValue.findIndex((row) => row[0] === name) + 1,
  }));
}
export function areasFor(
  type: TransactionType,
  propertyType = allPropertyTypes,
) {
  return type === "Sales"
    ? areaMetrics
    : propertyType === allPropertyTypes
      ? rentalAreaMetrics
      : rentalPropertyAreas(propertyType);
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
  propertyType = allPropertyTypes,
): Snapshot {
  if (propertyType !== allPropertyTypes && type === "Sales") {
    const row =
      type === "Sales" && area === allAreas
        ? propertyTypes.find((r) => r.name === propertyType)
        : undefined;
    return {
      transactions: row?.transactions ?? null,
      salesValue: null,
      medianPrice: null,
      medianPriceSqft: null,
      transactionsMom:
        row?.name === "Villas and townhouses"
          ? market.villasTownhousesMom
          : null,
      salesValueMom: null,
      medianPriceMom: null,
    };
  }
  if (area === allAreas && type === "Sales") return market;
  const row = areasFor(type, propertyType).find((r) => r.name === area);
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
  propertyType = allPropertyTypes,
): AreaMetric[] {
  if (area !== allAreas)
    return areasFor(type, propertyType).filter((r) => r.name === area);
  const rank = metric === "volume" ? "volumeRank" : "valueRank";
  return areasFor(type, propertyType)
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
export function exportCsv(
  area: string,
  type: TransactionType = "Sales",
  propertyType = allPropertyTypes,
) {
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
        type === "Rentals" && propertyType !== allPropertyTypes
          ? `${scope} · ${propertyType}`
          : scope,
        name,
        value,
        unit,
        comparison,
        type === "Rentals"
          ? "DLD-registered rental contracts"
          : "DLD-registered sales",
        "Supplied by Propwise",
      ]);
  };
  if (propertyType !== allPropertyTypes && type === "Sales") {
    const snapshot = snapshotFor(area, type, propertyType);
    const scope = `${area} · ${propertyType}`;
    add(
      scope,
      type === "Sales" ? "Sales transactions" : "Registered rental contracts",
      snapshot.transactions,
      type.toLowerCase(),
    );
    if (type === "Sales" && area === allAreas) {
      const category = propertyTypes.find((r) => r.name === propertyType);
      add(
        scope,
        "Reported sales transaction share",
        category?.share ?? null,
        "percent",
      );
      add(
        scope,
        "Transactions MoM",
        snapshot.transactionsMom,
        "percent",
        "vs August 2026",
      );
    }
    return csvRows(rows);
  }
  const snapshot = snapshotFor(area, type, propertyType);
  add(
    area,
    type === "Sales" ? "Sales transactions" : "Registered rental contracts",
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
    type === "Sales" ? "Transactions MoM" : "Rental contracts MoM",
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
    for (const row of areasFor("Rentals", propertyType)) {
      add(row.name, "Registered rental contracts", row.transactions, "rentals");
      add(row.name, "Rental value", row.salesValue, "AED");
      add(
        row.name,
        "Rental contracts MoM",
        row.transactionsMom,
        "percent",
        "vs August 2026",
      );
    }
  }
  return csvRows(rows);
}
function csvRows(rows: (string | number)[][]) {
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
