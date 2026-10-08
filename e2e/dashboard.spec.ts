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
  await expect(
    page.getByLabel("PROPERTY TYPE", { exact: true }),
  ).toBeDisabled();
  await expect(page.getByLabel("TRANSACTION", { exact: true })).toBeDisabled();
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
