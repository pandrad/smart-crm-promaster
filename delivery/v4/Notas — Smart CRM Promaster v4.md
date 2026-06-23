# Smart CRM — Promaster v4
## Notas de Versão — Novidades desde v3

---

### Dados Reais da Equipa

- Os 14 utilizadores reais da equipa Promaster estão agora carregados como dados de demonstração: Adelina Rodrigues, Alexandra Lima, Augusto Gouveia, Braulio Lourenço, Erânio Cassanga, Francisco Leitão, Gabriel Dala, João Chiquica, João Morais, Joaquim César, Luís Quelhas Valente, Lukeny Campos, Susete Ferreira, Tiago Pinto.
- 10 funções definidas conforme a estrutura real: Resp. Pré-Entrada, Resp. Cotação, Resp. FPs, Resp. Abertura, Resp. Fecho, Resp. Técnico, Resp. Contas a Receber e a Pagar, Resp. Comercial, Supervisor, Administrador.
- Cada utilizador está pré-atribuído às funções correctas (ex: Adelina tem Resp. Pré-Entrada e Resp. Cotação, Augusto tem Resp. Abertura e Resp. FPs, João Morais tem Supervisor).
- Credenciais de login actualizadas: Admin (`luis.valente@promaster.co.ao` / `admin123`), Supervisor (`joao.morais@promaster.co.ao` / `pass123`), Standard (`adelina.rodrigues@promaster.co.ao` / `pass123`).

### Estados de Processo

- 13 estados de processo substituem os 11 anteriores, conforme a especificação do cliente: Pré-Entrada, Pendente Cliente, Análise Técnica Promaster, Abrir Processo, Entrada, Consulta, Para Fechar, Fechado, FP Para Envio, Enviado, Enviado Pendente, Adjudicado, Cancelado.
- Os estados "Qualificacao", "Pendente Master", "Fechado Pendente" e "Encomenda" foram substituídos por "Análise Técnica Promaster", "Abrir Processo", "FP Para Envio", "Enviado Pendente" e "Adjudicado".

### Tipos de Tarefa

- 9 tipos de tarefa: Pré-Entrada, Abertura de Processo, Contas Correntes, Status de Encomenda, Desconto, Cliente Novo, Follow-Up, Escalação, Análise Técnica.
- Removidos: "Validação de Processo" (substituído pelo fluxo em dois passos descrito abaixo), "Não Classificado" (emails não classificados usam agora tipo nulo), "Diversos".
- Novo: "Análise Técnica".

### Novo Fluxo de Tarefas — Pré-Entrada → Abertura de Processo

- O fluxo de validação de processos foi completamente redesenhado. Uma tarefa mantém o mesmo número de identificação desde a criação até à conclusão — o ID nunca muda.
- **Passo 1 — Pré-Entrada:** A tarefa é criada com tipo Pré-Entrada e atribuída ao Resp. Pré-Entrada (ex: Adelina). Botões disponíveis: Validar, Enviar Email ao Cliente, Escalar/Passar, Cancelar Tarefa.
- **Passo 2 — Validar:** Ao clicar Validar, a mesma tarefa muda de tipo para Abertura de Processo e é atribuída ao Resp. Abertura (ex: Augusto ou Braulio). O campo cotacaoOwner guarda quem validou (Adelina) para o passo seguinte.
- **Passo 3 — Abrir Processo:** O Resp. Abertura clica "Abrir Processo" — é gerado um número de processo (AAMMNNN) e o processo é criado com estado Entrada. A tarefa é marcada como Concluída. O Resp. Cotação do processo é automaticamente definido como a pessoa que validou (Adelina).
- **Devolver com Notas:** Se o Resp. Abertura devolve a tarefa, o tipo reverte automaticamente para Pré-Entrada e a tarefa volta ao validador original.
- Todo o histórico de cada alteração (tipo, responsável, estado, notas) fica registado na timeline da tarefa.

### Classificação de Emails Reescrita

- Lógica de dois resultados: o email é classificado automaticamente (confiança ≥ 60%, tipo válido) ou marcado como "requer atenção manual".
- Emails não classificáveis criam tarefas sem tipo definido (tipo nulo), atribuídas ao Supervisor — o tipo "Não Classificado" já não existe.
- O Supervisor pode classificar tarefas sem tipo através do botão "Classificar Tarefa" no painel de detalhe — seleccionando um tipo existente ou criando um novo.
- Após classificação, a tarefa é automaticamente reatribuída ao responsável correcto via Mapeamento.

### Inbox

- O Inbox é agora totalmente de leitura para todos os utilizadores — sem botões de acção em qualquer email.
- Duas secções: "Processados automaticamente" (visível apenas com simulação IA ligada) e "Requerem atenção manual" (sempre visível).
- Toda a classificação e encaminhamento acontece na página de Tarefas, não no Inbox.

### Dashboard

- Nova secção "As minhas tarefas" com três indicadores: Por Fazer, Activas, SLA Excedido.
- Secção "Visão geral de processos" com StatsBar — utilizadores standard vêem os seus processos por defeito com toggle "Ver todos" / "Ver meus"; Admin/Supervisor vêem todos por defeito.
- Widget de Supervisor (apenas Admin/Supervisor): resumo de processos fechados, em atraso, tarefas escaladas.
- Actividade Recente: painel único com scroll fixo (5 entradas visíveis). Admin/Supervisor vêem toggle "As Minhas" / "Geral". Utilizadores standard vêem apenas a sua actividade.

