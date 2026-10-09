# Plano, critérios de aceite e matriz de rastreabilidade

**Fontes dos requisitos:**
- enunciado: `challenges/build-003-lead-scorer/README.md` (R);
- `README.md` da raiz (P, processo seletivo);
- `CONTRIBUTING.md` (C);
- `submission-guide.md` (G);
- decisões do Bruno, D1–D17 (`AGENTS.md`, seção 7, e `process-log/decisoes.md`).

O resumo completo das regras do exercício está em `AGENTS.md`, seção 2.

**Prazo:** domingo, 11/10/2026, à noite.

## 1. Critérios de aceite

| ID | Critério | Origem |
|---|---|---|
| CA0 | **Revisão completa antes de construir:** regras, dados (recalculados de forma independente), código e documentação revisados; resultado em `process-log/01-revisao-inicial.md`; erros confirmados registrados. | D16; P "entendeu o problema antes de executar"; G "evidência de verificação" |
| CA1 | Roda seguindo o README: `npm ci`, `npm run dev` e `npm run build` funcionam com Node 24. A URL pública abre a mesma versão. | R "precisa rodar"; R Setup; D6 |
| CA2 | Usa as 4 tabelas originais (mais `metadata.csv`), versionadas sem alteração (hash SHA-256 conferido em teste). Contagens batem: 8.800 negócios; 4.238 / 2.473 / 1.589 / 500; 35 vendedores; 7 produtos; 85 empresas. | R "dados reais" |
| CA3 | O score vai além do valor: valor ponderado = chance pela idade (coorte, sem viés de sobrevivência) × preço de lista. Um teste mostra que a ordem difere da ordem só por preço. | R "não é só ordenar por valor"; D5 |
| CA4 | Cada negócio mostra o motivo numa frase ("De cada 10 negócios assim, X viraram venda"), com preço e valor ponderado. Frase e score vêm do mesmo cálculo (teste). | R "entender por quê"; R "Explainability ganha"; D5 |
| CA5 | Filtros regional → gestor → vendedor. Três listas: "Foque agora" (selo "Esfriando" a partir de 90 dias), "Revisar ou encerrar" (mais de 138 dias) e "Inicie contato" (Prospecting por preço, só em 31/12/2017). Vendedor sem negócios ou sem negócios recentes vê um estado vazio que diz o que fazer. | R bônus filtros; R "segunda de manhã"; D2; D4; D13 |
| CA6 | Data de referência padrão 31/12/2017. O seletor volta no tempo e reconstrói o funil só com o que se sabia na data. Teste anti-vazamento: mudar desfechos posteriores a T não altera o resultado em T. Datas sem histórico suficiente ficam bloqueadas, com explicação. | D1 |
| CA7 | `npm run backtest` reproduz a tabela de referência (44,41% · 43,35% · 40,10% · 36,17% · 32,23% · 15,40%), conferida contra a implementação independente em Python. | R "o scoring faz sentido?"; G "zero evidência de verificação" é fraqueza |
| CA8 | Vendedor, produto, gestor, regional, setor e empresa ficam fora do score. A tela "Como funciona" mostra o que foi testado e descartado, com p-valores e backtest. | R "usa as features certas?"; D3 |
| CA9 | Sem servidor, sem banco, sem LLM, sem chamada de rede em tempo de execução. | D7; D8; D15 |
| CA10 | Código mantível e pronto para crescer: TypeScript estrito; núcleo puro separado da UI; interface `DataSource` com dois adaptadores (CSV e JSON) que dão o mesmo resultado; testes do núcleo; lint e formatação. `npm run check` verde. `npm run bench` mede o núcleo com os dados multiplicados por 100. | R "código limpo"; D15 |
| CA11 | README no template, com: Setup; Lógica (fórmula e faixas); validações; 2–3 exemplos reais de saída; checagens de sanidade (distribuição por lista); Limitações; resumo de "Como escalar". | R Documentação; C; G "formato da solução" |
| CA12 | Process log da etapa do Claude Code: nota curta sobre a preparação; ferramentas; revisão inicial (leitura do problema antes de construir); decisões; erros da IA e correções; o que o Bruno adicionou; número de iterações (sem horas); prints; exports. | P; R; G "o que queremos ver no process log"; D17 |
| CA13 | O PR só altera `submissions/bruno-mosconi/` (checado por comando). Título `[Submission] Bruno Mosconi — Challenge 003`. Um PR. Sem chaves, arquivos de sistema ou artefatos derivados. | C |
| CA14 | Um vendedor não técnico entende: vocabulário de CRM brasileiro, moeda em US$, legível em 1280 px e 390 px. O testador de uso cumpre as tarefas das três personas. | R "vendedor consegue usar"; R "ajuda a tomar decisão"; D11 |
| CA15 | `docs/como-escalar.md` completo: o que existe e foi medido (números de `npm run bench` preenchidos); o que muda com volume, frescor, usuários e ações; arquitetura em três fases; o que não muda; riscos e controles. O README resume e aponta para ele. | R Limitações ("o que precisaria pra escalar"); D15 |

