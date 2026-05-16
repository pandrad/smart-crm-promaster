# Smart CRM — Protótipo para Revisão
**Promaster · Versão de demonstração · Maio 2026**

---

## Como abrir

1. Abra o ficheiro **`Smart CRM — Promaster (Protótipo).html`** em qualquer navegador (Chrome, Edge ou Firefox recomendados).
2. Não é necessária ligação à Internet. Não é necessário instalar nada.
3. Todos os dados são fictícios e servem apenas para demonstração.

---

## Acessos de demonstração

| Utilizador | Email | Palavra-passe | Perfil |
|---|---|---|---|
| Administrador | `admin@promaster.co` | `admin123` | Acesso total |
| Adelina Rodrigues | `adelina@promaster.co` | `pass123` | Utilizador standard |

> Recomendamos testar com ambos os perfis para ver a diferença de permissões.

---

## O que está incluído neste protótipo

### 1. Dashboard principal

O ecrã principal apresenta todos os processos comerciais numa vista centralizada.

**Barra de estatísticas (topo)**
Cinco cartões clicáveis que funcionam como filtros rápidos:
- **Todos** — mostra todos os processos sem filtro
- **Em Aberto** — processos ainda não concluídos
- **Em Atraso** — processos cujo prazo já passou
- **Urgentes** — processos com prazo nas próximas 48 horas
- **Ganhos (mês)** — processos fechados com sucesso

> Ao clicar num cartão, a tabela/kanban filtra automaticamente. Clique novamente para limpar o filtro.

**Tabs de âmbito**
- **Todos os processos** — visão global de toda a equipa
- **Meus processos** — filtra apenas os processos onde o utilizador tem um papel atribuído (Cotação, Comercial ou Compra). Os cartões de estatística actualizam-se em conformidade.

---

### 2. Vista em Tabela

A tabela mostra todos os campos de cada processo numa linha:

| Coluna | Descrição |
|---|---|
| Nº | Número único do processo |
| Criado | Data de criação |
| Prazo | Urgência em dias (verde = OK, laranja = breve, vermelho = atraso) |
| Prio | Indicador de prioridade (vermelho = Alta) |
| Estado | Fase actual do processo |
| Follow Up | Estado comercial do follow-up |
| Cliente | Nome do cliente |
| Marca / Modelo | Equipamento em questão |
| Resp. Cotação / Comercial | Responsáveis atribuídos |
| Valor | Preço de venda (quando definido) |
| Emails | Número de emails associados |

**Clique em qualquer linha** para abrir o painel de detalhe lateral.

---

### 3. Vista Kanban

Alterna para a visão em colunas clicando em **Kanban** no canto superior direito da barra de ferramentas.

- Cada coluna representa um estado do processo.
- Os cartões podem ser **arrastados entre colunas** para alterar o estado (apenas para processos atribuídos ao utilizador — os outros aparecem bloqueados com um cadeado).
- Clique num cartão para abrir o painel de detalhe.

---

### 4. Filtros e pesquisa

Na barra de ferramentas, estão disponíveis:
- **Pesquisa de texto livre** — procura por cliente, marca ou número de processo
- **Resp. Cotação** — filtra por responsável de cotação
- **Resp. Comercial** — filtra por responsável comercial
- **Todos os estados** — filtra por fase do processo

---

### 5. Painel de detalhe (gaveta lateral)

Ao clicar num processo abre-se uma gaveta lateral à direita com:

- **Cabeçalho** com estado, follow-up e prioridade
- **Alerta de atraso** (se aplicável)
- **Grelha de informação** — todos os campos do processo
- **Equipa atribuída** — os três responsáveis (Cotação, Comercial, Compra)
- **Pipeline visual** — barra colorida que mostra em que fase está o processo
- **Histórico** — linha do tempo de todos os eventos (email recebido, classificação IA, atribuições, etc.)

**Acções disponíveis:**
- **Enviar Email** — abre um rascunho pré-preenchido para responder ao cliente
- **Alterar Estado** — permite mudar a fase do processo e o follow-up sem fechar a gaveta
- **Reatribuir** *(apenas administrador)* — permite alterar os três responsáveis atribuídos ao processo

