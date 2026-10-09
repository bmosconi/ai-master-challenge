// Números de referência com os dados reais: os valores em que TypeScript e Python concordam
// depois da reconciliação (process-log/01-revisao-inicial.md, R1–R4). Uma regressão no núcleo
// quebra o `npm run check`, e não só a tabela da auditoria.

import { describe, expect, it } from "vitest";
import { loadDataset } from "../node/load.ts";
import { calibrationAt, funnelAt, stageCounts } from "./analysis.ts";
import { METHOD_NAMES, rankAt, runBacktest, SNAPSHOTS } from "./backtest.ts";
import { type Deal, day, type Stage } from "./data.ts";
import { chanceCurve, cohort, REFERENCE_DATE } from "./rules.ts";

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

	it("coorte e chance por faixa (em risco: duração > b)", () => {
		expect(cohort(ds.deals, T)).toHaveLength(5991);
		expect(
			chanceCurve(ds.deals, T).map((c) => round(c.chance * 100, 1)),
		).toEqual([49.8, 46.4, 44.0, 32.9, 21.2, 9.1]);
	});

	it("funil por situação a preço de lista e valor ponderado", () => {
		const f = funnelAt(ds, T);
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
	});
});

describe("backtest", () => {
	it("receita capturada pelos 10 primeiros, 6 métodos (2 casas)", () => {
		const s = runBacktest(ds).share;
		expect(
			Object.fromEntries(
				Object.entries(s).map(([k, v]) => [k, round(v * 100, 2)]),
			),
		).toEqual({
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
		const full = calibrationAt(ds, t);
		const clean = calibrationAt(ds, t, REFERENCE_DATE, {
			minEngage: day("2017-03-01"),
		});
		expect([
			round(full.predicted * 100, 1),
			round(clean.predicted * 100, 1),
			round(full.realized * 100, 1),
		]).toEqual([51.7, 45.3, 34.3]);
		expect(clean.cohort).toBe(1258);
	});
});
