@AGENTS.md

# Específico do Claude Code

O `AGENTS.md` acima vale integralmente. Aqui ficam só os pontos que dependem do Claude Code.

**Primeiro passo:** a revisão completa do `AGENTS.md`, seção 8. Nada do material de partida é confiável até ser revisado.

## Papéis

A conversa principal é o **orquestrador**. Ela planeja, implementa todo o código e a documentação factual, roda os comandos e decide o que fazer com as revisões. As partes narrativas do process log são escritas pelo Bruno.

| Agente | Modelo | Acionar quando | Escreve? |
|---|---|---|---|
| `critico` | Opus 5.5 | revisão inicial (regras, plano, lógica do score); antes dos incrementos 1, 2 e 4; mudança de escopo; banca simulada no fim | não |
| `revisor` | Opus 5.5 | revisão inicial (código, segurança, documentação); fim de cada incremento de código; antes do deploy; antes do PR; dependência nova | não |
| `testador-de-uso` | Sonnet 5.5 | depois de cada incremento de interface; antes do deploy; contra a URL publicada | não edita; só roda os scripts de teste e de prints |

## Regras para revisões

- Passe a cada agente as entradas que o arquivo dele pede, incluindo as saídas de comando. Crítico e revisor não rodam comandos.
- **Concordância entre agentes não é prova.** Antes de corrigir um achado grave, reproduza-o: teste que falha, comando ou print. Se não reproduzir, registre por quê e siga.
- **No máximo 2 rodadas** de cada agente por gatilho. Se ainda houver divergência, leve ao usuário com as evidências.
- Achado sem evidência é descartado.

## Interface: skill `frontend-design` + briefing

A skill oficial `frontend-design` está instalada no nível do usuário (`/plugin install frontend-design@claude-plugins-official`). Use-a em toda tarefa de interface.

A própria skill manda seguir o briefing do projeto quando ele fixa uma direção: "the brief's own words always win". O briefing é este:

- **Produto:** ferramenta de trabalho B2B que vendedores e gestores abrem toda segunda de manhã para decidir onde focar. Densa, focada em dados, sóbria. Não é landing page: sem hero, sem ilustração, sem gradiente decorativo, sem vidro fosco, sem animação de entrada. Movimento só como resposta a uma ação (abrir, expandir, confirmar).
- **Estrutura:**
  - filtros no topo (regional → gestor → vendedor) e a data de referência sempre visível;
  - uma barra de números que segue os filtros;
  - listas em tabela compacta com ordenação;
  - painel de detalhe com o motivo de cada posição;
  - página "Como funciona".
- **Tipografia:** uma família sans legível, com algarismos tabulares nos números (`font-variant-numeric: tabular-nums`). Hierarquia por tamanho e peso, nunca por CAIXA ALTA.
- **Cor:** neutros e uma única cor de destaque. Semântica fixa: esfriando = âmbar, parado = vermelho, sempre acompanhada de texto. Contraste AA.
- **Densidade:** linhas de tabela de cerca de 36–40 px, números alinhados à direita, moeda sempre US$ (os dados são em dólar).
- **Estados vazios** dizem o que fazer. Exemplo: um vendedor sem negócio recente é levado para "Revisar ou encerrar" (tem parados) ou "Inicie contato" (tem prospecção).
- **Evitar os vícios que a skill lista:**
  - cartões idênticos com a mesma sombra;
  - rótulo em caixa alta acima de cada título;
  - textos separados por "·";
  - fonte monoespaçada em rótulo de dado;
  - "→" no fim de botão;
  - número grande com rótulo pequeno como solução padrão.
- **Língua:** português do Brasil, com o glossário de `docs/benchmark-ux.md`, seção 3.

## Proteções ativas

- O hook `.claude/hooks/guard-pasta.mjs` bloqueia `Edit`/`Write`/`NotebookEdit` em arquivos do repositório fora desta pasta. Se ele bloquear, não tente contornar: explique ao usuário.
- O hook falha fechado: se o próprio hook quebrar, toda edição é bloqueada. Se a mensagem for `Cannot find module` ou `node: not found`, a configuração está quebrada: pare e avise o usuário.
- **Pedem confirmação:**
  - `git push`, `gh`, `vercel`;
  - instalação de pacotes;
  - `git add -f`;
  - edições em `.claude/`, `CLAUDE.md` e `AGENTS.md`.
- **Bloqueados:** `git push --force`, `gh pr merge`, `git add -A`, `git add .` e `git commit -a`.
- **Limite:** regras de Bash comparam o texto do comando, não o efeito. Por exemplo, `git -C . push` escapa da regra de `git push`. Elas protegem contra engano, não são barreira de segurança. A barreira final é rodar `sh tools/adicionar-ao-git.sh` antes de cada commit e checar o escopo antes do PR.