---

### 6. Notificação de email (toast)

Após 2 segundos, aparece uma notificação no canto inferior direito simulando a chegada de um email.
Demonstra como o sistema detecta automaticamente novos emails, os classifica com IA e cria um processo.

---

### 7. Perfil do utilizador

No canto superior direito, clique no **nome/avatar** para aceder ao seu perfil:
- Alterar nome de utilizador
- Carregar ou alterar fotografia
- Definir nova palavra-passe

---

## Painel de Administração

Disponível apenas com o perfil **admin**. Clique no botão **Administração** na barra superior.

O painel abre como uma gaveta lateral sobre o dashboard (o dashboard permanece visível por baixo).

### Aba: Utilizadores

Gestão de todos os utilizadores do sistema:
- **Adicionar** novo utilizador com nome, email, função, foto e palavra-passe inicial
- **Editar** dados de um utilizador existente
- **Desativar / Ativar** utilizadores sem os eliminar

### Aba: Estados

Gestão das fases do processo e dos estados de follow-up:
- **Adicionar, editar e reordenar** estados (arrastar para reordenar)
- **Personalizar a cor** de cada estado com paleta de cores predefinida ou cor personalizada
- As alterações são reflectidas imediatamente na tabela, kanban e gaveta de detalhe

### Aba: Prioridades

Define os níveis de prioridade disponíveis (ex.: Normal, Alta) com as respectivas cores.

### Aba: Funções

Define as funções que podem ser atribuídas aos utilizadores (ex.: Resp. Cotação, Resp. Comercial, Resp. Compra, Administrador).

### Aba: Atribuição de Tarefas

Configura a regra de atribuição automática quando a IA recebe um novo email:
- Para cada função, seleccione **um ou mais utilizadores**
- Se for seleccionado apenas um, é sempre esse o responsável
- Se forem seleccionados dois ou mais, a IA faz **rotação (round-robin)** entre eles

### Aba: Marca / Logótipo

Personaliza a aparência da aplicação:
- **Logótipo** — carregue uma imagem, ajuste o zoom e arraste para reposicionar; as alterações aparecem imediatamente na barra de navegação
- **Nome da aplicação** e **subtítulo**
- **Cor de destaque** — altera a cor principal de toda a interface

### Aba: Importar

Ferramenta para importação em bloco de processos existentes a partir de um ficheiro CSV ou Excel (exportação do SharePoint actual).

---

## Perguntas em aberto (a confirmar antes da próxima fase)

Antes de avançarmos para o desenvolvimento do backend, precisamos de confirmar os seguintes pontos:

| # | Questão |
|---|---|
| A | **Atribuição automática**: round-robin é a regra preferida? Ou existem regras específicas (ex.: por tipo de equipamento)? |
| B | **Lista completa de utilizadores**: nomes, emails e funções de todos os ~10–15 colaboradores |
| C | **Lista completa de estados**: confirmar as fases actuais (ex.: 1. Entrada, 2. Pendente Cliente, etc.) e se há fases em falta |
| D | **Prazos SLA por fase**: quantos dias cada fase pode durar antes de acionar um alerta de urgência |
| E | **Responsável pelos alertas de atraso**: quem deve receber a notificação quando um processo entra em atraso? |
| F | **Exportação do SharePoint**: é possível exportar os processos existentes para Excel/CSV? Idealmente uma amostra com 10–20 linhas reais |

---

## Próximos passos

Após a vossa revisão e feedback, a próxima fase inclui:

1. **Ajustes ao protótipo** com base no feedback recebido
2. **Finalização do esquema da base de dados** com os estados e utilizadores confirmados
3. **Configuração do Azure AD** para ligação ao Outlook da Promaster
4. **Desenvolvimento do backend** (FastAPI + PostgreSQL)
5. **Ligação da interface aos dados reais**

---

*Protótipo desenvolvido por Pedro Andrade — Maio 2026*
*Para questões técnicas: pandrad@gmail.com*
