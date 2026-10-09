import { describe, expect, it } from "vitest";
import {
	chancePhrase,
	deadline,
	outOfTen,
	priceRanks,
	shownWeighted,
} from "./reason.ts";
import type { BandChance, ScoredDeal } from "./rules.ts";

describe("prazo (D30): só os dois limites, sem prever queda de chance", () => {
	it("esfria aos 90 dias", () => {
		expect(deadline(0)).toEqual({ kind: "esfria", days: 90 });
		expect(deadline(89)).toEqual({ kind: "esfria", days: 1 });
	});

	it("fica parado depois de 138 dias", () => {
		expect(deadline(90)).toEqual({ kind: "parado", days: 49 });
		expect(deadline(138)).toEqual({ kind: "parado", days: 1 });
	});

	it("parado não tem prazo", () => {
		expect(deadline(139)).toBeNull();
	});
});

describe("frase da chance (D28): histórico, não previsão", () => {
	const band = (from: number, won: number, atRisk: number): BandChance => ({
		from,
		won,
		atRisk,
		chance: won / atRisk,
	});

	it("N é o início da faixa e X sai da mesma chance do score", () => {
		const b = band(90, 308, 1000);
		expect(outOfTen(b.chance)).toBe(3);
		expect(chancePhrase(b)).toBe(
			"Dos negócios que chegaram a 90 dias ainda em andamento, 3 de cada 10 viraram venda.",
		);
	});

	it("faixa 0 e singular", () => {
		expect(chancePhrase(band(0, 473, 1000))).toBe(
			"Dos negócios iniciados, 5 de cada 10 viraram venda.",
		);
		expect(chancePhrase(band(120, 86, 1000))).toBe(
			"Dos negócios que chegaram a 120 dias ainda em andamento, 1 de cada 10 virou venda.",
		);
	});

	it("menos de meio em 10", () => {
		expect(chancePhrase(band(120, 43, 1000))).toBe(
			"Dos negócios que chegaram a 120 dias ainda em andamento, menos de 1 de cada 10 virou venda.",
		);
	});

	it("parado: sem faixa", () => {
		expect(chancePhrase(null)).toBe(
			"Nenhum negócio da base virou venda depois de 138 dias em andamento.",
		);
	});
});

describe("conta do painel e ordem por preço", () => {
	const scored = (id: string, price: number, chance: number): ScoredDeal => ({
		deal: {
			id,
			agent: "Ana",
			product: "P",
			account: null,
			stage: "Engaging",
			engage: 0,
			close: null,
			closeValue: null,
		},
		age: 10,
		price,
		chance,
		weighted: price * chance,
	});

	it("valor exibido = preço × chance com uma casa", () => {
		expect(shownWeighted(scored("A", 5482, 0.428_57))).toBe(2352); // 5.482 × 42,9%
	});

	it("posição pela ordem de preço, com desempate pelo ID", () => {
		const r = priceRanks([
			scored("B", 100, 0.5),
			scored("A", 100, 0.1),
			scored("C", 500, 0.05),
		]);
		expect([...r]).toEqual([
			["C", 1],
			["A", 2],
			["B", 3],
		]);
	});
});
