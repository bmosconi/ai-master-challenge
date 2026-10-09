// Prints do portão visual (D12): vendedor e gestor, em 1280 e 390 px.

import { type Page, test } from "@playwright/test";

const DIR = "../process-log/screenshots/02-app";
const WIDTHS = [1280, 390];

const shot = (page: Page, name: string, width: number) =>
	page.screenshot({ path: `${DIR}/${name}-${width}.png`, fullPage: true });

for (const width of WIDTHS) {
	test.describe(`${width} px`, () => {
		test.use({ viewport: { width, height: width > 600 ? 900 : 844 } });

		test("gestor: equipe da Summer Sewald", async ({ page }) => {
			await page.goto("/");
			await page
				.getByLabel("Gestor", { exact: true })
				.selectOption("Summer Sewald");
			await shot(page, "01-gestor", width);
		});

		test("vendedora: Anna Snelling, Foque agora", async ({ page }) => {
			await page.goto("/");
			await page
				.getByLabel("Vendedor", { exact: true })
				.selectOption("Anna Snelling");
			await shot(page, "02-vendedora", width);
		});

		test("vendedor com lista cheia: Zane Levy", async ({ page }) => {
			await page.goto("/");
			await page
				.getByLabel("Vendedor", { exact: true })
				.selectOption("Zane Levy");
			await shot(page, "03-lista-cheia", width);
		});

		test("estado vazio: Cecily Lampkin, só parados e prospecção", async ({
			page,
		}) => {
			await page.goto("/");
			await page
				.getByLabel("Vendedor", { exact: true })
				.selectOption("Cecily Lampkin");
			await shot(page, "04-estado-vazio", width);
		});

		test("data passada: Zane Levy em 30/09/2017", async ({ page }) => {
			await page.goto("/");
			await page.getByLabel("Dados de").selectOption({ label: "30/09/2017" });
			await page
				.getByLabel("Vendedor", { exact: true })
				.selectOption("Zane Levy");
			await shot(page, "05-data-passada", width);
		});
	});
}
