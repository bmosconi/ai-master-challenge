// Regra de priorização numa data de referência T. Tudo aqui olha só o que se sabia em T
// (definições pré-registradas em process-log/01-revisao-inicial.md, seção 3).

import { type Dataset, type Deal, day, priceOf } from "./data.ts";

export const COOLING_FROM = 90; // "Esfriando" a partir de 90 dias
export const STALE_AFTER = 138; // "Parado" depois de 138 dias
export const BANDS = [0, 30, 60, 90, 104, 120] as const;
export const REFERENCE_DATE = day("2017-12-31");

export type AtRisk = ">=" | ">";

export interface CurveOptions {
	bands?: readonly number[];
	atRisk?: AtRisk;
	cutoff?: number; // dias; coorte = iniciados até T − cutoff; acima disso, parado
	minEngage?: number; // só iniciados a partir deste dia (H11)
}

export interface BandChance {
	from: number;
	atRisk: number;
	won: number;
	chance: number;
}

export const existsAt = (d: Deal, t: number): boolean =>
	d.engage !== null && d.engage <= t;
export const closedBy = (d: Deal, t: number): boolean =>
	d.close !== null && d.close <= t;
export const openAt = (d: Deal, t: number): boolean =>
	existsAt(d, t) && !closedBy(d, t);
export const wonBy = (d: Deal, t: number): boolean =>
	d.stage === "Won" && closedBy(d, t);

/** Dias entre o início e min(conclusão, T). Para quem conclui depois de T, vale T. */
export function observedDuration(d: Deal, t: number): number {
	if (d.engage === null) throw new Error(`negócio sem data: ${d.id}`);
	return (closedBy(d, t) ? (d.close as number) : t) - d.engage;
}

export const ageAt = (d: Deal, t: number): number => observedDuration(d, t);

/** Maior ciclo entre os concluídos até T (alternativa ao corte fixo de 138). */
export function maxCycleBy(deals: readonly Deal[], t: number): number {
	let max = -1;
	for (const d of deals)
		if (existsAt(d, t) && closedBy(d, t))
			max = Math.max(max, observedDuration(d, t));
	return max;
}

export function cohort(
	deals: readonly Deal[],
	t: number,
	opts: CurveOptions = {},
): Deal[] {
	const cutoff = opts.cutoff ?? STALE_AFTER;
	return deals.filter(
		(d) =>
			d.engage !== null &&
			d.engage <= t - cutoff &&
			(opts.minEngage === undefined || d.engage >= opts.minEngage),
	);
}

/** Chance de virar venda para quem ainda está aberto ao começar cada faixa (sem viés de sobrevivência). */
export function chanceCurve(
	deals: readonly Deal[],
	t: number,
	opts: CurveOptions = {},
): BandChance[] {
	const bands = opts.bands ?? BANDS;
	const strict = opts.atRisk === ">";
	const base = cohort(deals, t, opts).map((d) => ({
		dur: observedDuration(d, t),
		won: wonBy(d, t),
	}));
	return bands.map((from) => {
		const risk = base.filter((x) => (strict ? x.dur > from : x.dur >= from));
		const won = risk.filter((x) => x.won).length;
		return {
			from,
			atRisk: risk.length,
			won,
			chance: risk.length ? won / risk.length : 0,
		};
	});
}

/** O cálculo errado: só concluídos até T, com ciclo ≥ b. Fica aqui para mostrar o viés. */
export function concludedOnlyCurve(
	deals: readonly Deal[],
	t: number,
	bands: readonly number[] = BANDS,
	atRisk: AtRisk = ">=",
): BandChance[] {
	const done = deals
		.filter((d) => existsAt(d, t) && closedBy(d, t))
		.map((d) => ({ dur: observedDuration(d, t), won: d.stage === "Won" }));
	return bands.map((from) => {
		const risk = done.filter((x) =>
			atRisk === ">" ? x.dur > from : x.dur >= from,
		);
		const won = risk.filter((x) => x.won).length;
		return {
			from,
			atRisk: risk.length,
			won,
			chance: risk.length ? won / risk.length : 0,
		};
	});
}

/** Índice da faixa da idade; −1 quando passou do corte (parado). */
export function bandIndex(
	age: number,
	bands: readonly number[] = BANDS,
	cutoff = STALE_AFTER,
): number {
	if (age > cutoff) return -1;
	let idx = -1;
	bands.forEach((b, i) => {
		if (b <= age) idx = i;
	});
	return idx;
}

export function chanceForAge(
	curve: readonly BandChance[],
	age: number,
	cutoff = STALE_AFTER,
): number {
	const i = bandIndex(
		age,
		curve.map((c) => c.from),
		cutoff,
	);
	return i < 0 ? 0 : (curve[i]?.chance ?? 0);
}

export type Situation = "no-prazo" | "esfriando" | "parado";

export const situation = (age: number): Situation =>
	age > STALE_AFTER ? "parado" : age >= COOLING_FROM ? "esfriando" : "no-prazo";

export const byId = (a: Deal, b: Deal): number =>
	a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

export interface ScoredDeal {
	deal: Deal;
	age: number;
	price: number;
	chance: number;
	weighted: number;
}

export interface AgentLists {
	focus: ScoredDeal[]; // "Foque agora": abertos até 138 dias, por valor ponderado
	review: ScoredDeal[]; // "Revisar ou encerrar": parados
	prospect: Deal[]; // "Inicie contato": Prospecting, só na data padrão (D13)
}

/** Ordem da lista "Revisar ou encerrar" (D21): preço, depois idade (mais antigo primeiro), depois ID. */
export const reviewOrder = (a: ScoredDeal, b: ScoredDeal): number =>
	b.price - a.price || b.age - a.age || byId(a.deal, b.deal);

export function scoreOpen(
	ds: Dataset,
	t: number,
	curve: readonly BandChance[],
	agent?: string,
): ScoredDeal[] {
	return ds.deals
		.filter((d) => openAt(d, t) && (agent === undefined || d.agent === agent))
		.map((deal) => {
			const age = ageAt(deal, t);
			const price = priceOf(ds, deal);
			const chance = chanceForAge(curve, age);
			return { deal, age, price, chance, weighted: chance * price };
		});
}

export function agentLists(
	ds: Dataset,
	t: number,
	agent: string,
	curve = chanceCurve(ds.deals, t),
): AgentLists {
	const scored = scoreOpen(ds, t, curve, agent);
	const focus = scored
		.filter((s) => s.age <= STALE_AFTER)
		.sort((a, b) => b.weighted - a.weighted || byId(a.deal, b.deal));
	const review = scored.filter((s) => s.age > STALE_AFTER).sort(reviewOrder);
	const prospect =
		t === REFERENCE_DATE
			? ds.deals
					.filter((d) => d.stage === "Prospecting" && d.agent === agent)
					.sort((a, b) => priceOf(ds, b) - priceOf(ds, a) || byId(a, b))
			: [];
	return { focus, review, prospect };
}
