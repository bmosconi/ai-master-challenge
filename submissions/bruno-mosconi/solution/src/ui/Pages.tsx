// Entrada ("Quem é você?") e o rascunho do "Como funciona" (a página completa é o incremento 5).

import { shownPercent } from "../core/reason.ts";
import { COOLING_FROM, STALE_AFTER } from "../core/rules.ts";
import comoClaro from "./assets/como-funciona-claro.webp";
import comoEscuro from "./assets/como-funciona-escuro.webp";
import entradaClaro from "./assets/entrada-claro.webp";
import entradaEscuro from "./assets/entrada-escuro.webp";
import { date, initials, plural } from "./format.ts";
import { Icon } from "./Icon.tsx";
import { type DayModel, MANAGERS, PEOPLE } from "./model.ts";
import { TEMP_ICON, TEMP_LABEL } from "./Thermo.tsx";

export interface Person {
	role: "vendedor" | "gestor";
	name: string;
}

function Art({
	light,
	dark,
	alt,
	className = "",
}: {
	light: string;
	dark: string;
	alt: string;
	className?: string;
}) {
	return (
		<picture>
			<source srcSet={dark} media="(prefers-color-scheme: dark)" />
			<img className={`art ${className}`} src={light} alt={alt} />
		</picture>
	);
}

export function EntryView({ onPick }: { onPick: (p: Person) => void }) {
	const regionals = [...new Set(PEOPLE.map((a) => a.regional))].sort();
	const row = (p: Person, sub: string) => (
		<button
			key={`${p.role}-${p.name}`}
			type="button"
			className="person"
			onClick={() => onPick(p)}
		>
			<span className="avatar lg">{initials(p.name)}</span>
			<span className="nm">
				{p.name}
				<span>{sub}</span>
			</span>
			<span className="chev">
				<Icon name="caret-right" />
			</span>
		</button>
	);
	return (
		<section className="entry">
			<Art
				light={entradaClaro}
				dark={entradaEscuro}
				className="entry-art"
				alt="Uma barra de vidro fosco iluminada por dentro, laranja numa ponta e cinza fria na outra."
			/>
			<h1>Quem é você?</h1>
			<p className="lead-sub">
				Escolha seu nome. O app abre na sua semana, com os negócios em que vale
				focar primeiro, e lembra a escolha neste aparelho.
			</p>
			<div className="people">
				<div>
					<h2>Gestor(a)</h2>
					<div className="card">
						{MANAGERS.map((m) =>
							row(
								{ role: "gestor", name: m.name },
								`${m.regional}, equipe de ${plural(m.team, "pessoa", "pessoas")}`,
							),
						)}
					</div>
				</div>
				{regionals.map((r) => (
					<div key={r}>
						<h2>Vendedor(a), regional {r}</h2>
						<div className="card">
							{PEOPLE.filter((a) => a.regional === r)
								.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
								.map((a) =>
									row(
										{ role: "vendedor", name: a.name },
										`Equipe de ${a.manager}`,
									),
								)}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

/** Rascunho do incremento 5: a regra numa frase e a chance por idade na data escolhida. */
export function HowView({ day }: { day: DayModel }) {
	const bands = day.curve.map((c, i) => {
		const to = (day.curve[i + 1]?.from ?? STALE_AFTER + 1) - 1;
		return {
			temp:
				c.from < COOLING_FROM ? ("quente" as const) : ("esfriando" as const),
			age: `${c.from} a ${to} dias`,
			v: shownPercent(c.chance),
		};
	});
	const all = [
		...bands,
		{ temp: "frio" as const, age: `Mais de ${STALE_AFTER} dias`, v: 0 },
	];
	return (
		<section className="how">
			<Art
				light={comoClaro}
				dark={comoEscuro}
				className="how-art"
				alt="Sete placas de vidro fosco em fila, do laranja quente, à esquerda, ao cinza frio, à direita."
			/>
			<h1>Como a lista é feita</h1>
			<p className="lead-sub">
				A idade do negócio diz se ele está quente, esfriando ou frio. O
				potencial, preço de lista vezes a chance de fechar pelo histórico,
				decide a ordem.
			</p>
			<section className="card bands-card">
				<h2>
					De cada 100 negócios que chegaram a cada idade ainda em andamento,
					quantos fecharam venda
				</h2>
				<div className="bands">
					{all.map((b) => (
						<div key={b.age}>
							<span className={`temp t-${b.temp}`}>
								<Icon name={TEMP_ICON[b.temp]} />
								{TEMP_LABEL[b.temp]}
							</span>
							<span className="age">{b.age}</span>
							<span className="v">{b.v}</span>
						</div>
					))}
				</div>
			</section>
			<p className="note center">
				Histórico da base inteira até {date(day.t)}. A página completa, com o
				que foi testado e descartado, entra no incremento 5.
			</p>
		</section>
	);
}
