# O que a análise exploratória mostrou

Achados da análise dos dados que fundamentam a regra do app. A maior parte dos números sai dos scripts de `../solution/analysis/` (consultas SQL e backtest). Os que não têm script (embaralhamento e comparações por valor e por receita) e todos os demais são recalculados de forma independente na revisão inicial do Claude Code.
Cada achado abaixo diz o número, como foi conferido e que decisão ele mudou.

## 1. Os negócios com data somam US$ 3,9 mi a preço de lista, mas o valor ponderado é cerca de US$ 195 mil

| Situação em 31/12/2017 | Negócios | Valor a preço de lista |
|---|---|---|
| No prazo, até 89 dias | 110 | US$ 227.651 |
| Esfriando, 90 a 138 dias | 188 | US$ 465.914 |
| Parado, mais de 138 dias | 1.291 (81% dos negócios com data) | US$ 3.198.664 (82% do valor dos negócios com data) |
| Prospecção (sem datas, fora dos 82%) | 500 | US$ 1.073.986 |

Nenhum negócio da base foi ganho ou perdido depois de 138 dias.
- Conferido com SQL: maior ciclo observado = 138 dias.
- Decisão: D2, lista "Revisar ou encerrar".

## 2. A chance de ganhar cai com a idade do negócio

Coorte de 5.991 negócios iniciados até 15/08/2017 (tempo suficiente para concluir):

| Faixa de idade | Chance de virar venda |
|---|---|
| 0–29 dias | 49,8% |
| 30–59 dias | 46,4% |
| 60–89 dias | 44,0% |
| 90–103 dias | 32,9% |
| 104–119 dias | 21,2% |
| 120–138 dias | 9,1% |
| mais de 138 dias | 0% |

- **O erro que quase entrou:** calcular a chance só com negócios concluídos dá o contrário, uma chance que sobe com a idade (68,7% aos 14 dias, 71,1% aos 90). É viés de sobrevivência.
- Decisão: D5, valor ponderado = chance pela idade × preço.
- **Depois da revisão inicial (G1):** a base só traz os negócios antigos que sobreviveram até a primeira conclusão (01/03/2017). Com a coorte corrigida (D27), a curva em 31/12 é 47,3 · 41,7 · 38,6 · 25,6 · 13,5 · 4,3%. A curva ordena bem, mas como previsão superestima: em 31/08, previa 45% e se realizaram 34%. Por isso a chance aparece como histórico (D28). Fonte: `npm run auditoria`.

## 3. 63% não é a chance de um negócio novo

- 63,15% é a taxa de ganho entre concluídos (IC 95%: 62,0–64,3%).
- De cada 100 negócios iniciados, cerca de 50 são ganhos, 29 perdidos e 22 nunca são concluídos.

## 4. Vendedor, produto, região e setor não mudam a taxa de ganho

| Comparação | p-valor do qui-quadrado |
|---|---|
| Vendedor | 0,264 |
| Gestor | 0,786 |
| Regional | 0,604 |
| Produto | 0,372 |
| Setor | 0,971 |
| Empresa | 0,943 |

- A diferença entre o melhor e o pior vendedor (15,4 p.p.) aparece em 36–38% dos sorteios aleatórios, conforme o número de sorteios.
- Em valor, a diferença é de 23,5 p.p. e aparece em cerca de 41% dos sorteios.
- A receita varia 9,3 vezes entre vendedores, mas acompanha o volume de negócios (Spearman 0,62), não a taxa de ganho (−0,21).
- Decisão: D3, vendedor e produto fora do score.

## 5. O calendário pesa, mas não serve para o score

| Mês do trimestre em que o negócio foi concluído | Taxa de ganho |
|---|---|
| 1º | 49,0% |
| 2º | 54,7% |
| 3º | 80,7% |

- Para um negócio em andamento, ainda não se sabe em que mês ele vai ser concluído. Por isso o padrão fica como contexto, fora da regra.
- O mesmo efeito explica a falsa impressão de que "o não vem rápido e o sim demora".

## 6. Qualidade dos dados

- O nome do produto aparece como "GTXPro" em 1.480 linhas, contra "GTX Pro" no catálogo.
- 1.425 de 2.089 negócios em andamento (68%) não têm empresa. Nenhum negócio concluído está sem empresa, então "sem empresa" denuncia o desfecho e não pode entrar no score.
- Os 500 negócios em prospecção não têm data.
- 5 dos 35 vendedores não têm nenhum negócio.
- Dos 30 com histórico, 9 ficam sem nenhum negócio em andamento recente (até 138 dias) em 31/12/2017: 6 só têm negócios parados e prospecção, e 3 não têm nada aberto. A interface precisa de estados vazios que digam o que fazer.

## 7. A regra simples rende quase o mesmo que machine learning

Backtest com 4 datas de 2017: os 10 primeiros negócios de cada vendedor, receita ganha em até 90 dias.

| Método | Receita capturada |
|---|---|
| Valor ponderado pela idade | 44,4% |
| Situação e preço | 43,2% |
| Só preço | 36,2% |
| Aleatório | 15,4% |

O gradient boosting (`solution/analysis/significancia_ml.py`) capturou 45,0%. Contra o valor ponderado, num teste pareado por vendedor, a diferença foi de +0,6 p.p., com IC 95% de −3,3 a +4,0 e p = 0,74: **não significativa**. O valor ponderado também não ganha de forma significativa da regra "situação e preço" (+1,2 p.p.; p = 0,13). O ganho vem de separar no prazo, esfriando e parado. Fonte: `npm run auditoria` (H3).


