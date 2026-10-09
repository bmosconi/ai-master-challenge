// Fluxos das personas no build de produção (CA4, CA5, CA6, CA14).

import { expect, type Page, test } from "@playwright/test";

const pick = async (page: Page, label: string, value: string) =>
	page.getByLabel(label, { exact: true }).selectOption(value);

test("vendedora: o 1º da Foque agora já vem aberto, com o motivo e a conta", async ({
	page,
}) => {
	await page.goto("/");
	await pick(page, "Vendedor", "Zane Levy");
	const panel = page.getByRole("complementary", { name: "Motivo da posição" });
	await expect(panel).toContainText("1º de 31 na Foque agora");
	await expect(panel).toContainText("de cada 10");
	await expect(panel).toContainText(
		"US$ 5.482 de preço de lista × 47,3% = US$ 2.593",
	);
	await expect(panel).toContainText("Esfria em 69 dias");
	await page.getByRole("button", { name: /GTX Pro Gogozoom/ }).click();
	await expect(panel).toContainText("2º de 31");
});

test("gestor: equipe com quem não tem negócio à parte; clicar abre o vendedor", async ({
	page,
}) => {
	await page.goto("/");
	await pick(page, "Gestor", "Summer Sewald");
	await expect(
		page.getByText("Sem negócio em andamento em 31/12/2017"),
	).toBeVisible();
	await expect(page.getByText("nenhum negócio na base")).toBeVisible();
	await page.getByRole("button", { name: "Kary Hendrixson" }).click();
	await expect(
		page.getByRole("heading", { name: "Kary Hendrixson" }),
	).toBeVisible();
});

test("estado vazio: sem negócio recente, leva para Revisar ou encerrar", async ({
	page,
}) => {
	await page.goto("/");
	await pick(page, "Vendedor", "Cecily Lampkin");
	await expect(
		page.getByText("Nenhum negócio recente em 31/12/2017"),
	).toBeVisible();
	await page.getByRole("button", { name: "Ver Revisar ou encerrar" }).click();
	await expect(
		page.getByRole("tab", { name: /Revisar ou encerrar/ }),
	).toHaveAttribute("aria-selected", "true");
	await expect(
		page
			.getByRole("complementary", { name: "Motivo da posição" })
			.getByText("Retome o contato ou marque como perdido"),
	).toBeVisible();
});

test("estado vazio: nada em andamento e nenhum negócio na base", async ({
	page,
}) => {
	await page.goto("/");
	await pick(page, "Vendedor", "Garret Kinder");
	await expect(
		page.getByText("Nenhum negócio em andamento em 31/12/2017"),
	).toBeVisible();
	await page.getByRole("button", { name: "Limpar filtros" }).click();
	await pick(page, "Vendedor", "Carl Lin");
	await expect(
		page.getByText("A base não tem nenhum negócio deste vendedor"),
	).toBeVisible();
});

test("data passada: 30/06 bloqueada; em 30/09 sem empresa e sem prospecção", async ({
	page,
}) => {
	await page.goto("/");
	const dates = page.getByLabel("Dados de");
	await expect(
		dates.locator("option", { hasText: "30/06/2017" }),
	).toBeDisabled();
	await dates.selectOption({ label: "30/09/2017" });
	await pick(page, "Vendedor", "Zane Levy");
	await expect(
		page.getByText("Você está vendo o funil como estava em 30/09/2017"),
	).toBeVisible();
	await expect(page.getByText("Empresa não informada")).toHaveCount(0);
	await expect(page.locator(".account")).toHaveCount(0);
	await page.getByRole("tab", { name: /Inicie contato/ }).click();
	await expect(
		page.getByText("A prospecção só aparece na data mais recente"),
	).toBeVisible();
});

for (const width of [1280, 390])
	test(`sem rolagem lateral em ${width} px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		for (const seller of ["Zane Levy", "Anna Snelling", "Darcel Schlecht"]) {
			await page.goto("/");
			await pick(page, "Vendedor", seller);
			for (const tab of [
				"Foque agora",
				"Revisar ou encerrar",
				"Inicie contato",
			]) {
				await page.getByRole("tab", { name: new RegExp(tab) }).click();
				const overflow = await page.evaluate(() =>
					Math.max(
						document.documentElement.scrollWidth - innerWidth,
						...[...document.querySelectorAll(".table-wrap")].map(
							(e) => e.scrollWidth - e.clientWidth,
						),
					),
				);
				expect(overflow, `${seller}, ${tab}`).toBeLessThanOrEqual(0);
			}
		}
	});
