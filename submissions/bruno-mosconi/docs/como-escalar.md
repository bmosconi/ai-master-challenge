# Como escalar

Este documento explica:
- por que a solução roda sem servidor e sem banco;
- o que no código já está pronto para crescer;
- o caminho, em fases, até uma operação real com CRM, muitos usuários e atualização diária.

**O que está construído e o que é proposta:**
- A seção 1 descreve o que existe e foi medido.
- As seções 2 a 5 são proposta de arquitetura: nada daquilo foi construído.
- Os números de tempo e tamanho saem de `npm run bench`, que grava `solution/analysis/saidas/bench.md` (Apple M3 Pro, Node 22.23, Chromium 156). Em outra máquina, os tempos mudam; a proporção entre as escalas é o que importa.

## 1. Onde estamos, e por que é de propósito

**Hoje:**
- O app lê uma foto do CRM (os 4 CSVs do desafio) e faz todas as contas no navegador.
- Não há servidor, banco, chave de API nem custo de infraestrutura.
- Qualquer pessoa roda com `npm ci && npm run dev`, ou abre a URL publicada.

**Por que essa escolha:**
- O problema do desafio é priorizar e explicar, não operar infraestrutura.
- 8.800 negócios cabem com folga no navegador.
- Servidor e banco agora acrescentariam pontos de falha e configuração sem melhorar a decisão do vendedor.

**O que já está pronto para crescer** (e como cada ponto é provado):

| Decisão de arquitetura | Por que importa para escalar | Prova |
|---|---|---|
| **Núcleo puro** em `src/core`: funções determinísticas, sem React, sem rede, sem estado global | O mesmo código roda no navegador, num job em Node ou atrás de uma API, sem reescrever a regra | Testes do núcleo rodam em Node, fora do navegador |
| **Contrato de dados** (`Dataset`, em `src/core/data.ts`): o núcleo recebe registros já normalizados | Trocar CSV por API do CRM ou por banco não muda a regra nem os testes | Dois adaptadores, `parseDataset` (os CSVs, no app) e `fromCrmJson` (JSON no formato de uma API de CRM, com outros nomes de campo e datas ISO), dão o mesmo `Dataset`, as mesmas listas dos 35 vendedores e o mesmo backtest (`adapters.test.ts`) |
| **Data de referência como parâmetro** em todas as contas (point-in-time) | Recalcular o passado sem vazar o futuro é a base do backtest, da auditoria e do monitoramento em produção | Teste anti-vazamento: mudar desfechos depois de T não muda o resultado em T |
| **Regra calibrada pelos dados**: a curva de chance por idade é recalculada a partir da coorte | Se o ciclo de vendas mudar, a regra acompanha sem alguém reescrever pesos | `chanceCurve` recebe a data T; `npm run auditoria` mostra a curva e a calibração em mais de uma data |
| **Custo de processamento:** uma passada para montar a coorte e uma ordenação por vendedor (ordem de n log n) | O tempo cresce de forma previsível com o volume: 10× os dados, cerca de 10× o tempo | `npm run bench`, tabela abaixo |

**Medição** (`npm run bench`). Os negócios da base foram copiados k vezes, com ID novo, mantendo os 35 vendedores e os 7 produtos. Tempos em milissegundos, mediana de 5 rodadas. "Tela" é o que o app calcula ao abrir a semana de um vendedor: curva, score de todos, a lista dele e a equipe do gestor. "Job" é o que um job diário calcularia: curva, score e as listas dos 35 vendedores. A "foto" são os negócios em JSON.

| k | Negócios | Tela (Node) | Tela (Chromium) | Job (Node) | Job (Chromium) | Foto JSON | Foto com gzip |
|---|---|---|---|---|---|---|---|
| 1 | 8.800 | 2 | 2 | 9 | 6 | 1,3 MB | 0,2 MB |
| 10 | 88.000 | 18 | 13 | 62 | 54 | 13,2 MB | 1,6 MB |
| 100 | 880.000 | 216 | 143 | 690 | 616 | 133,3 MB | 16,6 MB |

O cálculo não é o gargalo: com 880 mil negócios, a tela fica abaixo de um quarto de segundo. O que pesa primeiro é baixar e ler a foto. Os tempos não incluem baixar nem interpretar o JSON.

## 2. O que muda quando a operação cresce

