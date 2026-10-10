// Medição para o testador de uso: as três personas em 1280 e 390 px, claro e escuro.
// Mede o tempo e os cliques até a tela responder a pergunta de cada persona, e se a resposta
// aparece sem rolar. Os prints vão para test-results/personas/ (não versionados).

import { writeFileSync } from "node:fs";
import { expect, type Locator, type Page, test } from "@playwright/test";

const OUT = "test-results/personas";
const rows: Record<string, string | number | boolean>[] = [];

// O painel desliza em 280 ms: mede e fotografa depois que ele assenta.
const settle = (page: Page) => page.waitForTimeout(400);

const inView = (page: Page, l: Locator) =>
	l.evaluate((el) => {
		const r = el.getBoundingClientRect();
		return r.top >= 0 && r.bottom <= innerHeight;
	});

for (const scheme of ["light", "dark"] as const)
	for (const width of [1280, 390]) {
		const tag = `${width}-${scheme === "light" ? "claro" : "escuro"}`;
		test.describe(tag, () => {
			test.use({
				viewport: { width, height: width > 600 ? 800 : 844 },
				colorScheme: scheme,
				reducedMotion: "no-preference",
			});

			test("vendedora (Anna Snelling): o negócio para atacar primeiro", async ({
				page,
			}) => {
				await page.goto("/");
				const t0 = Date.now();
				await page.getByRole("button", { name: /^\S+ Anna Snelling/ }).click();
				const hero = page.locator(".hero");
				await expect(hero).toBeVisible();
				await expect(hero).toHaveCSS("opacity", "1");
				const ms = Date.now() - t0;
				rows.push({
					persona: "vendedora",
					tela: tag,
					pergunta: "qual negócio atacar primeiro",
					ms,
					cliques: 1,
					semRolar: await inView(page, hero.locator("h2")),
					resposta: (await hero.locator("h2").textContent()) ?? "",
				});
				await page.screenshot({ path: `${OUT}/vendedora-${tag}.png` });
				const t1 = Date.now();
				await page.getByRole("button", { name: "Ver o motivo" }).click();
				const why = page.locator(".panel.open .why");
				await expect(why).toBeVisible();
				await settle(page);
				rows.push({
					persona: "vendedora",
					tela: tag,
					pergunta: "por que está em primeiro",
					ms: Date.now() - t1,
					cliques: 1,
					semRolar: await inView(page, why),
					resposta: (await why.textContent()) ?? "",
				});
				await page.screenshot({ path: `${OUT}/vendedora-motivo-${tag}.png` });
				await page.keyboard.press("Escape");
				await settle(page);
				const t2 = Date.now();
				await page
					.getByRole("tab", { name: /^(Atualize ou dê perda|Frios) \d/ })
					.click();
				const intro = page.locator(".list-intro");
				await expect(intro).toBeVisible();
				rows.push({
					persona: "vendedora",
					tela: tag,
					pergunta: "o que fazer com os frios",
					ms: Date.now() - t2,
					cliques: 1,
					semRolar: await inView(page, intro),
					resposta: (await intro.textContent()) ?? "",
				});
				await page.screenshot({ path: `${OUT}/vendedora-frios-${tag}.png` });
			});

			test("gestor (Summer Sewald): funil, valor frio e lista vazia", async ({
				page,
			}) => {
				await page.goto("/");
				const t0 = Date.now();
				await page.getByRole("button", { name: /^\S+ Summer Sewald/ }).click();
				const lead = page.locator(".lead-h1");
				await expect(lead).toBeVisible();
				rows.push({
					persona: "gestor",
					tela: tag,
					pergunta: "quanto valor está frio",
					ms: Date.now() - t0,
					cliques: 1,
					semRolar: await inView(page, lead),
					resposta: (await lead.textContent()) ?? "",
				});
				const empty = page.locator(".lead-note");
				rows.push({
					persona: "gestor",
					tela: tag,
					pergunta: "qual vendedor tem a lista vazia",
					ms: 0,
					cliques: 0,
					semRolar: await inView(page, empty),
					resposta: (await empty.textContent()) ?? "",
				});
				await page.screenshot({
					path: `${OUT}/gestor-${tag}.png`,
					fullPage: true,
				});
			});

			test("Head de RevOps: como o score funciona", async ({ page }) => {
				await page.goto("/");
				await page.getByRole("button", { name: /^\S+ Summer Sewald/ }).click();
				const t0 = Date.now();
				await page
					.getByRole("navigation", { name: "Áreas" })
					.getByRole("link", { name: "Como funciona" })
					.first()
					.click();
				const bands = page.locator(".bands-card");
				await expect(bands).toBeVisible();
				rows.push({
					persona: "RevOps",
					tela: tag,
					pergunta: "como o score funciona",
					ms: Date.now() - t0,
					cliques: 1,
					semRolar: await inView(page, bands),
					resposta: (await page.locator(".how .lead-sub").textContent()) ?? "",
				});
				await page.screenshot({
					path: `${OUT}/revops-${tag}.png`,
					fullPage: true,
				});
			});
		});
	}

test.afterAll(() => {
	writeFileSync(`${OUT}/medicoes.json`, JSON.stringify(rows, null, 2));
	console.table(rows.map(({ resposta, ...r }) => r));
});
