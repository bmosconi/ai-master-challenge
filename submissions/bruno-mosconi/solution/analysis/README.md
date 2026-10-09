# Análise de referência (Python)

Esta é uma implementação em Python, separada da do app (TypeScript). Ela gera os números de referência que os testes do app precisam reproduzir. Os scripts são revisados na revisão inicial do Claude Code (`../../process-log/01-revisao-inicial.md`).

## Como rodar

```sh
cd solution/analysis
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python backtest_referencia.py      # tabela de backtest de referência
python auditoria_sql.py            # 21 consultas SQL (DuckDB); grava saidas/auditoria_sql.md
python efeito_trimestre.py         # efeito de fim de trimestre
python backtest_exploratorio.py    # primeira versão do backtest, com modelo de ML
```

Os dados vêm de `../data`. Para usar outra pasta, defina a variável `CRM_DATA_DIR`.

## Arquivos

| Script | Saída em `saidas/` | O que mostra |
|---|---|---|
| `backtest_referencia.py` | `backtest_referencia.txt` | Receita capturada pelos 10 primeiros de cada vendedor, em 4 datas de 2017. É a referência do app (ver tabela abaixo). Determinístico: empate desfeito pelo ID; aleatório calculado pela esperança exata. |
| `auditoria_sql.py` | `auditoria_sql.md` | 21 consultas: contagens, chance pela idade com e sem viés de sobrevivência, ciclo máximo de 138 dias, p-valores por vendedor, gestor, regional, produto, setor e empresa. |
| `efeito_trimestre.py` | `efeito_trimestre.txt` | Taxa de ganho por mês do trimestre em que o negócio foi concluído (49,0% · 54,7% · 80,7%). |
| `backtest_exploratorio.py` | `backtest_exploratorio.txt` | Primeira versão do backtest, com gradient boosting. **Não é determinística:** os resultados mudam conforme a ordem dos empates. Fica como registro. |

Resultados de referência do `backtest_referencia.py`:

| Método | Receita capturada |
|---|---|
| Valor ponderado | 44,41% |
| Faixas de idade | 43,35% |
| Preço sem parados | 40,10% |
| Só preço | 36,17% |
| Chance só com concluídos | 32,23% |
| Aleatório | 15,40% |

## Reprodutibilidade

As saídas desta pasta foram geradas em 09/10/2026 com Python 3.13, pandas 3.0.5, numpy 2.5.3, DuckDB 1.5.6, scipy 1.18.1 e scikit-learn 1.9.1.