## 2. Incrementos e agenda

A agenda é por dia. Não se declaram horas (D17); os commits registram a sequência.

| # | Quando | Incremento | Agentes | Pronto quando |
|---|---|---|---|---|
| 0 | sexta | Fork, clone, branch, pasta, setup do Claude Code e validação (seção 4) | — | todos os checks da seção 4 passam |
| 0b | sexta | **Revisão completa** (`AGENTS.md`, seção 8): regras, recálculo independente dos números, código, documentação | critico, revisor | CA0; resumo mostrado ao Bruno |
| 1 | sexta/sábado | Projeto Vite + TS + Vitest + Biome; dados em `solution/data/`; leitura, normalização e `DataSource` com testes de contagem | critico, revisor | CA2, `npm run check` verde |
| 2 | sábado | Núcleo: funil na data T, coorte, faixas, valor ponderado, frase, listas; testes com números de referência e anti-vazamento | critico, revisor | CA3, CA4, CA6 (núcleo), CA8 (dados) |
| 3 | sábado | Backtest em TS, `golden.json` vindo dos scripts Python, segundo adaptador (JSON), `npm run bench` | revisor | CA7, CA10 |
| 4 | sábado | Interface do vendedor e do gestor: filtros, barra de números, três listas, painel de motivo, seletor de data, estados vazios | critico, revisor, testador-de-uso | CA5, CA6 (tela), CA14 |
| 5 | sábado/domingo | "Como funciona": método, o que testamos e descartamos, limitações | revisor, testador-de-uso | CA8, CA9 |
| 6 | domingo | Revisão de segurança, correções, deploy na Vercel (com autorização) e teste contra a URL | revisor, testador-de-uso | CA1 |
| 7 | domingo | README, `docs/como-escalar.md` com as medições, process log, prints finais | revisor | CA11, CA12, CA15 |
| 8 | domingo | Banca simulada, checagem do PR, abertura do PR (com autorização) | critico, revisor | CA13 |

**Se o tempo apertar, cortar nesta ordem:**
1. O seletor de data passa a oferecer só as 4 datas do backtest.
2. O layout de celular fica com uma lista simples.

**Não pode ser cortado:** CA0–CA5, CA7, CA11–CA13, CA15.

## 3. Matriz requisito → artefato → validação → evidência

| Requisito | Artefato | Validação | Evidência no PR |
|---|---|---|---|
| CA0 Revisão | `process-log/01-revisao-inicial.md` | recálculo independente; achados reproduzidos | relatório + commit de correções |
| CA1 Rodar | `solution/package.json`, README Setup | clone limpo + comandos do README; abrir a URL | saída dos comandos; link Vercel; print |
| CA2 Dados reais | `solution/data/*`, `src/core/data-source.ts` | teste de hash e contagens | saída do `npm run check` |
| CA3 Score | `src/core/score.ts` | teste com números de 31/12/2017; teste "difere de só preço" | testes |
| CA4 Motivo | `src/core/reason.ts`, painel de motivo | teste frase = cálculo | teste + print |
| CA5 Listas e filtros | `src/ui/*` | testes do núcleo das listas + `npm run e2e` | prints do testador |
| CA6 Voltar no tempo | `src/core/snapshot.ts`, seletor | teste anti-vazamento | teste |
| CA7 Backtest | `src/core/backtest.ts`, `analysis/*.py`, `golden.json` | TS = Python nos 6 métodos | saída do `npm run backtest` |
| CA8 Descartados | "Como funciona", `docs/analise-exploratoria.md` | revisor confere números com a análise | print + texto |
| CA9 Sem rede | build estático | revisor procura `fetch` e URLs | parecer |
| CA10 Código e escala | `src/core` vs `src/ui`, `DataSource` (CSV e JSON), Biome, TS estrito, `bench` | `npm run check`; `npm run bench`; revisor | saídas + parecer |
| CA11 README | `README.md` | critico (banca simulada) + leitura do Bruno | arquivo |
| CA12 Process log | `process-log/*` | revisor (dados pessoais) + critico | arquivos |
| CA13 Escopo do PR | branch `submission/bruno-mosconi`, `tools/adicionar-ao-git.sh` | travas do script a cada commit; `git diff --name-only upstream/main...HEAD` só lista a pasta | saída do comando |
| CA14 Entendível | textos da UI | testador-de-uso com 3 personas, 1280 e 390 px | prints + relatório |
| CA15 Como escalar | `docs/como-escalar.md`, resumo no README | critico confere se cada afirmação de "o que existe" tem prova; números do `bench` preenchidos | arquivo |

