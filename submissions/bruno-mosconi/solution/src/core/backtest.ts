// Backtest: em cada foto T, ordena os negócios abertos de cada vendedor e mede quanto da receita
// ganha em (T, T+90] ficou entre os 10 primeiros. Curva, coorte e corte vêm só do que se sabia em T.

import { type Dataset, type Deal, day, priceOf } from "./data.ts";
import {
	type AtRisk,
	BANDS,
	type BandChance,
	byId,
	chanceCurve,
	chanceForAge,
	concludedOnlyCurve,
	maxCycleBy,
	observedDuration,
	openAt,
	STALE_AFTER,
} from "./rules.ts";

export const SNAPSHOTS = [
	"2017-06-30",
	"2017-07-31",
	"2017-08-31",
	"2017-09-30",
].map(day);
export const WINDOW_DAYS = 90;
export const TOP_N = 10;

export interface Candidate {
	deal: Deal;
	age: number;
	price: number;
	stale: boolean;
	revenue: number; // close_value se ganho em (T, T+90]; senão 0
}

interface Context {
	curve: readonly BandChance[];
	wrongCurve: readonly BandChance[];
	cutoff: number;
}

type Ranker = (cands: Candidate[], ctx: Context) => Candidate[];

const tie = (a: Candidate, b: Candidate) => byId(a.deal, b.deal);
const chanceOf = (ctx: Context, c: Candidate) =>
	chanceForAge(ctx.curve, c.age, ctx.cutoff);
const sortBy = (cands: Candidate[], key: (c: Candidate) => number) =>
	[...cands].sort((a, b) => key(b) - key(a) || tie(a, b));

export const METHODS = {
	weighted: (cands, ctx) => sortBy(cands, (c) => chanceOf(ctx, c) * c.price),
	bandsThenPrice: (cands, ctx) =>
		[...cands].sort(
			(a, b) =>
				chanceOf(ctx, b) - chanceOf(ctx, a) || b.price - a.price || tie(a, b),
		),
	priceNoStale: (cands) => {
		const fresh = sortBy(
			cands.filter((c) => !c.stale),
			(c) => c.price,
		);
		const stale = cands
			.filter((c) => c.stale)
			.sort((a, b) => b.price - a.price || b.age - a.age || tie(a, b));
		return [...fresh, ...stale];
	},
	price: (cands) => sortBy(cands, (c) => c.price),
	concludedOnly: (cands, ctx) =>
		sortBy(
			cands,
			(c) => chanceForAge(ctx.wrongCurve, c.age, ctx.cutoff) * c.price,
		),
} satisfies Record<string, Ranker>;

export type MethodName = keyof typeof METHODS;
export const METHOD_NAMES = Object.keys(METHODS) as MethodName[];

export interface BacktestOptions {
	snapshots?: readonly number[];
	bands?: readonly number[];
	atRisk?: AtRisk;
	cutoff?: "fixed" | "observed"; // 138 fixo ou o maior ciclo observado em T (H2)
	minEngage?: number; // curva só com iniciados a partir deste dia (H11)
}

export interface Unit {
	agent: string;
	t: number;
	candidates: number;
	denominator: number;
	captured: Record<MethodName, number>;
	randomExpected: number;
}

export interface BacktestResult {
	units: Unit[];
	share: Record<MethodName | "random", number>;
	cutoffs: number[];
}

export function candidatesAt(
	ds: Dataset,
	t: number,
	cutoff: number,
): Candidate[] {
	return ds.deals
		.filter((d) => openAt(d, t))
		.map((deal) => {
			const age = observedDuration(deal, t);
			const won =
				deal.stage === "Won" &&
				(deal.close as number) > t &&
				(deal.close as number) <= t + WINDOW_DAYS;
			return {
				deal,
				age,
				price: priceOf(ds, deal),
				stale: age > cutoff,
				revenue: won ? (deal.closeValue ?? 0) : 0,
			};
		});
}

export function runBacktest(
	ds: Dataset,
	opts: BacktestOptions = {},
): BacktestResult {
	const units: Unit[] = [];
	const cutoffs: number[] = [];
	for (const t of opts.snapshots ?? SNAPSHOTS) {
		const cutoff =
			opts.cutoff === "observed" ? maxCycleBy(ds.deals, t) : STALE_AFTER;
		cutoffs.push(cutoff);
		const bands = (opts.bands ?? BANDS).filter((b) => b <= cutoff);
		const curveOpts = {
			bands,
			atRisk: opts.atRisk,
			cutoff,
			minEngage: opts.minEngage,
		};
		const ctx: Context = {
			curve: chanceCurve(ds.deals, t, curveOpts),
			wrongCurve: concludedOnlyCurve(ds.deals, t, bands),
			cutoff,
		};
		const byAgent = Map.groupBy(
			candidatesAt(ds, t, cutoff),
			(c) => c.deal.agent,
		);
		for (const [agent, cands] of [...byAgent].sort(([a], [b]) =>
			a < b ? -1 : 1,
		)) {
			const denominator = cands.reduce((s, c) => s + c.revenue, 0);
			const captured = Object.fromEntries(
				METHOD_NAMES.map((m) => [
					m,
					METHODS[m](cands, ctx)
						.slice(0, TOP_N)
						.reduce((s, c) => s + c.revenue, 0),
				]),
			) as Record<MethodName, number>;
			const randomExpected = Math.min(1, TOP_N / cands.length) * denominator;
			units.push({
				agent,
				t,
				candidates: cands.length,
				denominator,
				captured,
				randomExpected,
			});
		}
	}
	const total = units.reduce((s, u) => s + u.denominator, 0);
	const share = Object.fromEntries([
		...METHOD_NAMES.map((m) => [
			m,
			units.reduce((s, u) => s + u.captured[m], 0) / total,
		]),
		["random", units.reduce((s, u) => s + u.randomExpected, 0) / total],
	]) as BacktestResult["share"];
	return { units, share, cutoffs };
}

/** Por vendedor, somando as datas: a unidade do teste pareado (as fotos se sobrepõem). */
export function perAgent(units: readonly Unit[], a: MethodName, b: MethodName) {
	const m = new Map<string, { a: number; b: number; den: number }>();
	for (const u of units) {
		const x = m.get(u.agent) ?? { a: 0, b: 0, den: 0 };
		x.a += u.captured[a];
		x.b += u.captured[b];
		x.den += u.denominator;
		m.set(u.agent, x);
	}
	return [...m.values()];
}
