// O motivo de cada posição, dito ao vendedor. Sai das mesmas funções que dão o score.

import {
	type AgentLists,
	type BandChance,
	COOLING_FROM,
	REFERENCE_DATE,
	type ScoredDeal,
	STALE_AFTER,
} from "./rules.ts";

export interface Deadline {
	kind: "esfria" | "parado";
	days: number;
}

/**
 * D30: só os dois limites com significado, "Esfria em N dias" (90) e "Fica parado em N dias"
 * (depois de 138, o maior ciclo observado). Não prevê queda de chance e não muda a ordem.
 */
export function deadline(age: number): Deadline | null {
	if (age < COOLING_FROM) return { kind: "esfria", days: COOLING_FROM - age };
	if (age <= STALE_AFTER)
		return { kind: "parado", days: STALE_AFTER + 1 - age };
	return null;
}

/** "X de cada 10", arredondado. É a mesma chance que multiplica o preço no valor ponderado. */
export const outOfTen = (chance: number): number => Math.round(chance * 10);

/** D28: a chance como histórico. `band` = faixa do negócio; null = parado (sem faixa). */
export function chancePhrase(band: BandChance | null): string {
	if (band === null)
		return `Nenhum negócio da base virou venda depois de ${STALE_AFTER} dias em andamento.`;
	const who =
		band.from === 0
			? "Dos negócios iniciados"
			: `Dos negócios que chegaram a ${band.from} dias ainda em andamento`;
	const x = outOfTen(band.chance);
	const howMany =
		x === 0
			? "menos de 1 de cada 10 virou venda"
			: `${x} de cada 10 ${x === 1 ? "virou" : "viraram"} venda`;
	return `${who}, ${howMany}.`;
}

/**
 * A conta do painel precisa fechar com o que a tela mostra: chance com uma casa (42,9%) e
 * valor ponderado = preço × essa chance. A ordem continua pelo valor exato; um teste com os
 * dados reais garante que o valor exibido nunca inverte a ordem.
 */
export const shownChance = (chance: number): number =>
	Math.round(chance * 1000) / 1000;
export const shownWeighted = (s: Pick<ScoredDeal, "price" | "chance">) =>
	Math.round(s.price * shownChance(s.chance));

/** Posição de cada negócio se a lista fosse ordenada só por preço (H10: mostrar quando diverge). */
export function priceRanks(list: readonly ScoredDeal[]): Map<string, number> {
	const byPrice = [...list].sort(
		(a, b) =>
			b.price - a.price ||
			(a.deal.id < b.deal.id ? -1 : a.deal.id > b.deal.id ? 1 : 0),
	);
	return new Map(byPrice.map((s, i) => [s.deal.id, i + 1]));
}

/**
 * A empresa só aparece na data padrão. Antes dela, "sem empresa" entrega o futuro: nas fotos de
 * 31/07, 31/08 e 30/09, todo negócio em andamento sem empresa ainda estava em andamento em 31/12.
 */
export const showAccount = (t: number): boolean => t === REFERENCE_DATE;

/** O que a "Foque agora" vazia manda fazer (CA5). null = a lista tem negócios. */
export type EmptyFocus = "sem-negocios" | "revisar" | "iniciar" | "nada-aberto";

export function emptyFocus(
	lists: AgentLists,
	hasDeals: boolean,
): EmptyFocus | null {
	if (lists.focus.length > 0) return null;
	if (!hasDeals) return "sem-negocios";
	if (lists.review.length > 0) return "revisar";
	if (lists.prospect.length > 0) return "iniciar";
	return "nada-aberto";
}
