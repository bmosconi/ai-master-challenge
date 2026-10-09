// Visão do gestor (D29): a situação do funil de cada vendedor. É retrato da carteira, não ranking.

import type { AgentStatus } from "../core/analysis.ts";
import type { Agent } from "../core/data.ts";
import { StackBar } from "./Funnel.tsx";
import { date, num, usdShort } from "./format.ts";

const totalOf = (a: AgentStatus) =>
	a.slices["no-prazo"].listPrice +
	a.slices.esfriando.listPrice +
	a.slices.parado.listPrice;

export function TeamView({
	status,
	agents,
	hasDeals,
	t,
	onPick,
}: {
	status: AgentStatus[];
	agents: Map<string, Agent>;
	hasDeals: (agent: string) => boolean;
	t: number;
	onPick: (agent: string) => void;
}) {
	const active = status.filter((a) => a.open > 0);
	const inactive = status.filter((a) => a.open === 0);
	return (
		<section className="panel team" aria-labelledby="team-title">
			<div className="section-head">
				<h2 id="team-title">Situação do funil por vendedor</h2>
				<p>
					Em primeiro, quem tem mais valor parado para revisar. É um retrato da
					carteira, não um ranking de desempenho: os dados não separam o efeito
					do vendedor do efeito da carteira e da região. Escolha um vendedor
					para ver a lista dele.
				</p>
			</div>
			{active.length > 0 && (
				<div className="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Vendedor</th>
								<th className="wide-only">Gestor</th>
								<th className="wide-only">Situação a preço de lista</th>
								<th className="num wide-only">Em andamento</th>
								<th className="num wide-only">Negócios</th>
								<th className="num">Parado (% do valor)</th>
								<th className="num">Foque agora</th>
							</tr>
						</thead>
						<tbody>
							{active.map((a) => {
								const total = totalOf(a);
								const share = Math.floor(
									(a.slices.parado.listPrice / total) * 100,
								);
								return (
									<tr key={a.agent} onClick={() => onPick(a.agent)}>
										<td>
											<button
												type="button"
												className="row-button"
												onClick={(e) => {
													e.stopPropagation();
													onPick(a.agent);
												}}
											>
												{a.agent}
											</button>
										</td>
										<td className="wide-only">
											{agents.get(a.agent)?.manager}
										</td>
										<td className="wide-only">
											<StackBar slices={a.slices} small />
										</td>
										<td className="num wide-only">{usdShort(total)}</td>
										<td className="num wide-only">{num(a.open)}</td>
										<td className="num">
											{usdShort(a.slices.parado.listPrice)}{" "}
											<span className="muted">({share}%)</span>
										</td>
										<td className="num">
											{a.focus > 0 ? (
												num(a.focus)
											) : (
												<span className="badge badge-neutral">vazia</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
			{inactive.length > 0 && (
				<div className="inactive">
					<h3>Sem negócio em andamento em {date(t)}</h3>
					<ul>
						{inactive.map((a) => (
							<li key={a.agent}>
								<button
									type="button"
									className="link-button"
									onClick={() => onPick(a.agent)}
								>
									{a.agent}
								</button>
								<span className="badge badge-neutral">
									{!hasDeals(a.agent)
										? "nenhum negócio na base"
										: a.prospecting > 0
											? `${num(a.prospecting)} em prospecção`
											: "nada em andamento"}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</section>
	);
}
