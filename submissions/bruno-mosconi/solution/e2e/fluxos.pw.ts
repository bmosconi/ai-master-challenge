// Fluxos das personas no build de produção (CA4, CA5, CA6, CA14) e os ajustes da D44.

import { expect, type Page, test } from "@playwright/test";

/** Na entrada, o botão da pessoa começa pelas iniciais e o nome ("ZL Zane Levy …"). */
const enter = async (page: Page, name: string) => {
	await page.goto("/#entrada");
	await page.getByRole("button", { name: new RegExp(`^\\S+ ${name}`) }).click();
};
const panel = (page: Page) =>
	page.getByRole("dialog", { name: "Detalhe do negócio" });
// No celular, a aba mostra o rótulo curto, e o nome acessível é o texto visível (WCAG 2.5.3).
const SHORT: Record<string, string> = {
	"Prioridades da semana": "Prioridades",
	"Atualize ou dê perda": "Frios",
	Prospecção: "Prospecção",
};
const tab = (page: Page, name: string) =>
	page.getByRole("tab", { name: new RegExp(`^(${name}|${SHORT[name]}) \\d`) });

test("vendedor: o nº 1 é o herói, e o painel mostra a conta com o mesmo número da frase", async ({
	page,
}) => {
	await enter(page, "Zane Levy");
	const hero = page.locator(".hero");
	await expect(hero).toContainText("GTX Plus Pro");
	await expect(hero).toContainText("The New York Inquirer");
	await expect(hero).toContainText("US$ 2.577");
	await expect(hero).toContainText("Esfria em 69 dias");
	await expect(
		hero.getByRole("img", { name: "Score 98 de 100" }),
	).toBeVisible();
	await page.getByRole("button", { name: "Ver o motivo" }).click();
	const p = panel(page);
	await expect(p).toContainText(
		"De cada 100 negócios iniciados, 47 fecharam venda.",
	);
	await expect(p).toContainText("× 47%");
	await expect(p).toContainText("US$ 2.577");
	await expect(p).toContainText("1º na sua semana");
	await page.locator(".mini", { hasText: "Gogozoom" }).click();
	await expect(p).toContainText("2º na sua semana");
	await page.keyboard.press("Escape");
	await expect(page.locator(".panel.open")).toHaveCount(0);
	await expect(page.locator("[role=img] button")).toHaveCount(0);
});

test("troca de data com movimento: o herói de 31/12 não aparece em 30/09 nem por um quadro (D34)", async ({
	browser,
}) => {
	const ctx = await browser.newContext({
		baseURL: "http://localhost:4173",
		reducedMotion: "no-preference",
	});
	const page = await ctx.newPage();
	await enter(page, "Zane Levy");
	await expect(page.locator(".hero .acct")).toHaveText("The New York Inquirer");
	await page
		.getByRole("group", { name: "Data dos dados" })
		.getByRole("button", { name: "30/09" })
		.click();
	// Logo depois do clique, sem esperar: nenhuma empresa no herói, e o herói visível é o de 30/09.
	expect(await page.locator(".hero .acct").count()).toBe(0);
	await expect(page.locator(".hero:not(.waiting) h2")).toHaveText(
		"GTX Plus Pro",
	);
	await expect(page.locator(".hero")).toContainText("US$ 2.796");
	await ctx.close();
});

test("a escolha da pessoa fica salva neste aparelho", async ({ page }) => {
	await enter(page, "Zane Levy");
	await page.goto("/");
	await expect(page.locator(".hero")).toContainText("GTX Plus Pro");
	await page.getByRole("link", { name: "Trocar de pessoa" }).click();
	await expect(
		page.getByRole("heading", { name: "Quem é você?" }),
	).toBeVisible();
});

test("sem empresa: cartões e lista dizem 'Sem empresa no CRM'; o ID só aparece no painel", async ({
	page,
}) => {
	await enter(page, "Zane Levy");
	await expect(
		page.locator(".mini", { hasText: "Sem empresa no CRM" }).first(),
	).toBeVisible();
	await page.getByRole("button", { name: /Ver todos os 31/ }).click();
	await tab(page, "Atualize ou dê perda").click();
	await tab(page, "Prioridades da semana").click();
	// IDs reais do Zane: o nº 1 e dois sem empresa (3º e 5º).
	for (const id of ["FZWU2I30", "4R4QF0ZU", "LOHJU3OB"])
		await expect(page.locator(".stack")).not.toContainText(id);
	await page
		.locator(".mini", { hasText: "Sem empresa no CRM" })
		.first()
		.click();
	await expect(panel(page)).toContainText(
		/Sem empresa no CRM\. Negócio [A-Z0-9]{8}\./,
	);
});

