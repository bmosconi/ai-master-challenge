# Auditoria dos números do material de partida (TypeScript)

Gerado por `npm run auditoria` a partir de `solution/data/`. Data de referência: 31/12/2017. Faixas: 0, 30, 60, 90, 104, 120.

| ID | Afirmação | Declarado | Recalculado | Status |
|---|---|---|---|---|
| N01 | vendedores; oportunidades | 35; ~8.800 | 35; 8.800 | confere |
| N02 | close_value = 0 nos perdidos; vazio nos abertos | 2.473 de 2.473; vazio | 2.473 de 2.473; vazio em 2.089 de 2.089 | confere |
| N03 | negócios; empresas; produtos; vendedores | 8.800; 85; 7; 35 | 8.800; 85; 7; 35 | confere |
| N04 | Won · Lost · Engaging · Prospecting | 4.238 · 2.473 · 1.589 · 500 | 4.238 · 2.473 · 1.589 · 500 | confere |
| N05 | linhas com "GTXPro" | 1.480 | 1.480 | confere |
| N06 | Prospecting com alguma data | 0 | 0 | confere |
| N07 | em andamento sem empresa; concluídos sem empresa | 1.425 de 2.089; 0 | 1.425 de 2.089; 0 | confere |
| N08 | primeira data; última; 1º concluído; maior ciclo | 20/10/2016; 31/12/2017; 01/03/2017; 138 | 20/10/2016; 31/12/2017; 01/03/2017; 138 (ganhos 138, perdidos 138) | confere |
| N09 | vendedores sem nenhum negócio | 5: Carl Lin, Carol Thompson, Elizabeth Anderson, Mei-Mei Johns, Natalya Ivanova | 5: Carl Lin, Carol Thompson, Elizabeth Anderson, Mei-Mei Johns, Natalya Ivanova | confere |
| N10 | sem negócio recente em 31/12 (dos com histórico): só parados/prospecção; nada aberto | 9 de 30: 6; 3 | 9 de 30: 6; 3 | confere |
| N12 | chance por faixa 0·30·60·90·104·120 | 49,8 · 46,4 · 44,0 · 32,9 · 21,2 · 9,1 | 49,8 · 46,4 · 44,2 · 33,6 · 22,1 · 9,9 | **diverge** |
| N12 | coorte: negócios; último início | 5.991; 15/08/2017 | 5.991; 15/08/2017 | confere |
| N13 | só concluídos: aos 14 e aos 90 dias | 68,7% · 71,1% | 68,6% · 71,3% | **diverge** |
| N14 | no prazo · esfriando · parados (dos Engaging) | 110 · 188 · 1.291 | 110 · 188 · 1.291 | confere |
| N15 | preço de lista dos Engaging; % parado (do valor); prospecção | US$ 3,89 mi; 82%; US$ 1,07 mi | US$ 3,89 mi; 82%; US$ 1,07 mi | confere |
| N16 | valor ponderado (no prazo + esfriando) | ≈ US$ 195 mil | US$ 199.308 | confere |
| N20 | US$ no prazo · esfriando · parado · prospecção | 227.651 · 465.914 · 3.198.664 · 1.073.986 | 227.651 · 465.914 · 3.198.664 · 1.073.986 | confere |
| N20 | "82% dos negócios com data" (P5): % dos negócios × % do valor | 82% dos negócios | 81,2% dos negócios; 82,2% do valor | **diverge** |
| N21 | nenhum concluído depois de 138 dias | 0 | 0 | confere |
| N24 | taxa de ganho entre concluídos; IC 95% | 63,15%; 62,0–64,3% | 63,15%; Wilson 62,0–64,3% (normal 62,0–64,3%) | confere |
| N25 | de cada 100 iniciados: ganhos · perdidos · nunca concluídos | 50 · 29 · 22 | 49,8 · 28,5 · 21,7 (coorte de 5.991) | confere |
| N26 | p do qui-quadrado: vendedor | 0,264 | 0,264 (χ² = 33,35, 29 g.l.) | confere |
| N26 | p do qui-quadrado: gestor | 0,786 | 0,786 (χ² = 2,44, 5 g.l.) | confere |
| N26 | p do qui-quadrado: regional | 0,604 | 0,604 (χ² = 1,01, 2 g.l.) | confere |
| N26 | p do qui-quadrado: produto | 0,372 | 0,372 (χ² = 6,48, 6 g.l.) | confere |
| N26 | p do qui-quadrado: setor | 0,971 | 0,971 (χ² = 2,83, 9 g.l.) | confere |
| N26 | p do qui-quadrado: empresa | 0,943 | 0,943 (χ² = 64,55, 84 g.l.) | confere |
| N27 | melhor − pior vendedor; % dos sorteios ≥ | 15,4 p.p.; 36–38% | 15,4 p.p.; 38,1% (10.000 sorteios, semente 20171231) | confere |
| N28 | em valor: diferença; % dos sorteios ≥ | 23,5 p.p.; ~41% | 23,5 p.p.; 42,3% | confere |
| N29 | receita: maior ÷ menor; Spearman com volume; com taxa | 9,3×; 0,62; −0,21 | 9,3×; 0,62; -0,21 | confere |
| N30 | taxa por mês do trimestre: 1º · 2º · 3º | 49,0 · 54,7 · 80,7 | 49,0 · 54,7 · 80,7 | confere |
| N17 | backtest: valor ponderado | 44,41% | 44,25% | **diverge** |
| N17 | backtest: faixas e preço | 43,35% | 32,69% | **diverge** |
| N17 | backtest: preço sem parados | 40,10% | 40,10% | confere |
| N17 | backtest: só preço | 36,17% | 36,17% | confere |
| N17 | backtest: chance só com concluídos | 32,23% | 38,08% | **diverge** |
| N17 | backtest: aleatório | 15,40% | 15,40% | confere |
| N39 | métodos no backtest | 6 | 6 | confere |
| N18 | ML 45,0% × valor ponderado 44,6% (exploratório) | 45,0 · 44,6 | a conferir depois do C1 (exige ler o Python) | pendente |
| N40 | "21 consultas"; Python 3.13 | 21; 3.13 | a conferir depois do C1 | pendente |

