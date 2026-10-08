/** Synthetic fixtures for interface evaluation. No external market source is used. */
export const periods = [
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
];
export const areas = [
  "Business Bay",
  "Dubai Marina",
  "Jumeirah Village Circle",
  "Downtown Dubai",
  "Dubai Hills Estate",
  "Palm Jumeirah",
];
export const developers = ["Emaar", "DAMAC", "Sobha", "Binghatti", "Nakheel"];
export const propertyTypes = ["Apartment", "Villa", "Townhouse"];
export const categories = ["Off-plan", "Ready"];
export type Filters = {
  month: string;
  area: string;
  developer: string;
  propertyType: string;
  category: string;
};
export const defaultFilters: Filters = {
  month: periods.at(-1)!,
  area: "All areas",
  developer: "All developers",
  propertyType: "All types",
  category: "All transactions",
};
export type RecordRow = {
  month: string;
  area: string;
  developer: string;
  propertyType: string;
  category: string;
  transactions: number;
  sales: number;
  areaSqft: number;
};
export const demoRecords: RecordRow[] = periods.flatMap((month, m) =>
  areas.flatMap((area, a) =>
    developers.flatMap((developer, d) =>
      propertyTypes.flatMap((propertyType, p) =>
        categories.map((category, c) => {
          const transactions = Math.round(
            (52 + (5 - a) * 8 + (4 - d) * 5) *
              (p === 0 ? 1 : p === 1 ? 0.27 : 0.18) *
              (c === 0 ? 1.3 : 0.75) *
              (0.72 + m * 0.055) *
              (1 + ((a + d + m) % 3) * 0.035),
          );
          const sqft = p === 0 ? 1050 : p === 1 ? 3900 : 2450;
          const price = 1350 + a * 145 + d * 35 + m * 27;
          return {
            month,
            area,
            developer,
            propertyType,
            category,
            transactions,
            sales: transactions * sqft * price,
            areaSqft: transactions * sqft,
          };
        }),
      ),
    ),
  ),
);
export function selectRecords(filters: Filters, month = filters.month) {
  return demoRecords.filter(
    (r) =>
      r.month === month &&
      (filters.area === "All areas" || r.area === filters.area) &&
      (filters.developer === "All developers" ||
        r.developer === filters.developer) &&
      (filters.propertyType === "All types" ||
        r.propertyType === filters.propertyType) &&
      (filters.category === "All transactions" ||
        r.category === filters.category),
  );
}
export function summarize(rows: RecordRow[]) {
  const transactions = rows.reduce((s, r) => s + r.transactions, 0),
    sales = rows.reduce((s, r) => s + r.sales, 0),
    areaSqft = rows.reduce((s, r) => s + r.areaSqft, 0);
  return {
    transactions,
    sales,
    price: areaSqft ? sales / areaSqft : 0,
    offPlan: rows
      .filter((r) => r.category === "Off-plan")
      .reduce((s, r) => s + r.transactions, 0),
    ready: rows
      .filter((r) => r.category === "Ready")
      .reduce((s, r) => s + r.transactions, 0),
  };
}
export function change(current: number, previous: number): number | null {
  return previous ? ((current - previous) / previous) * 100 : null;
}
export function monthLabel(month: string, long = false) {
  return new Intl.DateTimeFormat("en-GB", {
    month: long ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(month + "-01T00:00:00Z"));
}
export function trend(filters: Filters) {
  return periods
    .filter((m) => m <= filters.month)
    .map((month) => ({
      month: monthLabel(month).split(" ")[0],
      ...summarize(selectRecords(filters, month)),
    }));
}
export function ranking(rows: RecordRow[], field: "area" | "developer") {
  return [...new Set(rows.map((r) => r[field]))]
    .map((name) => ({
      name,
      ...summarize(rows.filter((r) => r[field] === name)),
    }))
    .sort((a, b) => b.transactions - a.transactions);
}
