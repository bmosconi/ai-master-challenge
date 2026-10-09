# Process log — como a IA foi usada

> **Antes desta etapa.** Houve uma preparação com o Claude (modo Cowork) como assistente. Ela deixou prontos:
> - uma análise inicial dos dados;
> - a configuração do Claude Code;
> - o plano.
>
> Essa preparação não faz parte do processo registrado aqui. O primeiro passo do Claude Code foi revisar todo esse material — regras, números, código e documentação — em `01-revisao-inicial.md`.

## Ferramentas

| Ferramenta | Modelo | Para quê |
|---|---|---|
| Claude Code (extensão no Cursor) | Opus 5.5 (orquestrador, `critico`, `revisor`), Sonnet 5.5 (`testador-de-uso`) | Revisão inicial, implementação, testes, revisões, testes de uso, deploy |
| Skill `frontend-design` (Anthropic) | — | Direção visual da interface, com briefing B2B (`../CLAUDE.md`) |

## Como ler esta pasta

| Arquivo ou pasta | O que tem |
|---|---|
| `01-revisao-inicial.md` | Revisão completa do material de partida, feita pelo Claude Code no primeiro passo |
| `decisoes.md` | Decisões de partida e decisões tomadas durante a construção |
| `erros-da-ia.md` | Erros da IA nesta etapa: quem percebeu e como foi corrigido |
| `screenshots/` | Prints reais: `01-setup/` (configuração) e `02-app/` (app em uso) |
| `chat-exports/` | Exports das sessões do Claude Code (`/export`) |

## Linha do tempo

[[PREENCHER ao final, a partir dos commits e exports: data e o que foi feito em cada incremento]]

## Iterações

[[PREENCHER ao final, contando nos commits e exports, sem estimar e sem declarar horas:
- sessões;
- incrementos;
- rodadas de revisão;
- achados corrigidos.]]
