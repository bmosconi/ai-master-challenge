// O que a tela mostra de cada negócio, lido do núcleo. Nenhuma regra nova aqui.

import { teamStatus } from "../core/analysis.ts";
import { type Deal, priceOf } from "../core/data.ts";
import {
	chancePhrase,
	type Deadline,
	deadline,
	type EmptyFocus,
	emptyFocus,
	priceRanks,
	showAccount,
	shownPercent,
	shownWeighted,
} from "../core/reason.ts";
import {
	agentLists,
	type BandChance,
	bandForAge,
	chanceCurve,
	type ScoredDeal,
	STALE_AFTER,
	scoreOpen,
	situation,
} from "../core/rules.ts";
import { potentialScores } from "../core/score.ts";
import { dataset as ds } from "./dataset.ts";

export type Temp = "quente" | "esfriando" | "frio";

const TEMP = {
	"no-prazo": "quente",
	esfriando: "esfriando",
	parado: "frio",
} as const;
export const tempOf = (age: number): Temp => TEMP[situation(age)];

export interface DealView {
	id: string;
	product: string;
	/** Nas datas passadas fica oculta, e a falta dela também (D34): undefined = não mostrar nada. */
	account: string | null | undefined;
	age: number | null; // null = prospecção (sem data)
	price: number;
	percent: number; // chance de fechar, pelo histórico, em % inteira
	potential: number; // preço × percent, o mesmo número da conta
	score?: number; // só quentes e esfriando (D39)
	phrase: string;
	deadline: Deadline | null;
	position: number;
	priceRank?: number;
	temp: Temp | null;
}

export interface DayModel {
	t: number;
	curve: BandChance[];
	scores: Map<string, number>;
	scoreBase: number; // negócios quentes e esfriando da empresa nesta data
}

export function dayModel(t: number): DayModel {
	const curve = chanceCurve(ds.deals, t);
	const scores = potentialScores(scoreOpen(ds, t, curve));
	return { t, curve, scores, scoreBase: scores.size };
}

const WITH_DEALS = new Set(ds.deals.map((d) => d.agent));

export interface SellerModel {
	name: string;
	hasDeals: boolean;
	focus: DealView[];
	review: DealView[];
	prospect: DealView[];
	empty: EmptyFocus | null;
}

export function sellerModel(day: DayModel, name: string): SellerModel {
	const lists = agentLists(ds, day.t, name, day.curve);
	const ranks = priceRanks(lists.focus);
	const account = (d: Deal) => (showAccount(day.t) ? d.account : undefined);
	const scored = (s: ScoredDeal, i: number): DealView => ({
		id: s.deal.id,
		product: s.deal.product,
		account: account(s.deal),
		age: s.age,
		price: s.price,
		percent: shownPercent(s.chance),
		potential: shownWeighted(s),
		score: day.scores.get(s.deal.id),
		phrase: chancePhrase(bandForAge(day.curve, s.age)),
		deadline: deadline(s.age),
		position: i + 1,
		priceRank: ranks.get(s.deal.id),
		temp: tempOf(s.age),
	});
	const hasDeals = WITH_DEALS.has(name);
	return {
		name,
		hasDeals,
		focus: lists.focus.map(scored),
		review: lists.review.map(scored),
		prospect: lists.prospect.map((d, i) => ({
			id: d.id,
			product: d.product,
			account: account(d),
			age: null,
			price: priceOf(ds, d),
			percent: 0,
			potential: 0,
			phrase: "",
			deadline: null,
			position: i + 1,
			temp: null,
		})),
		empty: emptyFocus(lists, hasDeals),
	};
}

export const teamOf = (manager: string) =>
	ds.agents.filter((a) => a.manager === manager).map((a) => a.name);

export const teamModel = (day: DayModel, manager: string) =>
	teamStatus(ds, day.t, teamOf(manager), day.curve);

export const PEOPLE = ds.agents;
export const MANAGERS = [...new Set(ds.agents.map((a) => a.manager))].map(
	(name) => ({
		name,
		regional: ds.agents.find((a) => a.manager === name)?.regional ?? "",
		team: teamOf(name).length,
	}),
);

/** O maior potencial exibido em qualquer uma das datas: a escala de tamanho dos pontos não muda com a data. */
export const maxPotential = (ts: readonly number[]) =>
	Math.max(
		...ts.flatMap((t) =>
			scoreOpen(ds, t, chanceCurve(ds.deals, t))
				.filter((s) => s.age <= STALE_AFTER)
				.map(shownWeighted),
		),
	);