Conferem: 32. Divergem: 6. Pendentes: 2.

## Hipóteses

### H1, H2, H11 e sensibilidade: o backtest muda com as escolhas?

| Variante | valor ponderado | faixas e preço | preço sem parados | só preço | chance só com concluídos | aleatório |
|---|---|---|---|---|---|---|
| pré-registrado (faixas do AGENTS, corte 138, ≥) | 44,25% | 32,69% | 40,10% | 36,17% | 38,08% | 15,40% |
| H1: faixas de 30 em 30 dias | 43,81% | 32,69% | 40,10% | 36,17% | 38,07% | 15,40% |
| H1: chance por dia exato | 44,63% | 23,23% | 40,10% | 36,17% | 38,65% | 15,40% |
| H2: corte = maior ciclo observado em T | 44,25% | 32,69% | 40,10% | 36,17% | 38,08% | 15,40% |
| sensibilidade: em risco com > | 44,41% | 32,69% | 40,10% | 36,17% | 38,08% | 15,40% |
| H11: só as fotos de 31/08 e 30/09 | 42,97% | 36,13% | 36,70% | 31,59% | 33,67% | 14,17% |
| H11: curva só com iniciados a partir de 01/03/2017 | 36,02% | 33,57% | 40,10% | 36,17% | 38,08% | 15,40% |