### Tarefas — Vista Pessoal e Três Secções

- A lista de tarefas tem três secções permanentes: Por Fazer, Em Curso, Concluídas.
- Todos os utilizadores (incluindo Admin e Supervisor) vêem as suas próprias tarefas por defeito.
- Admin e Supervisor podem alternar para ver todas as tarefas com o botão "Ver todas as tarefas" — o toggle aplica-se às três secções.
- O badge de tarefas na barra lateral mostra sempre a contagem pessoal de tarefas activas, independentemente da vista seleccionada.
- Tarefas com prazo ultrapassado mostram indicador visual (borda vermelha, ícone de alerta).
- Tarefas redireccionadas (via Passar, Escalar, Devolver) mostram indicador ↩ na secção Por Fazer.

### Botões de Acção — Regras para Admin e Supervisor

- Admin e Supervisor nunca vêem o botão "Escalar" em nenhum tipo de tarefa — são o topo da cadeia de escalação.
- Admin e Supervisor vêem sempre o botão "Passar" para reatribuir a qualquer utilizador.
- O botão "Alterar Estado Manualmente" está sempre disponível para Admin e Supervisor, em qualquer tipo de tarefa e qualquer estado.

### Processos — Melhorias

- Coluna "Data Limite" mostra a data calculada (data de criação + duração SLA configurada para o estado actual). Quando a data está ultrapassada, aparece em vermelho com ícone ⚠.
- O estado de Follow-up é editável em qualquer estado do processo — tanto no modal "Alterar Estado" como directamente no painel de detalhe. Já não está restrito a processos com estado Enviado ou superior.
- O modal "Reatribuir" mostra todos os membros activos da equipa nos três dropdowns (Resp. Cotação, Resp. Comercial, Resp. Compra) — já não filtra por função.
- Formato de número de processo: AAMMNNN com data real (não fictícia). Contador sequencial reinicia por prefixo de mês.

### Mapeamento de Responsabilidades

- Mapeamento pré-configurado para todos os 13 estados de processo: cada estado tem uma função atribuída com Reatribui ligado (excepto Pré-Entrada que não tem função atribuída).
- Mapeamento pré-configurado para tipos de tarefa: Pré-Entrada → Resp. Pré-Entrada, Abertura de Processo → Resp. Abertura, Contas Correntes → Resp. Contas, etc.
- Mapeamento para estados de tarefa: Escalado → Supervisor, Cancelado → Supervisor.

### Alterar Estado Manualmente

- Acção disponível para Admin e Supervisor em qualquer tarefa (incluindo Concluído/Cancelado).
- Abre um picker com todos os estados incluindo os de System Role, com campo obrigatório de motivo.
- Cada alteração manual fica registada no histórico com a marca "⚠ Alteração manual".

### Ferramentas DEV

- Nova ferramenta "Gerar email por tipo": seleccionar um tipo de tarefa e gerar um email com assunto e conteúdo adequado a esse tipo. Com simulação IA ligada, a classificação é gerada com confiança 85-99%.
- Nova ferramenta "Gerar email não classificável": gera um email que a IA não consegue classificar (tipo nulo, confiança 0).
- Simulação de incumprimento de SLA estendida a processos: antedata a data de criação de 2 processos activos para activar o indicador de atraso na coluna Data Limite.
- Toggle de simulação IA: controla se os emails gerados recebem classificação automática.

### Detalhe de Processo — Melhorias

- Email de Origem clicável: abre um modal de leitura com remetente, assunto e corpo completo.
- Campos editáveis: Marca/Tipo, Modelo, Sell Price — clique para editar com confirmação/cancelamento.
- Anexos: botão "Anexar ficheiro" para upload. Acção "Remover" em cada anexo requer confirmação e marca como substituído sem apagar.
- Timeline completa: cada alteração de estado, reatribuição, edição de campo e gestão de anexo fica registada com timestamp, actor e descrição.
- Secção SLA/Avisos: mostra o timing configurado para o estado actual com botão "Editar SLA".

### Painel de Administração

- Tab "Tarefas": tipos de tarefa e estados de tarefa com campo System Role. Estados com System Role mostram ícone de cadeado, não podem ser eliminados, e têm o dropdown de System Role bloqueado ao editar.
- Tab "Mapeamento": por estado de processo (com toggle Reatribui), por tipo de tarefa (apenas dropdown de função), por estado de tarefa (com toggle Reatribui).
- Tab "Atribuição de Utilizadores": um utilizador pode ter várias funções, uma função pode ter vários utilizadores com distribuição round-robin.

### Correções e Ajustes

- Todos os rótulos, nomes de funções, estados e tipos seguem o formato Title Case consistentemente.
- Processos e tarefas mock actualizados com nomes reais da equipa Promaster em todos os campos de responsável.
- Emails internos na mock data actualizados com os endereços reais (@promaster.co.ao).
- Notificação toast desactivada (componente mantido para reintrodução futura).
- Tarefas sem responsável visíveis apenas para Admin/Supervisor.
