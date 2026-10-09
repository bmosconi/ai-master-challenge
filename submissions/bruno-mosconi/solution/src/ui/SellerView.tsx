// Visão do vendedor: as três listas (AGENTS §7) e o painel com o motivo de cada posição.

import { Fragment, type ReactNode, useState } from "react";
import type { Agent, Deal } from "../core/data.ts";
import {
	chancePhrase,
	deadline,
	emptyFocus,
	priceRanks,
	shownChance,
	shownWeighted,
} from "../core/reason.ts";
import {
	type AgentLists,
	type BandChance,
	bandForAge,
	REFERENCE_DATE,
	type ScoredDeal,
	situation,
} from "../core/rules.ts";
import { date, num, pct, usd } from "./format.ts";

type Tab = "focus" | "review" | "prospect";

export interface Row {
	id: string;
	deal: Deal;
	price: number;
	scored?: ScoredDeal; // ausente na prospecção
}

interface Column {
	key: string;
	label: string;
	numeric?: boolean;
	wide?: boolean; // some em 390 px
	sort?: (r: Row) => number;
	cell: (r: Row, position: number) => ReactNode;
}

const dealCell = (r: Row, showAccount: boolean) => (
	<>
		{r.deal.product}
		{showAccount && (
			<span className="account">
				{" "}
				{r.deal.account ?? "Empresa não informada"}
			</span>
		)}
	</>
);

function AgeBadge({ age }: { age: number }) {
	const s = situation(age);
	if (s === "esfriando")
		return <span className="badge badge-esfriando">Esfriando</span>;
	if (s === "parado")
		return (
			<span className="badge badge-parado">Parado há {num(age)} dias</span>
		);
	return null;
}

function deadlineText(age: number) {
	const d = deadline(age);
	if (!d) return "";
	const days = `${num(d.days)} ${d.days === 1 ? "dia" : "dias"}`;
	return d.kind === "esfria" ? `Esfria em ${days}` : `Fica parado em ${days}`;
}

function columnsFor(tab: Tab, showAccount: boolean): Column[] {
	const position: Column = {
		key: "pos",
		label: "Posição",
		numeric: true,
		cell: (_, i) => `${i}º`,
	};
	const deal: Column = {
		key: "deal",
		label: "Negócio",
		cell: (r) => dealCell(r, showAccount),
	};
	const price: Column = {
		key: "price",
		label: "Preço de lista",
		numeric: true,
		sort: (r) => r.price,
		cell: (r) => usd(r.price),
	};
	if (tab === "prospect") return [position, deal, price];
	const age: Column = {
		key: "age",
		label: "Idade",
		sort: (r) => r.scored?.age ?? 0,
		cell: (r) => {
			const a = r.scored?.age ?? 0;
			return tab === "review" ? (
				<AgeBadge age={a} />
			) : (
				<>
					<span className="num">
						{num(a)} {a === 1 ? "dia" : "dias"}
					</span>{" "}
					<AgeBadge age={a} />
				</>
			);
		},
	};
	if (tab === "review") return [position, deal, { ...age, wide: true }, price];
	return [
		position,
		deal,
		{ ...age, wide: true },
		{
			key: "deadline",
			label: "Prazo",
			wide: true,
			cell: (r) => deadlineText(r.scored?.age ?? 0),
		},
		{ ...price, wide: true },
		{
			key: "chance",
			label: "Chance",
			numeric: true,
			wide: true,
			sort: (r) => r.scored?.chance ?? 0,
			cell: (r) => pct(shownChance(r.scored?.chance ?? 0)),
		},
		{
			key: "weighted",
			label: "Valor ponderado",
			numeric: true,
			sort: (r) => r.scored?.weighted ?? 0,
			cell: (r) => (r.scored ? usd(shownWeighted(r.scored)) : ""),
		},
	];
}

