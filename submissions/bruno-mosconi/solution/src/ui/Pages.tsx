// Entrada ("Quem é você?") e a imagem com versão clara e escura.

import entradaClaro from "./assets/entrada-claro.webp";
import entradaEscuro from "./assets/entrada-escuro.webp";
import { initials, plural } from "./format.ts";
import { Icon } from "./Icon.tsx";
import { MANAGERS, PEOPLE } from "./model.ts";

export interface Person {
	role: "vendedor" | "gestor";
	name: string;
}

export function Art({
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