| Dimensão | Hoje | Em uma operação real | Consequência |
|---|---|---|---|
| Volume | 8.800 negócios, uma foto | centenas de milhares ou milhões, com histórico | o cálculo sai do navegador e vai para um job |
| Atualização | foto de 31/12/2017 | diária, ou várias vezes ao dia | sincronização com o CRM |
| Usuários | um avaliador | centenas de vendedores e gestores | login e permissão por papel: o vendedor vê os seus negócios, o gestor vê a equipe |
| Ações | só leitura | o vendedor registra "contatei", "descartei", "marcar como perdido" | escrita, trilha de auditoria e retorno ao CRM |
| Sinais | idade e preço | atividades (e-mail, reunião), data prevista de fechamento, contatos | mais variáveis, que só entram se o backtest provar ganho |
| Governança | backtest rodado à mão | acompanhamento contínuo | métrica e alerta automáticos |

## 3. Caminho em fases

### Fase 1 — Dados reais, o mesmo app

**O que muda:**
- Um job agendado lê as oportunidades pela API do CRM, normaliza os campos e grava uma foto do dia em JSON, num armazenamento com CDN.
- O app troca o adaptador CSV por um adaptador que lê essa foto. Nada no núcleo muda.
- Uma camada de autenticação fica na frente do site: login corporativo pelo provedor de hospedagem ou por um proxy de identidade.

**Por que ainda sem banco:** é só leitura, e cada empresa tem um volume que cabe numa foto diária. Com 88 mil negócios (10× a base), a foto tem 1,6 MB com gzip e a tela calcula em 13 ms no Chromium.

**Limite:** todo usuário baixa a foto da empresa inteira. Isso deixa de servir quando houver permissões por vendedor ou quando o arquivo ficar grande demais para celular: com 880 mil negócios, são 16,6 MB com gzip.

### Fase 2 — Muitos usuários, permissões e ações

**Banco relacional** (por exemplo, Postgres), com:
- `oportunidades`, com uma foto por dia, para manter o point-in-time;
- `empresas`, `produtos`, `equipe`;
- `curva_de_chance`, uma por data de cálculo;
- `score`, por data e por negócio, com o potencial e a frase de motivo;
- `acoes_do_vendedor`.

**Job de cálculo** em Node:
- roda o mesmo `src/core` todo dia;
- recalcula a curva, os scores e as listas;
- grava os resultados.

**API enxuta:**
- leitura das listas já filtradas pelo papel de quem pede, com permissão por linha no banco;
- escrita das ações do vendedor.

**Front:** deixa de calcular e só exibe. A frase de motivo chega pronta, gerada pela mesma função.

**Volta ao CRM (opcional):** gravar o score, o potencial e o motivo num campo do CRM, para o vendedor ver onde já trabalha.

### Fase 3 — Escala de empresa e melhoria contínua

- **Dados:** num data warehouse, com transformações versionadas e jobs orquestrados.
- **Monitoramento:**
  - backtest automático todo mês, com a métrica de hoje: receita capturada pelos 10 primeiros de cada vendedor em 90 dias;
  - alerta se a métrica cair ou se a curva de chance mudar além de um limite;
  - painel de calibração: chance prevista × realizada, por faixa de idade.
- **Segmentação:** curvas por produto, região ou porte só quando houver diferença estatística. Hoje não há (D3).
- **Modelo:** com sinais de atividade, testar um modelo (por exemplo, gradient boosting) contra a regra. Só adotar se ele ganhar de forma significativa no backtest e continuar explicável, com fatores e frase. Hoje, no backtest da regra final, o gradient boosting captura 43,2% contra 40,9% do potencial: +2,3 p.p. (IC 95% de −2,5 a +6,4; p = 0,33), o que não é significativo.
- **Experimentos:** comparar regras entre grupos de vendedores, medindo receita e ciclo de vendas.

## 4. O que não muda em nenhuma fase

- A métrica de sucesso: receita capturada pelos primeiros da lista.
- A regra point-in-time.
- A explicação em uma frase.
- A separação entre núcleo e interface.
- Os testes com números de referência independentes.

## 5. Riscos ao escalar e como controlar

| Risco | Controle |
|---|---|
| O ciclo de vendas muda e a curva envelhece | Curva recalculada por data; alerta de mudança; backtest mensal |
| Dados faltando (hoje, 68% dos negócios em andamento não têm empresa) | A regra não depende de empresa; validação na entrada, com contagem de campos vazios |
| Sazonalidade de fim de trimestre | Acompanhar; só entra no score se o backtest provar ganho para negócios em andamento |
| Privacidade (LGPD): dados de clientes e de desempenho de vendedores | Acesso por papel, registro de acesso, só os campos necessários |
| O vendedor não confia na lista | Frase de motivo, tela "Como funciona" e uma ação "isso está errado" que alimenta a revisão da regra |
| Custo | Fase 1 sem servidor; Fase 2 com um banco gerenciado pequeno e jobs agendados; Fase 3 só quando o volume pedir |
