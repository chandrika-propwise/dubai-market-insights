import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("public dashboard filters, trends, comparisons, and reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A pulse on the property market." }),
  ).toBeVisible();
  await expect(page.getByText("All figures are fictional")).toBeVisible();
  const original = await page.locator(".kpi-value").first().innerText();
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Dubai Marina");
  await expect(page.locator(".kpi-value").first()).not.toHaveText(original);
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByLabel("DEVELOPER", { exact: true }).selectOption("Emaar");
  await expect(page.locator(".developer-row")).toHaveCount(1);
  await page.getByLabel("PROPERTY TYPE", { exact: true }).selectOption("Villa");
  await page.getByLabel("TRANSACTION", { exact: true }).selectOption("Ready");
  await expect(page.locator(".kpi-value").last()).toHaveText("0.0%");
  await page
    .getByLabel("REPORTING MONTH", { exact: true })
    .selectOption("2026-04");
  await expect(page.locator(".kpi").getByText("No prior month")).toHaveCount(4);
  await page.getByRole("button", { name: "Sales value", exact: true }).click();
  await expect(
    page.getByRole("img", { name: /Sales value trend/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset all filters" }).click();
  await expect(page.locator(".kpi-value").first()).toHaveText(original);
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await expect(page.locator(".developer-row")).toHaveCount(5);
  await page.getByRole("button", { name: "Business Bay" }).click();
  await expect(page.getByLabel("LOCATION", { exact: true })).toHaveValue(
    "Business Bay",
  );
  expect(errors).toEqual([]);
});
test("report exports filtered fictional data and closes using keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("LOCATION", { exact: true })
    .selectOption("Dubai Marina");
  await page.getByRole("button", { name: "Monthly report" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download demo dataset (CSV)" })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("propwise-demo-2026-09.csv");
  const csv = await readFile((await download.path())!, "utf8");
  expect(csv).toContain("fictional");
  expect(csv).toContain("Dubai Marina");
  expect(csv).not.toContain("Business Bay");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Monthly report" }),
  ).toBeFocused();
});
test("newsletter is explicitly session-local and placeholders do not enable uploads", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("review@example.com");
  await page.getByRole("button", { name: "Join the list" }).click();
  await expect(page.getByRole("status")).toContainText(
    "No email was stored or sent",
  );
  await page.getByRole("link", { name: "Intelligence workspace" }).click();
  await expect(
    page.getByText("Authentication is planned for Phase 2."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore the workflow" }).click();
  await expect(
    page.getByRole("heading", { name: "Market Data Manager." }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Uploads, extraction, approval, and publishing are not enabled",
    ),
  ).toBeVisible();
  expect(await page.locator("input[type=file]").count()).toBe(0);
});
test("mobile has no page overflow and navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A pulse on the property market." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("link", { name: "Market Data Manager", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Market Data Manager." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