function Reason({
	row,
	tab,
	position,
	listSize,
	priceRank,
	band,
	showAccount,
}: {
	row: Row;
	tab: Tab;
	position: number;
	listSize: number;
	priceRank?: number;
	band: BandChance | null;
	showAccount: boolean;
}) {
	const s = row.scored;
	const title = (
		<h3>
			{row.deal.product}
			{showAccount
				? ` para ${row.deal.account ?? "empresa não informada"}`
				: ""}
			<span className="deal-meta">
				{row.deal.id}
				{row.deal.engage !== null
					? `, iniciado em ${date(row.deal.engage)}`
					: ""}
			</span>
		</h3>
	);
	if (tab === "prospect")
		return (
			<>
				{title}
				<dl>
					<div>
						<dt>Por que está aqui</dt>
						<dd>
							Prospecção sem contato registrado. A lista segue o preço de lista:{" "}
							{usd(row.price)}, {position}º de {listSize}.
						</dd>
					</div>
					<div>
						<dt>O que fazer</dt>
						<dd>Faça o primeiro contato e registre a data de início.</dd>
					</div>
				</dl>
			</>
		);
	if (!s) return null;
	if (tab === "review")
		return (
			<>
				{title}
				<dl>
					<div>
						<dt>Por que está aqui</dt>
						<dd className="phrase">
							Parado há {num(s.age)} dias. {chancePhrase(null)}
						</dd>
					</div>
					<div>
						<dt>O que fazer</dt>
						<dd>Retome o contato ou marque como perdido.</dd>
					</div>
				</dl>
			</>
		);
	const sit = situation(s.age);
	return (
		<>
			{title}
			<dl>
				<div>
					<dt>Posição</dt>
					<dd>
						{position}º de {listSize} na Foque agora
						{priceRank !== undefined && priceRank !== position
							? `. Pela ordem de preço, estaria em ${priceRank}º.`
							: "."}
					</dd>
				</div>
				<div>
					<dt>Chance pela idade ({num(s.age)} dias)</dt>
					<dd className="phrase">{chancePhrase(band)}</dd>
				</div>
				<div>
					<dt>Valor ponderado</dt>
					<dd className="calc">
						{usd(s.price)} de preço de lista × {pct(shownChance(s.chance))} ={" "}
						<strong>{usd(shownWeighted(s))}</strong>
					</dd>
				</div>
				<div>
					<dt>Prazo</dt>
					<dd>{deadlineText(s.age)}</dd>
				</div>
				<div>
					<dt>O que fazer</dt>
					<dd>
						{sit === "esfriando"
							? "Retome o contato antes que ele fique parado."
							: "Avance o negócio esta semana."}
					</dd>
				</div>
			</dl>
			<p className="footnote">
				A chance usa só a idade do negócio. Vendedor, produto e empresa foram
				testados e não mudam a ordem.
			</p>
		</>
	);
}

