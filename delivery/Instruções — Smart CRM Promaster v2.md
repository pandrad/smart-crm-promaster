# Smart CRM — Mission Control · Versão 2
**Promaster · Protótipo para revisão · Maio 2026**

---

## Como abrir

1. Abra o ficheiro **`Smart CRM — Promaster v2.html`** em qualquer navegador (Chrome, Edge ou Firefox recomendados).
2. Não é necessária ligação à Internet nem instalar nada.
3. Todos os dados são fictícios e servem apenas para demonstração.

---

## Acessos de demonstração

| Perfil | Email | Palavra-passe | Permissões |
|--------|-------|---------------|------------|
| Administrador | `admin@promaster.co` | `admin123` | Acesso total — painel de administração, reatribuição de qualquer processo ou tarefa, alteração de prioridades |
| Supervisor | `supervisor@promaster.co` | `super123` | Pode reatribuir processos e tarefas, alterar prioridades, ver widget de resumo — não acede à configuração do sistema |
| Utilizador standard | `adelina@promaster.co` | `pass123` | Acesso ao dashboard, pode reatribuir os seus próprios processos e tarefas |

> Recomendamos testar com os três perfis para ver as diferenças de permissão.

---

## O que há de novo nesta versão

Esta versão introduz o redesenho completo **Mission Control** — navegação lateral persistente, tema escuro, e três novas secções (Tarefas, Inbox, Arquivo).

---

## Estrutura da aplicação

### Navegação lateral (sidebar)

A barra lateral esquerda está sempre visível e organiza-se em três zonas:

**Principal**
- **Processos** — lista principal de processos comerciais (com badge do número em aberto)
- **Tarefas** — tarefas não relacionadas com cotações (com badge das pendentes)
- **Inbox** — emails recebidos a aguardar triagem (com badge dos pendentes)

**Gestão**
- **Clientes** — (previsto para versão futura)
- **Arquivo** — processos arquivados (mais de 3 anos)

**Sistema** *(apenas Admin e Supervisor)*
- **Administração** — abre o painel de configuração

Na parte inferior da sidebar encontra o chip do utilizador (clique para editar o perfil) e o botão **Terminar sessão**.

---

## Secções detalhadas

### 1. Processos

O ecrã principal de gestão de cotações.

**Barra de estatísticas**
Seis cartões clicáveis que filtram a lista:
- **Todos** — sem filtro, mostra tudo
- **Em Aberto** — estados 1 a 6 (processos activos)
- **Em Atraso** — prazo ultrapassado e ainda em aberto
- **Urgentes** — prazo nas próximas 48 horas
- **Ganhos** — processos com estado Encomenda
- **Transitados** (tom acinzentado) — processos de meses anteriores ainda em aberto

Clique num cartão para filtrar. Clique novamente para limpar.

**Meus processos / Todos os processos**
Botões de contexto que alternam entre a visão global e os processos onde o utilizador tem um papel atribuído. Os cartões de estatística actualizam-se em conformidade.

**Vista em Tabela**
- Clique em qualquer cabeçalho de coluna para ordenar (ascendente / descendente — seta indicadora)
- Clique no ícone de filtro junto ao cabeçalho para filtrar por valores distintos; vários filtros de coluna podem estar activos em simultâneo
- A coluna **Prio** (prioridade) permite alterar a prioridade directamente na linha — clique no indicador (Admin e Supervisor apenas)
- A coluna **Follow Up** só aparece quando o processo está em estado Enviado ou Encomenda
- O botão de olho na barra de ferramentas permite mostrar/esconder colunas individualmente; preferência gravada por utilizador

**Vista Kanban**
- Colunas por estado; arraste os cartões para mover um processo para outro estado
- Cartões de processos não atribuídos ao utilizador aparecem bloqueados (cadeado) e não podem ser arrastados

**Painel de detalhe (gaveta lateral)**
Ao clicar numa linha ou cartão abre-se o painel lateral com:
- **Número do processo** em destaque (monospace, grande)
- **Comprador** imediatamente abaixo do cliente
- Grelha de informação completa
- **Consulta** — quando o estado é *Consulta*, aparece uma lista de verificação com dois passos obrigatórios (Pedido ao fornecedor / Resposta do fornecedor); cada passo regista o timestamp ao ser marcado e indica se o SLA foi excedido
- **Anexos** — o link do Excel modelo aparece sempre; outros anexos quando existirem
- **Equipa** — os três responsáveis (Cotação, Comercial, Compra) com botão Reatribuir visível para Admin, Supervisor, e o próprio responsável
- **Pipeline** — barra visual do progresso por fase
- **Histórico** — linha do tempo de todos os eventos
- **Follow-up** — só visível quando estado ≥ Enviado
- Botões: **Enviar Email** (rascunho pré-preenchido) e **Alterar Estado** (lista de todos os estados; selector de follow-up aparece apenas se o estado destino for ≥ Enviado)

**Widget de supervisão** *(Admin e Supervisor)*
Aparece acima da barra de estatísticas e mostra: processos abertos este mês, fechados este mês, em atraso agora, tarefas pendentes, e os 3 processos mais atrasados.

---

