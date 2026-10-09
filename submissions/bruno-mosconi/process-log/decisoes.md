# Registro de decisões

- **Quem decidiu:** sempre uma pessoa ou "orquestrador (IA)", nunca omitido.
- **Evidência:** arquivo, commit, saída de comando ou trecho de export.

## Decisões de partida

Tomadas pelo Bruno antes da etapa do Claude Code. Viram regras no `../AGENTS.md` (seção 7) e são reavaliadas na revisão inicial.

| # | Decisão |
|---|---|
| D0 | Challenge 003 (Lead Scorer) |
| D1 | Data de referência 31/12/2017, com seletor para voltar no tempo |
| D2 | Parado depois de 138 dias; esfriando a partir de 90 |
| D3 | Vendedor e produto fora do score |
| D4 | Prospecting em lista separada ("Inicie contato"), por preço |
| D5 | Score = chance pela idade × preço de lista (valor ponderado), com frase de motivo |
| D6 | Publicar na Vercel |
| D7 | Sem LLM no app |
| D8 | React + Vite + TypeScript, sem servidor |
| D10 | Três agentes: `critico`, `revisor` e `testador-de-uso` |
| D11 | Vocabulário de CRM brasileiro, com "Valor ponderado" e "Concluídos" |
| D12 | Só a skill `frontend-design`, instalada globalmente |
| D13 | Lista "Inicie contato" só em 31/12/2017 |
| D14 | PR "[Submission] Bruno Mosconi — Challenge 003"; submeter até domingo (11/10/2026) à noite |
| D15 | Sem servidor e sem banco; escala provada com evidência e explicada em `../docs/como-escalar.md` |
| D16 | Primeiro passo do Claude Code: revisar todo o material de partida e conhecer todas as regras do exercício |
| D17 | O process log registra só a etapa do Claude Code; não declarar horas |
| D18 | Pasta `submissions/bruno-mosconi` e branch `submission/bruno-mosconi`, com o nome do candidato, como pede o `CONTRIBUTING.md` ("seu-nome") |

(D9 tratava de um material da preparação que não faz parte da entrega.)

## Decisões durante a construção

