import { useMemo, useState } from "react";
import { availableDates, funnelAt, teamStatus } from "../core/analysis.ts";
import { priceOf } from "../core/data.ts";
import { agentLists, chanceCurve, REFERENCE_DATE } from "../core/rules.ts";
import { dataset as ds } from "./dataset.ts";
import { FunnelSummary } from "./Funnel.tsx";
import { date } from "./format.ts";
import { SellerView } from "./SellerView.tsx";
import { TeamView } from "./TeamView.tsx";

const DATES = availableDates(ds);
const AGENTS = new Map(ds.agents.map((a) => [a.name, a]));
const WITH_DEALS = new Set(ds.deals.map((d) => d.agent));
const sorted = (xs: Iterable<string>) =>
	[...new Set(xs)].sort((a, b) => a.localeCompare(b, "pt-BR"));

export function App() {
	const [t, setT] = useState(REFERENCE_DATE);
	const [regional, setRegional] = useState("");
	const [manager, setManager] = useState("");
	const [agent, setAgent] = useState("");

	const curve = useMemo(() => chanceCurve(ds.deals, t), [t]);
	const inRegional = ds.agents.filter(
		(a) => !regional || a.regional === regional,
	);
	const inManager = inRegional.filter((a) => !manager || a.manager === manager);
	const scope = agent ? inManager.filter((a) => a.name === agent) : inManager;
	const scopeNames = scope.map((a) => a.name);
	const funnel = funnelAt(ds, t, curve, new Set(scopeNames));
	const current = agent ? AGENTS.get(agent) : undefined;

	const pickRegional = (v: string) => {
		setRegional(v);
		setManager("");
		setAgent("");
	};
	const pickManager = (v: string) => {
		setManager(v);
		setAgent("");
	};
	const pickAgent = (v: string) => {
		const a = AGENTS.get(v);
		if (a) {
			setRegional(a.regional);
			setManager(a.manager);
		}
		setAgent(v);
	};
	const clear = () => pickRegional("");

	return (
		<>
			<header className="top">
				<h1>Onde focar</h1>
				<div className="field">
					<label htmlFor="f-data">Dados de</label>
					<select
						id="f-data"
						value={t}
						onChange={(e) => setT(Number(e.target.value))}
					>
						{DATES.map(({ t: d, available }) => (
							<option key={d} value={d} disabled={!available}>
								{date(d)}
								{d === REFERENCE_DATE ? " (mais recente)" : ""}
								{available ? "" : ": histórico insuficiente"}
							</option>
						))}
					</select>
				</div>
				<div className="filters">
					<div className="field">
						<label htmlFor="f-regional">Regional</label>
						<select
							id="f-regional"
							value={regional}
							onChange={(e) => pickRegional(e.target.value)}
						>
							<option value="">Todas</option>
							{sorted(ds.agents.map((a) => a.regional)).map((r) => (
								<option key={r}>{r}</option>
							))}
						</select>
					</div>
					<div className="field">
						<label htmlFor="f-gestor">Gestor</label>
						<select
							id="f-gestor"
							value={manager}
							onChange={(e) => pickManager(e.target.value)}
						>
							<option value="">Todos</option>
							{sorted(inRegional.map((a) => a.manager)).map((m) => (
								<option key={m}>{m}</option>
							))}
						</select>
					</div>
					<div className="field">
						<label htmlFor="f-vendedor">Vendedor</label>
						<select
							id="f-vendedor"
							value={agent}
							onChange={(e) => pickAgent(e.target.value)}
						>
							<option value="">Todos</option>
							{sorted(inManager.map((a) => a.name)).map((n) => (
								<option key={n}>{n}</option>
							))}
						</select>
					</div>
					{(regional || manager || agent) && (
						<button type="button" className="link-button" onClick={clear}>
							Limpar filtros
						</button>
					)}
				</div>
				{t !== REFERENCE_DATE && (
					<p className="past-note">
						Você está vendo o funil como estava em {date(t)}: as chances usam só
						o que se sabia nessa data. Empresa e prospecção ficam ocultas porque
						revelariam o que aconteceu depois.
					</p>
				)}
			</header>
			<main>
				<FunnelSummary
					slices={funnel.slices}
					prospecting={funnel.prospecting}
					showProspecting={t === REFERENCE_DATE}
				/>
				{current ? (
					<SellerView
						key={`${current.name}-${t}`}
						agent={current}
						lists={agentLists(ds, t, current.name, curve)}
						curve={curve}
						hasDeals={WITH_DEALS.has(current.name)}
						t={t}
						priceOf={(d) => priceOf(ds, d)}
					/>
				) : (
					<TeamView
						status={teamStatus(ds, t, scopeNames, curve)}
						agents={AGENTS}
						hasDeals={(a) => WITH_DEALS.has(a)}
						t={t}
						onPick={pickAgent}
					/>
				)}
			</main>
		</>
	);
}
