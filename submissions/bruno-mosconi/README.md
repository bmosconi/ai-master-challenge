# Submissão — Bruno Mosconi — Challenge 003

> Esqueleto no formato do template oficial. Será completado na implementação (critério CA11 em `docs/plano-e-matriz.md`).

## Sobre mim

- **Nome:** Bruno Mosconi
- **LinkedIn:** https://www.linkedin.com/in/bruno-mosconi
- **Challenge escolhido:** 003 — Lead Scorer

---

## Executive Summary

[[PREENCHER ao final: 3–5 frases sobre o que foi construído, o que os dados mostraram e a principal recomendação. Sugestão de núcleo: os 1.589 negócios com data somam US$ 3,9 mi a preço de lista, mas o valor ponderado é cerca de US$ 183 mil, porque 82% desse valor está parado há mais de 138 dias; a ferramenta ordena cada vendedor pelo valor ponderado e explica cada posição numa frase.]]

---

## Solução

- **App publicado:** [[PREENCHER: URL da Vercel]]
- **Código:** `solution/`

### Abordagem

Antes de construir, todo o material de partida foi revisado e os números foram recalculados de forma independente (`process-log/01-revisao-inicial.md`). A regra de priorização vem da análise dos dados (`docs/analise-exploratoria.md`) e de um backtest com seis métodos.

### Resultados / Findings

[[PREENCHER: prints do app, 2–3 exemplos reais de saída (negócio, chance, valor ponderado, frase de motivo) e checagens de sanidade]]

### Lógica do score

[[PREENCHER: fórmula, faixas de idade, listas, o que foi testado e descartado (vendedor, produto, gestor, regional, setor, empresa), com p-valores e backtest]]

**Validação no passado, com duas coortes.** A regra foi testada em fotos antigas do funil: em cada data, o app só usa o que se sabia naquele dia. As duas formas de tratar o início cortado da base chegam à mesma conclusão: o valor ponderado capta mais receita que ordenar por preço.

| Coorte | Fotos com histórico suficiente | Valor ponderado − só preço |
|---|---|---|
| Entrada tardia (regra do app) | 31/07, 31/08 e 30/09/2017 | +7,66 p.p. (IC 95% de 3,49 a 12,62) |
| Limpa (sensibilidade) | só 30/09/2017 | +18,69 p.p. (IC 95% de 12,28 a 25,57) |

Fonte: `npm run auditoria`, seção "Regra final (G1)".

### Setup

[[PREENCHER: Node 22.18 ou superior, `npm ci`, `npm run dev`, `npm run check`, `npm run auditoria`, URL]]

### Recomendações

[[PREENCHER]]

### Limitações e como escalar

- **Hipótese da entrada tardia.** Negócios iniciados antes de março de 2017 só estão na base se ainda estavam abertos em 01/03/2017; por isso entram na conta a partir da idade que tinham nessa data. A hipótese é que o corte foi exatamente esse: nenhuma conclusão aparece antes de 01/03/2017, e os inícios sobem de 7 para cerca de 800 por mês. Se ela não valer, a coorte limpa, que não depende dela, chega à mesma conclusão (tabela acima).

[[PREENCHER: o resto do que não faz. Resumo de "Como escalar" em 5–8 linhas, apontando para `docs/como-escalar.md`.]]

---

## Process Log — Como usei IA

O detalhamento está em `process-log/` (comece pelo `README.md` da pasta).

### Ferramentas usadas

| Ferramenta | Para que usou |
|---|---|
| Claude Code no Cursor (Opus 5.5 e Sonnet 5.5) | Revisão inicial, implementação, testes, revisões, testes de uso, deploy |
| Skill `frontend-design` | Direção visual da interface |

Antes desta etapa, houve uma preparação com o Claude (Cowork) como assistente. Ela não faz parte do processo registrado; ver a nota em `process-log/README.md`.

### Workflow

[[PREENCHER ao final, a partir dos commits e de `process-log/`. A leitura do problema (`process-log/00-leitura-do-problema.md`) não entra como previsão dos resultados: as hipóteses vieram do material de partida. Contar o que a revisão confirmou e o que corrigiu (o vendedor não muda a taxa de ganho, mas muda quanto do funil fica parado).]]

### Onde a IA errou e como corrigi

Ver `process-log/erros-da-ia.md`.

### O que eu adicionei que a IA sozinha não faria

[[PREENCHER pelo Bruno, nas suas palavras]]

---

## Evidências

- [ ] Screenshots (`process-log/screenshots/`)
- [ ] Chat exports (`process-log/chat-exports/`)
- [ ] Git history
- [x] Outro: scripts de análise reproduzíveis (`solution/analysis/`)

---

_Submissão enviada em: [[PREENCHER]]_