H2: maior ciclo observado em cada foto: 30/06/2017 = 138; 31/07/2017 = 138; 31/08/2017 = 138; 30/09/2017 = 138; em 31/12/2017 = 138.
H11: maior ciclo entre os iniciados a partir de 01/03/2017 = 138 (5.739 concluídos).
H11: iniciados em 2016 = 358; em jan–fev/2017 = 827.
H11: curva em 31/12 só com iniciados a partir de 01/03/2017: 0: 47,3% (4.806) · 30: 41,6% (2.901) · 60: 38,8% (2.588) · 90: 26,1% (1.765) · 104: 14,1% (1.395) · 120: 4,9% (1.173).
Curva pré-registrada em 31/12, com n em risco: 0: 49,8% (5.991) · 30: 46,4% (4.025) · 60: 44,2% (3.649) · 90: 33,6% (2.508) · 104: 22,1% (1.913) · 120: 9,9% (1.502).
Sensibilidade (>): 0: 49,8% · 30: 46,4% · 60: 44,0% · 90: 32,9% · 104: 21,2% · 120: 9,1%.
Sensibilidade (>) nos números que divergem: N13 só concluídos aos 14 e 90 dias = 68,66% · 71,13%; N16 valor ponderado = US$ 195.380; N17 valor ponderado = 44,41%.
H11: coorte de cada foto com a curva só de iniciados a partir de 01/03/2017: 30/06/2017 = 0; 31/07/2017 = 379; 31/08/2017 = 1.258; 30/09/2017 = 2.022 (coorte vazia = chance 0 para todos = ordem pelo ID).

H11: inícios e conclusões por mês

| Mês | Inícios | Ganhos concluídos | Perdidos concluídos |
|---|---|---|---|
| 2016-10 | 7 | 0 | 0 |
| 2016-11 | 115 | 0 | 0 |
| 2016-12 | 236 | 0 | 0 |
| 2017-01 | 312 | 0 | 0 |
| 2017-02 | 515 | 0 | 0 |
| 2017-03 | 792 | 531 | 116 |
| 2017-04 | 874 | 285 | 301 |
| 2017-05 | 722 | 438 | 367 |
| 2017-06 | 792 | 531 | 110 |
| 2017-07 | 1.198 | 308 | 319 |
| 2017-08 | 793 | 446 | 339 |
| 2017-09 | 779 | 503 | 132 |
| 2017-10 | 761 | 279 | 287 |
| 2017-11 | 283 | 406 | 362 |
| 2017-12 | 121 | 511 | 140 |

Curva "só concluídos" nas mesmas faixas: 0: 63,2% · 30: 68,2% · 60: 68,7% · 90: 71,3% · 104: 70,5% · 120: 75,1%.

### H3 e H4: o ganho do valor ponderado é real? A métrica discrimina?

| Comparação (unidade = vendedor, 4 fotos somadas) | Diferença | IC 95% (bootstrap) | p (troca de sinais) |
|---|---|---|---|
| valor ponderado − preço sem parados | 4,15 p.p. | 1,97 a 6,82 p.p. | 0,0006 |
| valor ponderado − faixas e preço | 11,56 p.p. | 6,26 a 18,22 p.p. | 0,0000 |
| valor ponderado − só preço | 8,08 p.p. | 4,55 a 12,33 p.p. | 0,0001 |
| valor ponderado − chance só com concluídos | 6,17 p.p. | 2,67 a 10,11 p.p. | 0,0010 |

H4 30/06/2017: 30 vendedores; abertos por vendedor de 18 a 118 (mediana 48); com 10 ou menos: 0. Corte: 138.
H4 31/07/2017: 30 vendedores; abertos por vendedor de 22 a 166 (mediana 71); com 10 ou menos: 0. Corte: 138.
H4 31/08/2017: 30 vendedores; abertos por vendedor de 17 a 144 (mediana 69); com 10 ou menos: 0. Corte: 138.
H4 30/09/2017: 30 vendedores; abertos por vendedor de 17 a 153 (mediana 76); com 10 ou menos: 0. Corte: 138.

### H5 e H9: as dimensões no desfecho da coorte, e o tamanho da empresa

| Dimensão | p (concluídos) | p (coorte) | grupos | sem o atributo (concluídos) | maior − menor taxa |
|---|---|---|---|---|---|
| vendedor | 0,264 | 0,000 | 30 | 0 | 15,4 p.p. |
| gestor | 0,786 | 0,002 | 6 | 0 | 2,3 p.p. |
| regional | 0,604 | 0,000 | 3 | 0 | 1,4 p.p. |
| produto | 0,372 | 0,718 | 7 | 0 | 4,8 p.p. |
| setor | 0,971 | 0,490 | 10 | 0 | 3,7 p.p. |
| empresa | 0,943 | 0,643 | 85 | 0 | 21,9 p.p. |
| receita da empresa (quartis) | 0,144 | 0,056 | 4 | 0 | 3,6 p.p. |
| funcionários da empresa (quartis) | 0,103 | 0,035 | 4 | 0 | 4,0 p.p. |