## 4. Incremento 0: aplicar e validar o setup

**Git** (feito pelo Bruno; o fork fica público no GitHub):
1. Fork de `Gestao-Quatro-Ponto-Zero/ai-master-challenge` para a conta `bmosconi`.
2. `mkdir -p ~/Projetos && cd ~/Projetos && git clone https://github.com/bmosconi/ai-master-challenge.git`. Pasta pessoal, fora das pastas de projetos da empresa.
3. `cd ~/Projetos/ai-master-challenge`.
4. `git remote add upstream https://github.com/Gestao-Quatro-Ponto-Zero/ai-master-challenge.git`.
5. `git config user.name "Bruno Mosconi"` e `git config user.email "<e-mail pessoal ou noreply do GitHub>"`. A configuração vale só neste repositório; os commits são públicos e não devem levar e-mail da empresa.
6. `git checkout -b submission/bruno-mosconi`.
7. Copiar a pasta `submissions/bruno-mosconi` do zip para dentro do clone.
8. `echo ".claude/settings.local.json" >> .git/info/exclude`. O Claude Code grava esse arquivo local na raiz do repositório quando a sessão abre numa subpasta.
9. `sh submissions/bruno-mosconi/tools/adicionar-ao-git.sh`. Não use `git add -f submissions/bruno-mosconi`, que levaria `node_modules/` e `.env` junto.
10. `git commit -m "chore: setup do Claude Code e material de partida"`.
11. Nada de `git push` até o Bruno decidir publicar.

**Skill de interface** (uma vez, no nível do usuário):
- Rode `/plugin install frontend-design@claude-plugins-official`.
- Se o marketplace não aparecer, rode antes `/plugin marketplace add anthropics/claude-plugins-official`.

**Claude Code** (abrir o Cursor na pasta `submissions/bruno-mosconi`, não na raiz):

| Check | Como | Esperado |
|---|---|---|
| Hook testado | `node --test .claude/hooks/guard-pasta.test.mjs` | 10 testes passando |
| Confiança no workspace | aceitar o diálogo ao abrir | permissões do projeto ativas |
| Configuração carregada | `/status` | "Setting sources" inclui as configurações do projeto; cwd termina em `submissions/bruno-mosconi` |
| Instruções carregadas | `/memory` | `CLAUDE.md` da pasta listado; o conteúdo do `AGENTS.md` aparece via import |
| Agentes | `/agents` | `critico` e `revisor` (Opus 5.5), `testador-de-uso` (Sonnet 5.5) |
| Hook registrado | `/hooks` | PreToolUse com `guard-pasta.mjs` |
| Hook bloqueia | pedir: "crie o arquivo ../../teste-guard.txt" | bloqueado com a mensagem do guard |
| Hook permite | pedir: "crie solution/teste-guard.txt" (apagar depois) | criado |
| Skill | `/plugin` | `frontend-design` instalada e habilitada |
| Modelo real dos agentes | acionar o `critico` com um plano curto; depois procurar `"model"` no transcript do subagente em `~/.claude/projects/` | `claude-opus-5-5` |
| MCP | `/mcp` | desligar neste projeto os servidores que não servem ao desafio |

Tire print de cada check e salve em `process-log/screenshots/01-setup/`.
