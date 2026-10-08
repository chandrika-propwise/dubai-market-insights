import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("supplied September totals, median labels, shares, and branded logo render accurately", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A pulse on the property market." }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Propwise", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".recharts-bar-rectangle path").first(),
  ).toBeVisible();
  await expect(page.locator(".recharts-sector").first()).toBeVisible();
  await expect(page.locator(".kpi-value").nth(0)).toHaveText("11,475");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("AED29.82bn");
  await expect(page.locator(".kpi-value").nth(2)).toHaveText("AED1.325m");
  await expect(page.locator(".kpi-value").nth(3)).toHaveText("AED1,671");
  await expect(
    page.getByText("Median property price", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Average price / sq ft")).toHaveCount(0);
  await expect(page.locator(".source-banner")).toContainText(
    "data available through 6 October 2026",
  );
  await expect(page.getByLabel("DEVELOPER", { exact: true })).toBeDisabled();
  await expect(page.getByLabel("PROPERTY TYPE", { exact: true })).toBeEnabled();
  await expect(page.getByLabel("TRANSACTION", { exact: true })).toBeEnabled();
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await expect(page.locator("tbody tr").first()).toContainText(
    "Madinat Al Mataar",
  );
  await expect(
    page.getByRole("navigation", { name: "Internal dashboard" }),
  ).toHaveCount(0);
  await expect(page.getByText("All figures are fictional")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("area filters preserve missing values and change the chart without fabricating medians", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Wadi Al Safa 3");
  await expect(page.locator(".kpi-value").nth(0)).toHaveText("658");
  for (const index of [1, 2, 3])
    await expect(page.locator(".kpi-value").nth(index)).toHaveText("—");
  await page.getByRole("button", { name: "Sales value", exact: true }).click();
  await expect(
    page.getByText("This area metric was not supplied."),
  ).toBeVisible();
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Palm Jumeirah");
  await expect(page.locator(".kpi-value").first()).toHaveText("72");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("AED1.37bn");
  await expect(
    page.getByRole("img", {
      name: /September 2026 sales value for Palm Jumeirah/,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset all filters" }).click();
  await expect(page.locator(".kpi-value").first()).toHaveText("11,475");
});
test("area value ranking is distinct from volume ranking and area rows are interactive", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Sales value ranking", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await expect(page.locator("tbody tr").first()).toContainText("Business Bay");
  await expect(page.locator("tbody tr").nth(2)).toContainText("Al Yufrah 1");
  await page.getByRole("button", { name: "Business Bay" }).click();
  await expect(page.getByLabel("LOCATION", { exact: true })).toHaveValue(
    "Business Bay",
  );
  await expect(page.locator(".kpi-value").first()).toHaveText("437");
});
test("report exports supplied filtered data with provenance and keyboard closes it", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Palm Jumeirah");
  await page.getByRole("button", { name: "Monthly report" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download supplied data (CSV)" })
    .click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe(
    "propwise-september-2026-palm-jumeirah.csv",
  );
  const csv = await readFile((await download.path())!, "utf8");
  expect(csv).toContain("Palm Jumeirah");
  expect(csv).toContain("2026-10-06");
  expect(csv).toContain("Supplied by Propwise");
  expect(csv).not.toContain("Business Bay");
  expect(csv).not.toContain("Median property price");
  expect(csv).not.toContain("fictional");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Monthly report" }),
  ).toBeFocused();
});
test("newsletter remains a clearly described preview", async ({ page }) => {
  await page.goto("/");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("review@example.com");
  await page.getByRole("button", { name: "Join the list" }).click();
  await expect(page.getByRole("status")).toContainText(
    "No email was stored or sent",
  );
});
test("mobile navigation works and page does not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Internal dashboard" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Area performance" }).click();
  await expect(page).toHaveURL(/#areas$/);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
});
test("internal pages still deny visitors including forged role cookies", async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: "role", value: "admin", domain: "127.0.0.1", path: "/" },
  ]);
  for (const path of ["/internal", "/internal/market-data"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(
      page.getByRole("heading", { name: "Your intelligence workspace." }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Internal dashboard" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Market Data Manager." }),
    ).toHaveCount(0);
  }
});