H5: coorte de 31/12 por vendedor (o efeito está no que fica aberto, não na taxa entre concluídos)

| Vendedor | Coorte | Ganho | Aberto | Ganho entre concluídos |
|---|---|---|---|---|
| Donn Cantrell | 195 | 61,0% | 0,0% | 61,0% |
| Garret Kinder | 89 | 65,2% | 0,0% | 65,2% |
| Reed Clapper | 174 | 66,7% | 0,0% | 66,7% |
| Cecily Lampkin | 128 | 57,8% | 14,8% | 67,9% |
| Jonathan Berthelot | 214 | 57,5% | 15,4% | 68,0% |
| Darcel Schlecht | 473 | 52,9% | 17,5% | 64,1% |
| Moses Frase | 181 | 52,5% | 18,8% | 64,6% |
| Gladys Colclough | 190 | 47,9% | 18,9% | 59,1% |
| Niesha Huffines | 158 | 50,6% | 19,0% | 62,5% |
| Versie Hillebrand | 225 | 53,3% | 19,1% | 65,9% |
| Lajuana Vencill | 209 | 44,5% | 19,1% | 55,0% |
| Anna Snelling | 296 | 49,7% | 19,3% | 61,5% |
| Marty Freudenburg | 155 | 52,9% | 21,3% | 67,2% |
| Zane Levy | 239 | 43,9% | 24,3% | 58,0% |
| Cassey Cress | 251 | 46,6% | 25,1% | 62,2% |
| James Ascencio | 189 | 47,6% | 25,4% | 63,8% |
| Vicki Laflamme | 317 | 47,3% | 25,6% | 63,6% |
| Kami Bicknell | 252 | 46,4% | 25,8% | 62,6% |
| Maureen Marcano | 209 | 52,2% | 25,8% | 70,3% |
| Kary Hendrixson | 315 | 45,7% | 26,0% | 61,8% |
| Daniell Hammack | 188 | 46,3% | 27,1% | 63,5% |
| Violet Mclelland | 184 | 46,2% | 27,7% | 63,9% |
| Markita Hansen | 220 | 41,8% | 27,7% | 57,9% |
| Corliss Cosme | 221 | 48,0% | 28,5% | 67,1% |
| Rosie Papadopoulos | 115 | 47,0% | 28,7% | 65,9% |
| Elease Gluck | 134 | 44,0% | 29,1% | 62,1% |
| Hayden Neloms | 147 | 48,3% | 29,9% | 68,9% |
| Rosalina Dieter | 110 | 44,5% | 30,9% | 64,5% |
| Boris Faz | 142 | 44,4% | 31,0% | 64,3% |
| Wilburn Farren | 71 | 49,3% | 31,0% | 71,4% |

H9: negócios em andamento sem empresa (logo, sem receita e funcionários): 1.425 de 2.089 (68,2%). Por etapa: Won 0/4.238; Lost 0/2.473; Engaging 1.088/1.589; Prospecting 337/500.
Mês do trimestre: χ² p = 3.76e-123.

### H6, H7, H8, H10

H6: close_value ÷ preço de lista nos 4.238 ganhos: mínimo 0,66, máximo 1,34, média 0,996; dentro de ±10%: 68,9%.
H7: maior ciclo dos ganhos = 138; dos perdidos = 138. Engaging com data de conclusão: 0.
H8: "de cada 10" por faixa: 0: 49,8% → 5 · 30: 46,4% → 5 · 60: 44,2% → 4 · 90: 33,6% → 3 · 104: 22,1% → 2 · 120: 9,9% → 1.
H10 (31/12): vendedores com "Foque agora" não vazia = 21; tamanho da lista de 1 a 31; dos 10 primeiros por valor ponderado, em média 88,6% também são os 10 mais caros; listas idênticas em 9 vendedores.
Setores grafados no accounts.csv: employment, entertainment, finance, marketing, medical, retail, services, software, technolgy, telecommunications.