export function SellerView({
	agent,
	lists,
	curve,
	hasDeals,
	t,
	priceOf,
}: {
	agent: Agent;
	lists: AgentLists;
	curve: readonly BandChance[];
	hasDeals: boolean;
	t: number;
	priceOf: (d: Deal) => number;
}) {
	const [tab, setTab] = useState<Tab>("focus");
	const [sort, setSort] = useState<{ key: string; desc: boolean } | null>(null);
	const [picked, setPicked] = useState<string | null>(null);
	const showAccount = t === REFERENCE_DATE;

	const base: Record<Tab, Row[]> = {
		focus: lists.focus.map((s) => ({
			id: s.deal.id,
			deal: s.deal,
			price: s.price,
			scored: s,
		})),
		review: lists.review.map((s) => ({
			id: s.deal.id,
			deal: s.deal,
			price: s.price,
			scored: s,
		})),
		prospect: lists.prospect.map((d) => ({
			id: d.id,
			deal: d,
			price: priceOf(d),
		})),
	};
	const columns = columnsFor(tab, showAccount);
	const position = new Map(base[tab].map((r, i) => [r.id, i + 1]));
	const sortCol = columns.find((c) => c.key === sort?.key);
	const rows =
		sortCol?.sort && sort
			? [...base[tab]].sort((a, b) => {
					const d =
						(sortCol.sort as (r: Row) => number)(a) -
						(sortCol.sort as (r: Row) => number)(b);
					return (
						(sort.desc ? -d : d) ||
						(position.get(a.id) ?? 0) - (position.get(b.id) ?? 0)
					);
				})
			: base[tab];
	const selected = rows.find((r) => r.id === picked) ?? rows[0];
	const ranks = tab === "focus" ? priceRanks(lists.focus) : undefined;

	const go = (next: Tab) => {
		setTab(next);
		setSort(null);
		setPicked(null);
	};

	const reason = (r: Row) => (
		<Reason
			row={r}
			tab={tab}
			position={position.get(r.id) ?? 0}
			listSize={base[tab].length}
			priceRank={ranks?.get(r.id)}
			band={r.scored ? bandForAge(curve, r.scored.age) : null}
			showAccount={showAccount}
		/>
	);

	const tabs: { key: Tab; label: string }[] = [
		{ key: "focus", label: "Foque agora" },
		{ key: "review", label: "Revisar ou encerrar" },
		{ key: "prospect", label: "Inicie contato" },
	];

	return (
		<>
			<div className="seller-head">
				<h2>{agent.name}</h2>
				<p className="muted">
					Gestor: {agent.manager}. Regional: {agent.regional}.
				</p>
				<p className="rule-line">
					A idade decide a lista e quando o negócio esfria. Dentro da Foque
					agora, a ordem é pelo valor ponderado: preço de lista vezes a chance
					histórica para aquela idade.
				</p>
			</div>
			<div className="workspace">
				<section className="panel" aria-label="Listas do vendedor">
					<div className="tabs" role="tablist">
						{tabs.map((x) => (
							<button
								key={x.key}
								type="button"
								role="tab"
								aria-selected={tab === x.key}
								onClick={() => go(x.key)}
							>
								{x.label}
								<span className="count">({num(base[x.key].length)})</span>
							</button>
						))}
					</div>
					{rows.length === 0 ? (
						<EmptyList
							tab={tab}
							kind={emptyFocus(lists, hasDeals)}
							lists={lists}
							t={t}
							go={go}
						/>
					) : (
						<div className="table-wrap" role="tabpanel">
							<table>
								<thead>
									<tr>
										{columns.map((c) => (
											<th
												key={c.key}
												className={
													[c.numeric ? "num" : "", c.wide ? "wide-only" : ""]
														.join(" ")
														.trim() || undefined
												}
												aria-sort={
													sort?.key === c.key
														? sort.desc
															? "descending"
															: "ascending"
														: undefined
												}
											>
												{c.sort ? (
													<button
														type="button"
														aria-pressed={sort?.key === c.key}
														onClick={() =>
															setSort(
																sort?.key === c.key && sort.desc
																	? { key: c.key, desc: false }
																	: sort?.key === c.key
																		? null
																		: { key: c.key, desc: true },
															)
														}
													>
														{c.label}
													</button>
												) : (
													c.label
												)}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{rows.map((r) => (
										<Fragment key={r.id}>
											<tr
												aria-selected={selected?.id === r.id}
												onClick={() => setPicked(r.id)}
											>
												{columns.map((c) => (
													<td
														key={c.key}
														className={
															[
																c.numeric ? "num" : "",
																c.wide ? "wide-only" : "",
																c.key === "deal" ? "deal-cell" : "",
															]
																.join(" ")
																.trim() || undefined
														}
													>
														{c.key === "deal" ? (
															<button
																type="button"
																className="row-button"
																aria-expanded={selected?.id === r.id}
																onClick={(e) => {
																	e.stopPropagation();
																	setPicked(r.id);
																}}
															>
																{c.cell(r, position.get(r.id) ?? 0)}
															</button>
														) : (
															c.cell(r, position.get(r.id) ?? 0)
														)}
													</td>
												))}
											</tr>
											{selected?.id === r.id && (
												<tr className="detail-row">
													<td colSpan={columns.length}>
														<div className="reason">{reason(r)}</div>
													</td>
												</tr>
											)}
										</Fragment>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
				{selected && (
					<aside className="panel reason" aria-label="Motivo da posição">
						{reason(selected)}
					</aside>
				)}
			</div>
		</>
	);
}

function EmptyList({
	tab,
	kind,
	lists,
	t,
	go,
}: {
	tab: Tab;
	kind: ReturnType<typeof emptyFocus>;
	lists: AgentLists;
	t: number;
	go: (tab: Tab) => void;
}) {
	if (tab === "prospect")
		return (
			<div className="empty">
				<h3>Nenhuma prospecção para mostrar</h3>
				<p>
					{t === REFERENCE_DATE
						? "Este vendedor não tem negócios em prospecção."
						: `A prospecção só aparece na data mais recente (31/12/2017). A base não registra quando cada prospecção começou, então não dá para saber quais já existiam em ${date(t)}.`}
				</p>
			</div>
		);
	if (tab === "review")
		return (
			<div className="empty">
				<h3>Nenhum negócio parado</h3>
				<p>Nada aqui passou de 138 dias em andamento.</p>
			</div>
		);
	if (kind === "sem-negocios")
		return (
			<div className="empty">
				<h3>A base não tem nenhum negócio deste vendedor</h3>
				<p>Cadastre os negócios no CRM para que apareçam aqui.</p>
			</div>
		);
	if (kind === "nada-aberto")
		return (
			<div className="empty">
				<h3>Nenhum negócio em andamento em {date(t)}</h3>
				<p>
					Cadastre novos negócios ou combine com seu gestor quais contas
					abordar.
				</p>
			</div>
		);
	return (
		<div className="empty">
			<h3>Nenhum negócio recente em {date(t)}</h3>
			<p>
				{lists.review.length > 0 &&
					`${num(lists.review.length)} ${lists.review.length === 1 ? "negócio está parado" : "negócios estão parados"} há mais de 138 dias. `}
				{lists.prospect.length > 0 &&
					`${num(lists.prospect.length)} ${lists.prospect.length === 1 ? "negócio está" : "negócios estão"} em prospecção, sem contato. `}
				Comece por eles.
			</p>
			<div className="actions">
				{lists.review.length > 0 && (
					<button type="button" className="action" onClick={() => go("review")}>
						Ver Revisar ou encerrar
					</button>
				)}
				{lists.prospect.length > 0 && (
					<button
						type="button"
						className={lists.review.length > 0 ? "action secondary" : "action"}
						onClick={() => go("prospect")}
					>
						Ver Inicie contato
					</button>
				)}
			</div>
		</div>
	);
}
