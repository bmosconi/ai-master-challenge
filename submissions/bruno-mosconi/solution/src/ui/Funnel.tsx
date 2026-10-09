// A barra de números (D12, gráfico 1): o funil em andamento a preço de lista, por situação.

import type { FunnelSlice } from "../core/analysis.ts";
import type { Situation } from "../core/rules.ts";
import { num, usdShort } from "./format.ts";

export const SITUATIONS: { key: Situation; label: string }[] = [
	{ key: "no-prazo", label: "No prazo" },
	{ key: "esfriando", label: "Esfriando" },
	{ key: "parado", label: "Parado" },
];

const plural = (n: number, one: string, many: string) =>
	`${num(n)} ${n === 1 ? one : many}`;

export function StackBar({
	slices,
	small = false,
}: {
	slices: Record<Situation, FunnelSlice>;
	small?: boolean;
}) {
	const total = SITUATIONS.reduce((s, x) => s + slices[x.key].listPrice, 0);
	if (total === 0) return null;
	const text = SITUATIONS.map(
		(x) => `${x.label}: ${usdShort(slices[x.key].listPrice)}`,
	).join("; ");
	return (
		<div
			className={small ? "stack small" : "stack"}
			role="img"
			aria-label={text}
		>
			{SITUATIONS.filter((x) => slices[x.key].listPrice > 0).map((x) => (
				<span
					key={x.key}
					className={`seg-${x.key}`}
					style={{ flexGrow: slices[x.key].listPrice }}
					title={`${x.label}: ${plural(slices[x.key].deals, "negócio", "negócios")}, ${usdShort(slices[x.key].listPrice)}`}
				/>
			))}
		</div>
	);
}

export function FunnelSummary({
	slices,
	prospecting,
	showProspecting,
}: {
	slices: Record<Situation, FunnelSlice>;
	prospecting: { deals: number; listPrice: number };
	showProspecting: boolean;
}) {
	const deals = SITUATIONS.reduce((s, x) => s + slices[x.key].deals, 0);
	const total = SITUATIONS.reduce((s, x) => s + slices[x.key].listPrice, 0);
	// Para baixo: 99,9% parado não pode virar "100%" quando ainda há negócio vivo.
	const stale = total ? Math.floor((slices.parado.listPrice / total) * 100) : 0;
	return (
		<section className="funnel" aria-label="Funil em andamento">
			{deals === 0 ? (
				<p className="funnel-head">Nenhum negócio em andamento nesta data.</p>
			) : (
				<>
					<p className="funnel-head">
						<strong>
							{plural(deals, "negócio em andamento", "negócios em andamento")}
						</strong>{" "}
						somam {usdShort(total)} a preço de lista.{" "}
						<strong>{stale}% desse valor está parado</strong> há mais de 138
						dias.
					</p>
					<StackBar slices={slices} />
					<ul className="legend">
						{SITUATIONS.map((x) => (
							<li key={x.key}>
								<span className={`swatch seg-${x.key}`} aria-hidden="true" />
								<span>{x.label}</span>
								<span className="detail">
									{plural(slices[x.key].deals, "negócio", "negócios")},{" "}
									{usdShort(slices[x.key].listPrice)}
								</span>
							</li>
						))}
					</ul>
				</>
			)}
			{showProspecting && prospecting.deals > 0 && (
				<p className="prospect-note">
					Fora da barra: {plural(prospecting.deals, "negócio", "negócios")} em
					prospecção, sem data de início, somando{" "}
					{usdShort(prospecting.listPrice)} a preço de lista.
				</p>
			)}
		</section>
	);
}