### 2. Tarefas

Gestão de actividades que não são cotações.

**Tipos de tarefa:** Contas Correntes · Status de Encomenda · Desconto · Cliente Novo · Diversos

Cada tarefa tem: tipo, cliente, comprador, responsável, estado (Pendente / Em Curso / Concluído), prazo, prioridade, descrição e o email de origem.

**Filtros disponíveis:** pesquisa livre, tipo, estado, responsável.

**Gaveta de tarefa**
- Campos completos da tarefa
- Email de origem (clique para expandir/colapsar)
- **Marcar como Concluído** — altera o estado e desactiva o botão
- **Alterar Estado** — modal com todos os estados
- **Reatribuir** — visível para o responsável da tarefa, Supervisor e Admin

---

### 3. Inbox

Triagem de emails recebidos antes de serem classificados.

Cada email mostra: remetente, assunto, pré-visualização, hora de recepção, e a **sugestão da IA** (tipo sugerido e percentagem de confiança).

**Emails internos** (entre membros da equipa) são automaticamente excluídos e nunca aparecem na lista.

**Quatro acções por email:**

| Acção | O que acontece |
|-------|---------------|
| **Novo Processo** | Gera um número AAMMMNNN imediatamente, cria o processo e move-o para a lista de Processos. O email desaparece do Inbox. |
| **Nova Tarefa** | Abre um selector de tipo de tarefa; ao confirmar, cria a tarefa em Tarefas. O email desaparece do Inbox. |
| **Associar** | Campo de texto para introduzir um número de processo existente; valida e associa o email a esse processo. |
| **Diversos** | Remove o email da lista de pendentes (marcado como diversos, atribuído ao supervisor). |

**Cliente não reconhecido** — quando o remetente não está na base de dados, aparece um banner amarelo com a opção de criar uma ficha de cliente (nome e email).

---

### 4. Arquivo

Processos com mais de 3 anos são automaticamente sinalizados como arquivados e não aparecem na lista principal.

No Arquivo, a tabela é de leitura apenas. Clique numa linha para abrir o painel de detalhe completo.

---

### 5. Painel de Administração

Disponível para **Admin** (acesso total) e **Supervisor** (sem acesso à configuração do sistema).
Clique em **Administração** na sidebar para abrir como gaveta lateral.

| Aba | O que configura |
|-----|----------------|
| **Utilizadores** | Adicionar, editar, desactivar/activar utilizadores; definir função, foto e palavra-passe inicial |
| **Estados** | Criar, editar, reordenar e colorir as fases do processo e os estados de follow-up (arrastar para reordenar) |
| **Prioridades** | Definir níveis de prioridade com cores |
| **Funções** | Criar e editar funções disponíveis para atribuição a utilizadores |
| **Atribuição de Tarefas** | Para cada função, seleccionar o(s) utilizador(es) responsável(eis); se forem dois ou mais, a IA faz rotação automática |
| **Marca / Logótipo** | Carregar logótipo (com zoom/reposicionamento), definir nome da aplicação e cor de destaque |
| **Importar** | Importação em bloco de processos a partir de CSV/Excel (exportação do SharePoint) |

---

### 6. Perfil do utilizador

Clique no chip do utilizador no fundo da sidebar:
- Alterar nome de utilizador
- Carregar ou alterar fotografia (reflectida em todos os avatares)
- Definir nova palavra-passe

---

### 7. Tema claro / escuro

Botão no topo da área de conteúdo (ícone de sol/lua). A preferência é guardada e aplicada na próxima sessão.

---

### 8. Notificação de email (toast)

Após 2 segundos, aparece uma notificação no canto inferior direito a simular a chegada de um email classificado pela IA.

---

## Perguntas em aberto (a confirmar antes da próxima fase)

| # | Questão |
|---|---------|
| A | **Atribuição automática**: a lógica de rotação (round-robin) está correcta? Existem regras por tipo de equipamento ou cliente? |
| B | **Lista completa de utilizadores**: nomes, emails e funções de todos os colaboradores (~10–15 pessoas) |
| C | **Lista completa de estados**: confirmar se as 11 fases actuais estão correctas ou se há ajustes |
| D | **Prazos SLA por fase**: quantos dias cada fase pode durar antes de disparar um alerta de urgência? |
| E | **Responsável pelos alertas de atraso**: quem recebe a notificação quando um processo entra em atraso? |
| F | **Exportação do SharePoint**: é possível exportar os processos para Excel/CSV? Uma amostra de 10–20 linhas reais seria ideal antes de construir a ferramenta de importação |

---

## Próximos passos

Após a vossa revisão e feedback, a próxima fase inclui:

1. **Ajustes ao protótipo** com base no feedback desta sessão
2. **Finalização do esquema da base de dados** com os estados, utilizadores e SLAs confirmados
3. **Configuração do Azure AD** para ligação ao Outlook da Promaster (`info@promaster.co`)
4. **Desenvolvimento do backend** (FastAPI + PostgreSQL via Supabase)
5. **Ligação da interface aos dados reais**

---

*Protótipo desenvolvido por Pedro Andrade — Maio 2026*
*Para questões técnicas: pandrad@gmail.com*
