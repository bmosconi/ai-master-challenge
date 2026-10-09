// Números de referência com os dados reais. Uma regressão no núcleo quebra o `npm run check`.
// - "none": a regra da preparação, reconciliada com o Python (01-revisao-inicial.md, R1–R4).
// - "clean": a regra final (G1): coorte só com iniciados a partir da primeira conclusão observada.
// - "lateEntry": a alternativa considerada (decisoes.md).

import { describe, expect, it } from "vitest";
import { loadDataset } from "../node/load.ts";
import { calibrationAt, funnelAt, stageCounts } from "./analysis.ts";
import {
	METHOD_NAMES,
	perAgent,
	rankAt,
	runBacktest,
	SNAPSHOTS,
} from "./backtest.ts";
import { type Deal, day, type Stage } from "./data.ts";
import {
	chanceCurve,
	cohort,
	hasEnoughHistory,
	REFERENCE_DATE,
	type Truncation,
} from "./rules.ts";
import { pairedTest } from "./stats.ts";

const ds = loadDataset();
const T = REFERENCE_DATE;
const round = (v: number, d: number) => Number(v.toFixed(d));

describe("dados reais (31/12/2017)", () => {
	it("contagens", () => {
		expect(ds.deals).toHaveLength(8800);
		expect(stageCounts(ds)).toEqual({
			Won: 4238,
			Lost: 2473,
			Engaging: 1589,
			Prospecting: 500,
		});
		expect([ds.accounts.size, ds.prices.size, ds.agents.length]).toEqual([
			85, 7, 35,
		]);
	});

	it("coorte e chance por faixa (em risco: duração > b), nas três regras", () => {
		const pct = (truncation: Truncation) =>
			chanceCurve(ds.deals, T, { truncation }).map((c) =>
				round(c.chance * 100, 1),
			);
		expect(cohort(ds.deals, T, { truncation: "none" })).toHaveLength(5991);
		expect(pct("none")).toEqual([49.8, 46.4, 44.0, 32.9, 21.2, 9.1]);
		expect(cohort(ds.deals, T)).toHaveLength(4806);
		expect(pct("clean")).toEqual([47.3, 41.7, 38.6, 25.6, 13.5, 4.3]);
		expect(pct("lateEntry")).toEqual([47.3, 42.9, 41.2, 30.8, 19.9, 8.6]);
	});

	it("datas disponíveis: toda faixa com IC 95% de no máximo ±5 p.p.", () => {
		const ok = (truncation: Truncation) =>
			[...SNAPSHOTS, T].map((t) =>
				hasEnoughHistory(chanceCurve(ds.deals, t, { truncation })),
			);
		expect(ok("clean")).toEqual([false, false, false, true, true]); // 31/08 fica fora por ±5,013 p.p.
		expect(ok("lateEntry")).toEqual([false, true, true, true, true]);
	});

	it("funil por situação a preço de lista e valor ponderado", () => {
		const f = funnelAt(ds, T, chanceCurve(ds.deals, T, { truncation: "none" }));
		expect([
			f.slices["no-prazo"].deals,
			f.slices.esfriando.deals,
			f.slices.parado.deals,
		]).toEqual([110, 188, 1291]);
		expect([
			f.slices["no-prazo"].listPrice,
			f.slices.esfriando.listPrice,
			f.slices.parado.listPrice,
			f.prospecting.listPrice,
		]).toEqual([227_651, 465_914, 3_198_664, 1_073_986]);
		expect(
			Math.round(f.slices["no-prazo"].weighted + f.slices.esfriando.weighted),
		).toBe(195_380);
		const clean = funnelAt(ds, T);
		expect(
			Math.round(
				clean.slices["no-prazo"].weighted + clean.slices.esfriando.weighted,
			),
		).toBe(154_880);
	});
});

describe("backtest", () => {
	const shares = (r: ReturnType<typeof runBacktest>) =>
		Object.fromEntries(
			Object.entries(r.share).map(([k, v]) => [k, round(v * 100, 2)]),
		);

	it("regra final: só a foto de 30/09 tem histórico suficiente", () => {
		const r = runBacktest(ds);
		expect(r.snapshots).toEqual([day("2017-09-30")]);
		expect(shares(r)).toEqual({
			weighted: 47.7,
			situationThenPrice: 42.11,
			priceNoStale: 35.14,
			price: 29.01,
			concludedOnly: 22.3,
			random: 13.97,
		});
	});

	it('CA3: com a regra final, o valor ponderado ganha de "só preço" com IC 95% acima de zero', () => {
		const r = pairedTest(perAgent(runBacktest(ds).units, "weighted", "price"));
		expect(r.ci95[0]).toBeGreaterThan(0);
		expect(round(r.difference * 100, 2)).toBe(18.69);
	});

	it("entrada tardia: 31/07, 31/08 e 30/09", () => {
		const r = runBacktest(ds, { truncation: "lateEntry" });
		expect(r.snapshots).toEqual(SNAPSHOTS.slice(1));
		expect(shares(r)).toEqual({
			weighted: 40.86,
			situationThenPrice: 40.74,
			priceNoStale: 37.64,
			price: 33.2,
			concludedOnly: 29.09,
			random: 14.07,
		});
	});

	it("regra da preparação: 4 fotos, 6 métodos (2 casas), igual ao Python", () => {
		expect(shares(runBacktest(ds, { truncation: "none" }))).toEqual({
			weighted: 44.41,
			situationThenPrice: 43.16,
			priceNoStale: 40.1,
			price: 36.17,
			concludedOnly: 32.23,
			random: 15.4,
		});
	});

	it("anti-vazamento: mudar o que acontece depois de T não muda a ordem de nenhum método", () => {
		const t = SNAPSHOTS[1] as number;
		const flip: Record<Stage, Stage> = {
			Won: "Lost",
			Lost: "Won",
			Engaging: "Won",
			Prospecting: "Prospecting",
		};
		const future: Deal[] = ds.deals.map((d) =>
			d.engage !== null && d.engage <= t && (d.close === null || d.close > t)
				? { ...d, stage: flip[d.stage], close: t + 1, closeValue: 1 }
				: d,
		);
		const ids = (deals: Deal[]) =>
			rankAt({ ...ds, deals }, t).agents.map((a) =>
				METHOD_NAMES.map((m) => a.ranked[m].map((c) => c.deal.id).join(",")),
			);
		expect(ids(future)).toEqual(ids(ds.deals));
	});
});

describe("calibração (H11, revisão inicial)", () => {
	it("em 31/08, a curva prevê mais ganhos do que acontecem; a coorte limpa erra menos", () => {
		const t = day("2017-08-31");
		const full = calibrationAt(ds, t, REFERENCE_DATE, { truncation: "none" });
		const clean = calibrationAt(ds, t);
		const late = calibrationAt(ds, t, REFERENCE_DATE, {
			truncation: "lateEntry",
		});
		expect(
			[full, clean, late, full].map((c, i) =>
				round((i < 3 ? c.predicted : c.realized) * 100, 1),
			),
		).toEqual([51.7, 45.3, 47.7, 34.3]);
		expect(clean.cohort).toBe(1258);
	});
});