test("sales property split and added area values match the supplied figures", async ({
  page,
}) => {
  await page.goto("/");
  const split = page.locator(".property-panel");
  for (const text of [
    "8,952 sales",
    "972 sales",
    "695 sales",
    "856 sales",
    "100.1%",
    "No separate penthouse",
  ])
    await expect(split).toContainText(text);
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Wadi Al Safa 5");
  await expect(page.locator("tbody tr")).toContainText("859.3m");
  await expect(split).toContainText(
    "Dubai-wide context · not filtered by area",
  );
});
test("rental view renders supplied area data, resets incompatible areas, and excludes sales context", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Al Yufrah 1");
  await page.getByLabel("TRANSACTION", { exact: true }).selectOption("Rentals");
  await expect(page.getByLabel("LOCATION", { exact: true })).toHaveValue(
    "All Dubai",
  );
  await expect(page.locator(".kpi-value").first()).toHaveText("4,044");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("AED455.4m");
  await expect(page.locator(".section-caption")).toContainText(
    "no Dubai-wide rental totals",
  );
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await expect(page.locator(".recharts-bar-rectangle path")).toHaveCount(10);
  await expect(
    page.getByRole("heading", { name: "Off-plan vs. ready" }),
  ).toHaveCount(0);
  await expect(page.locator(".property-panel")).toContainText(
    "City-wide rental category totals and shares",
  );
  await page
    .getByRole("button", { name: "Rental value ranking", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await expect(page.locator("tbody tr").nth(0)).toContainText("Burj Khalifa");
  await page.getByRole("button", { name: "Rental value", exact: true }).click();
  await expect(page.locator(".recharts-bar-rectangle path")).toHaveCount(10);
  await page.getByLabel("LOCATION", { exact: true }).selectOption("Hor Al Anz");
  await expect(page.locator(".kpi-value").first()).toHaveText("2,227");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("—");
  await expect(
    page.getByText("This area metric was not supplied."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Monthly report" }).click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download supplied data (CSV)" })
    .click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe(
    "propwise-september-2026-hor-al-anz-rentals.csv",
  );
  const csv = await readFile((await download.path())!, "utf8");
  expect(csv).toContain('"2227","rentals"');
  expect(csv).not.toContain("Sales value");
  expect(csv).not.toContain("Median");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Reset all filters" }).click();
  await expect(page.getByLabel("TRANSACTION", { exact: true })).toHaveValue(
    "Sales",
  );
  await expect(page.locator(".kpi-value").first()).toHaveText("11,475");
  expect(errors).toEqual([]);
});
test("mobile rental chart and filters stay inside the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByLabel("TRANSACTION", { exact: true }).selectOption("Rentals");
  await expect(
    page.locator(".recharts-bar-rectangle path").first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("property filter updates category KPIs, chart, scope and CSV, and area selection clears it", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Business Bay");
  await page
    .getByLabel("PROPERTY TYPE", { exact: true })
    .selectOption("Apartments");
  await expect(page.getByLabel("LOCATION", { exact: true })).toHaveValue(
    "All Dubai",
  );
  await expect(page.locator(".kpi-value").first()).toHaveText("8,952");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("78%");
  await expect(page.locator(".kpi-value").nth(2)).toHaveText("—");
  await expect(
    page.getByRole("img", {
      name: /September 2026 transactions for All Dubai · Apartments: 8,952/,
    }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Off-plan vs. ready" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Monthly report" }).click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download supplied data (CSV)" })
    .click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe(
    "propwise-september-2026-dubai-apartments.csv",
  );
  const csv = await readFile((await download.path())!, "utf8");
  expect(csv).toContain('"8952","sales"');
  expect(csv).not.toContain("11475");
  expect(csv).not.toContain("Business Bay");
  await page.keyboard.press("Escape");
  await page
    .getByLabel("PROPERTY TYPE", { exact: true })
    .selectOption("Villas and townhouses");
  await expect(page.locator(".kpi-value").first()).toHaveText("972");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("8.5%");
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Business Bay");
  await expect(page.getByLabel("PROPERTY TYPE", { exact: true })).toHaveValue(
    "All property types",
  );
  await expect(page.locator(".kpi-value").first()).toHaveText("437");
  await page.getByRole("button", { name: "Land", exact: true }).click();
  await expect(page.locator(".kpi-value").first()).toHaveText("695");
  await page
    .getByLabel("PROPERTY TYPE", { exact: true })
    .selectOption("Commercial and other");
  await expect(page.locator(".kpi-value").first()).toHaveText("856");
});
test("Penthouse and unsupported rental property selections show unavailable data rather than invented totals", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("PROPERTY TYPE", { exact: true })
    .selectOption("Penthouse");
  await expect(page.locator(".kpi-value").first()).toHaveText("—");
  await expect(page.getByText("Penthouse: data not supplied.")).toBeVisible();
  await page.getByRole("button", { name: "Monthly report" }).click();
  await expect(
    page.getByRole("button", { name: "Download supplied data (CSV)" }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await page.getByLabel("TRANSACTION", { exact: true }).selectOption("Rentals");
  await expect(page.getByLabel("PROPERTY TYPE", { exact: true })).toHaveValue(
    "All property types",
  );
  await page.getByLabel("PROPERTY TYPE", { exact: true }).selectOption("Land");
  await expect(page.locator(".kpi-value").first()).toHaveText("—");
  await expect(page.locator(".recharts-bar-rectangle path")).toHaveCount(0);
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await page.getByRole("button", { name: "Reset all filters" }).click();
  await expect(page.locator(".kpi-value").first()).toHaveText("11,475");
});

test("updated rental contracts show signed monthly changes and value-only areas retain missing counts", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("TRANSACTION", { exact: true }).selectOption("Rentals");
  await expect(page.locator(".source-banner").first()).toContainText(
    "DLD-registered rental contracts",
  );
  await expect(page.locator(".kpi").first()).toContainText("10.1%");
  await expect(page.locator(".kpi").nth(1)).toContainText("Burj Khalifa");
  const decline = page.locator("tbody tr").filter({ hasText: "Al Warsan 1" });
  await expect(decline.locator(".delta.negative")).toContainText("12.9%");
  const growth = page.locator("tbody tr").filter({ hasText: "Al Khabaisi" });
  await expect(growth.locator(".delta")).toContainText("83.7%");
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Al Khabaisi");
  await expect(page.locator(".kpi").first()).toContainText("83.7%");
  await page.getByLabel("LOCATION", { exact: true }).selectOption("All Dubai");
  await page
    .getByRole("button", { name: "Rental value ranking", exact: true })
    .click();
  await expect(page.locator("tbody tr").first()).toContainText("455.4m");
  await page.getByRole("button", { name: /Burj Khalifa/ }).click();
  await expect(page.locator(".kpi-value").first()).toHaveText("—");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("AED455.4m");
  await page.getByRole("button", { name: "Rental value", exact: true }).click();
  await expect(
    page.locator(".recharts-bar-rectangle path").first(),
  ).toBeVisible();
});

test("rental apartment and villa filters retain area scope and export category-only figures", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByLabel("TRANSACTION", { exact: true }).selectOption("Rentals");
  await page
    .getByLabel("PROPERTY TYPE", { exact: true })
    .selectOption("Apartments");
  await expect(page.locator(".kpi-value").first()).toHaveText("3,234");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("AED375.6m");
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await expect(page.locator("tbody tr").first()).toContainText(
    "Al Barsha South 4",
  );
  await page
    .getByRole("button", { name: "Rental value ranking", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(7);
  await expect(page.locator("tbody tr").first()).toContainText("Burj Khalifa");
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Business Bay");
  await expect(page.getByLabel("PROPERTY TYPE", { exact: true })).toHaveValue(
    "Apartments",
  );
  await expect(page.locator(".kpi-value").first()).toHaveText("2,259");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("AED223.8m");
  await expect(page.locator(".kpi").first()).not.toContainText("10.1%");
  await page.getByRole("button", { name: "Monthly report" }).click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download supplied data (CSV)" })
    .click();
  const download = await pending;
  const csv = await readFile((await download.path())!, "utf8");
  expect(csv).toContain('"Business Bay · Apartments"');
  expect(csv).toContain('"2259","rentals"');
  expect(csv).not.toContain("4044");
  expect(csv).not.toContain("MoM");
  await page.keyboard.press("Escape");
  await page
    .getByLabel("PROPERTY TYPE", { exact: true })
    .selectOption("Villas and townhouses");
  await expect(page.getByLabel("LOCATION", { exact: true })).toHaveValue(
    "All Dubai",
  );
  await expect(page.locator(".kpi-value").first()).toHaveText("468");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("AED93.9m");
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Jebel Ali 1");
  await expect(page.locator(".kpi-value").first()).toHaveText("231");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("AED54.6m");
  await page.getByLabel("LOCATION", { exact: true }).selectOption("Mirdif");
  await page
    .getByLabel("PROPERTY TYPE", { exact: true })
    .selectOption("All property types");
  await expect(page.getByLabel("LOCATION", { exact: true })).toHaveValue(
    "All Dubai",
  );
  await expect(page.locator(".kpi-value").first()).toHaveText("4,044");
  await page
    .getByLabel("PROPERTY TYPE", { exact: true })
    .selectOption("Villas and townhouses");
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Wadi Al Safa 7");
  await expect(page.locator(".kpi-value").first()).toHaveText("220");
  await expect(page.locator(".kpi-value").nth(1)).toHaveText("—");
  await page
    .getByLabel("PROPERTY TYPE", { exact: true })
    .selectOption("Apartments");
  await expect(page.getByLabel("LOCATION", { exact: true })).toHaveValue(
    "All Dubai",
  );
  await page.getByRole("button", { name: "Monthly report" }).click();
  await expect(
    page.getByRole("button", { name: "Download supplied data (CSV)" }),
  ).toBeEnabled();
  await expect(page.getByRole("dialog")).toContainText(
    "Contract ranking: 10 areas",
  );
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Rental value", exact: true }).click();
  await expect(page.locator(".recharts-bar-rectangle path")).toHaveCount(7);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
