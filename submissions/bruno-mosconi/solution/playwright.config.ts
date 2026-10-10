import { defineConfig } from "@playwright/test";

// Roda contra o build de produção, como o avaliador veria.
export default defineConfig({
	testDir: "e2e",
	testMatch: /.*\.pw\.ts/,
	// Sem movimento nos testes: a primeira abertura e as transições não atrapalham as leituras.
	use: {
		baseURL: "http://localhost:4173",
		locale: "pt-BR",
		reducedMotion: "reduce",
	},
	webServer: {
		command: "npm run build && npm run preview -- --port 4173 --strictPort",
		url: "http://localhost:4173",
		reuseExistingServer: false,
	},
});