| # | Data | Decisão | Quem decidiu | Alternativas consideradas | Evidência |
|---|---|---|---|---|---|
| D19 | 09/10/2026 | Página "Como funciona" com a investigação que sustenta o score. Uma página só, em duas camadas: a regra numa tela e a investigação recolhida, em S1–S4. Cada achado diz o que os dados mostraram, como foi conferido e que decisão mudou. A S3 inclui o mês do trimestre: "muda a taxa de ganho, mas não serve para o score". É o incremento 5 e pode ser cortada; a tela do vendedor não pode | Bruno (pedido e aprovação); fundir com "Como funciona" foi proposta do orquestrador (IA) | explorador separado da "Como funciona" (pedido original); D19 antes do incremento 4 | `01-revisao-inicial.md` §4 e §8 (achados 1 e 6 do critico); mensagem de aprovação do plano |
| D1 (ajuste) | 09/10/2026 | O seletor de data oferece só 31/12/2017 e as 4 datas do backtest (30/06, 31/07, 31/08 e 30/09/2017) | Bruno | seletor livre de datas | `01-revisao-inicial.md` §6; aprovação do plano |
| D12 (ajuste) | 09/10/2026 | A interface usa as skills `frontend-design` (direção visual) e `dataviz` (todo gráfico). Gráficos em SVG ou HTML, sem biblioteca. Se as duas conflitarem com o briefing do CLAUDE.md, vale o briefing. Gráfico só em três lugares: (1) barra de números, empilhada com o valor em andamento **a preço de lista**, dividido em no prazo, esfriando e parado; (2) visão do gestor, uma barra empilhada por vendedor, ordenada pelo valor parado; (3) "Como funciona": a chance por faixa (coorte × só concluídos) e a receita capturada por método, **com IC**. Reiterado no G1 (09/10/2026), com o objetivo de uma interface "intuitiva, bonita e sem cara de feita por IA", seguindo as práticas de `docs/benchmark-ux.md`. A lista do vendedor fica em tabela. Cores: neutros, uma cor de destaque, esfriando em âmbar e parado em vermelho, sempre com texto, e as faixas em tons de uma cor só; o validador de paleta da `dataviz` roda e o resultado fica registrado. Portão visual: prints em 1280 e 390 px da tela do vendedor e da visão do gestor, com as referências do benchmark seguidas, antes de fechar o incremento 4. Se apertar, os gráficos do "Como funciona" viram barras na tabela | Bruno | — | mensagem de aprovação do plano |
| D20 | 09/10/2026 | Node 22 ou superior, no lugar do Node 24. **Ajuste da revisão (V6):** `engines: ">=22.18"`, porque o Node só remove os tipos de `.ts` sem flag a partir do 22.18 (`npm run auditoria` roda `.ts` direto) | Bruno; o ajuste para 22.18 foi do orquestrador (IA), a partir do achado do revisor | Node 24 (exigiria instalar); `>=22` | `node --version` = v22.23.2 (P1); `01-revisao-inicial.md`, V6 |
| D21 | 09/10/2026 | Ordem da lista "Revisar ou encerrar": preço (maior primeiro), depois idade (mais antigo primeiro), depois ID | Bruno, sobre a proposta do orquestrador (IA) | — | `01-revisao-inicial.md`, definições pré-registradas; achado 11 do critico |
| D22 | 09/10/2026 | O CA7 passa a dizer: TypeScript e Python precisam concordar; se divergirem, a revisão decide qual está certo e registra o motivo | Bruno | "o TS reproduz os números do Python" (texto antigo) | achado 4 do critico (P13) |
| D23 | 09/10/2026 | Cada função estatística escrita à mão (qui-quadrado, IC, Spearman, bootstrap, troca de sinais) é testada contra o scipy, nos mesmos dados, com tolerância definida | Bruno | testar só contra valores tabelados | aprovação do plano |
| D24 | 09/10/2026 | O viés de sobrevivência da preparação entra em `erros-da-ia.md`, como erro da preparação reproduzido na revisão. Flexibiliza a D17 só neste ponto | Bruno | deixar só na nota do `process-log/README.md` | achado 7 do critico |
| D25 | 09/10/2026 | Ordem: revisão → G1 → incremento 4, já aprovado no G1 → portão visual → incremento 5 (D19). A leitura do problema escrita pelo Bruno fica em `00-leitura-do-problema.md`, com commit próprio | Bruno | D19 antes do incremento 4 | achados 1 e 12 do critico |
| D26 | 09/10/2026 | Origem dos dados conferida: os 5 CSVs de `solution/data/` são idênticos byte a byte aos do zip do Kaggle baixado pelo Bruno. O zip não entra no repositório | Bruno (baixou), orquestrador (conferiu) | registrar a origem como "não verificada" | `01-revisao-inicial.md`, P3 |
| D27 | 09/10/2026 (G1) | **Coorte limpa.** A chance usa só negócios iniciados a partir da primeira conclusão observada até T (01/03/2017), porque a base só traz os negócios antigos que sobreviveram até essa data (H11). Uma data fica disponível se **toda faixa tem IC 95% (Wilson) de no máximo ±5 p.p.**: é a justificativa pedida para o "≥ 1.000 negócios" (o corte cai entre 379 e 1.258). Com essa regra, sobra **uma** foto de backtest (30/09; 31/08 fica fora por ±5,01 p.p.) | Bruno (regra); critério de IC: orquestrador (IA), a pedido do Bruno | **entrada tardia** (o negócio antigo entra na conta a partir da idade que tinha em 01/03/2017): 3 fotos, curva mais alta nas faixas finais. Resultados das duas em `01-revisao-inicial.md`, G1. **A escolha final entre as duas está com o Bruno** | `auditoria-ts.md`, "Regra final (G1)"; `reference.test.ts` |
| D28 | 09/10/2026 (G1) | A chance aparece como histórico, com a frase: "Dos negócios que chegaram a N dias ainda em andamento, X de cada 10 viraram venda." N é o início da faixa. A calibração aparece no "Como funciona" | Bruno | apresentar como probabilidade de fechar | `auditoria-ts.md`, calibração |
| D29 | 09/10/2026 (G1) | **D3, novo argumento.** Vendedor e produto ficam fora do score. Produto não muda nada; vendedor não muda a taxa entre concluídos, mas muda quanto fica parado, e um fator por vendedor não muda a ordem da lista dele. Na visão do gestor, a fração parada por vendedor aparece como **situação do funil, não como ranking de desempenho**, com o aviso de que os dados não separam o efeito do vendedor do efeito da carteira e da região | Bruno | ranking de vendedores | `auditoria-ts.md`, H5 |
| D30 | 09/10/2026 (G1) | **CA3:** o score precisa ganhar de "só preço" no backtest, com IC, calculado com a regra final. A "Foque agora" segue ordenada pelo valor ponderado (D5) **por enquanto**. O Bruno avalia 3 exemplos reais em que o valor ponderado e "situação e preço" divergem, e pode mudar | Bruno | ordenar por "situação e preço" | `01-revisao-inicial.md`, G1 |
| D31 | 09/10/2026 (G1) | **Piso não cortável do CA16:** três tabelas vindas de `src/core`, sem gráfico (curva da coorte × só concluídos; backtest com IC; dimensões com os p-valores entre concluídos e na coorte), mais uma linha no painel de motivo. Gráficos e seletor continuam cortáveis | Bruno, sobre a proposta do critico | página inteira cortável | achado K4 do critico |
| D32 | 09/10/2026 (G1) | O AGENTS §2.2 recebe os trechos literais do enunciado que faltavam; a D3 é reescrita; a tabela do §7 aponta para D18 em diante; o `critico.md` passa a apontar para a seção 7 | Bruno | — | achados P12, K5 e V9 |