test("gestor: a frase da equipe, quem não tem negócio e a semana de cada vendedor", async ({
	page,
}) => {
	await enter(page, "Summer Sewald");
	await expect(page.locator(".lead-h1")).toHaveText(
		"US$ 718 mil frios na equipe. Kary concentra US$ 229 mil.",
	);
	await expect(page.locator(".member", { hasText: "Carl Lin" })).toContainText(
		"Nenhum negócio no CRM",
	);
	await page.locator(".member", { hasText: "James Ascencio" }).click();
	await page.getByRole("button", { name: "Abrir a semana de James" }).click();
	await expect(page.locator(".greet")).toContainText("A semana de James.");
	await page.getByRole("button", { name: "Minha equipe" }).click();
	await expect(page.locator(".lead-note")).toHaveText(
		"Sem prioridade nesta semana: Carl Lin.",
	);
	await page.locator(".member", { hasText: "Carl Lin" }).click();
	await expect(page.locator(".empty")).toContainText(
		"Carl não tem negócio no CRM",
	);
	await expect(page.locator(".empty")).not.toContainText("Você");
});

test("estado vazio: sem negócio quente, leva para os frios", async ({
	page,
}) => {
	await enter(page, "Cecily Lampkin");
	await expect(page.getByText("Nada para avançar esta semana.")).toBeVisible();
	await page.getByRole("button", { name: "Ver os frios" }).click();
	await expect(tab(page, "Atualize ou dê perda")).toHaveAttribute(
		"aria-selected",
		"true",
	);
	await page.locator(".row").first().click();
	await expect(panel(page)).toContainText("Atualize ou dê perda");
});

test("estado vazio: nada em andamento e nenhum negócio no CRM", async ({
	page,
}) => {
	await enter(page, "Garret Kinder");
	await expect(page.getByText("Nada em andamento nesta data.")).toBeVisible();
	await enter(page, "Carl Lin");
	await expect(
		page.getByText("Você não tem negócio no CRM", { exact: false }),
	).toBeVisible();
});

test("data passada: 30/06 bloqueada; em 30/09 sem empresa (nem a falta dela) e sem prospecção", async ({
	page,
}) => {
	await enter(page, "Zane Levy");
	const dates = page.getByRole("group", { name: "Data dos dados" });
	await expect(dates.getByRole("button", { name: "30/06" })).toBeDisabled();
	await dates.getByRole("button", { name: "30/09" }).click();
	await expect(page.locator(".past-note")).toContainText("30/09/2017");
	await expect(page.locator(".stack .acct")).toHaveCount(0);
	await expect(page.getByText("Sem empresa no CRM")).toHaveCount(0);
	await tab(page, "Prospecção").click();
	await expect(
		page.getByText("Prospecção só na data mais recente."),
	).toBeVisible();
});

test("computador: 'Sua carteira no tempo' fica fixa ao rolar", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await enter(page, "Zane Levy");
	await page.getByRole("button", { name: /Ver todos os 31/ }).click();
	await page.mouse.wheel(0, 1400);
	await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
	const top = await page
		.locator(".thermo-card")
		.evaluate((el) => el.getBoundingClientRect().top);
	expect(top).toBeGreaterThanOrEqual(44);
	expect(top).toBeLessThanOrEqual(80);
});

test("celular: as três abas cabem e a folha fecha ao arrastar para baixo", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await enter(page, "Zane Levy");
	for (const name of [
		"Prioridades da semana",
		"Atualize ou dê perda",
		"Prospecção",
	]) {
		const box = await tab(page, name).boundingBox();
		expect(box && box.x >= 0 && box.x + box.width <= 390, name).toBe(true);
	}
	await page.getByRole("button", { name: "Ver o motivo" }).click();
	await expect(page.locator(".panel.open")).toHaveCount(1);
	const grip = await page.locator(".panel-grip").boundingBox();
	if (!grip) throw new Error("sem alça");
	await page.mouse.move(grip.x + 40, grip.y + 20);
	await page.mouse.down();
	await page.mouse.move(grip.x + 40, grip.y + 120, { steps: 5 });
	await page.mouse.move(grip.x + 40, grip.y + 260, { steps: 5 });
	await page.mouse.up();
	await expect(page.locator(".panel.open")).toHaveCount(0);
});

for (const width of [1280, 390])
	test(`sem rolagem lateral em ${width} px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		for (const seller of ["Zane Levy", "Anna Snelling", "Darcel Schlecht"]) {
			await enter(page, seller);
			for (const name of [
				"Prioridades da semana",
				"Atualize ou dê perda",
				"Prospecção",
			]) {
				await tab(page, name).click();
				const overflow = await page.evaluate(
					() => document.documentElement.scrollWidth - innerWidth,
				);
				expect(overflow, `${seller}, ${name}`).toBeLessThanOrEqual(0);
			}
		}
		await enter(page, "Summer Sewald");
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - innerWidth,
		);
		expect(overflow, "equipe").toBeLessThanOrEqual(0);
	});
