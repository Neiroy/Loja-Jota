# Design System — Visual Premium

Sistema interno com aparência profissional, minimalista e elegante. Poucas informações por tela. Uso diário rápido e sem fricção.

---

## Filosofia

- **Premium** — parece um produto profissional, não um sistema improvisado
- **Limpo** — bastante espaço em branco, hierarquia clara
- **Objetivo** — uma ação principal por tela; sem ruído visual
- **Consistente** — mesmos padrões em todo o sistema

### Evitar

- Telas poluídas com informação demais
- Muitos gráficos ou visualizações complexas
- Excesso de cores competindo por atenção
- Botões demais na mesma tela
- Informações desnecessárias
- Layout com aparência amadora ou genérica
- Sistema que pareça "template gratuito"

---

## Paleta de cores

### Base

| Token          | Valor                 | Uso                             |
| -------------- | --------------------- | ------------------------------- |
| Background     | `#FAFAF8` (off-white) | Fundo principal da aplicação    |
| Surface        | `#FFFFFF`             | Cards, modais, sidebar          |
| Border         | `#E8E6E3`             | Bordas suaves de cards e inputs |
| Text primary   | `#1C1917` (grafite)   | Títulos, dados principais       |
| Text secondary | `#78716C`             | Subtítulos, labels, metadados   |
| Text muted     | `#A8A29E`             | Placeholders, hints             |

### Cor principal (accent)

| Opção              | Valor     | Uso                                         |
| ------------------ | --------- | ------------------------------------------- |
| Grafite premium    | `#292524` | Botões primários, links, item ativo no menu |
| Alternativa marrom | `#78350F` | Se aprovado pelo usuário na Fase 5          |

**MVP:** grafite premium (`#292524`) como cor principal.

### Status (discretos)

| Status    | Cor                  | Fundo badge | Uso               |
| --------- | -------------------- | ----------- | ----------------- |
| Pago      | `#15803D` (verde)    | `#F0FDF4`   | `paid`            |
| Em aberto | `#B45309` (âmbar)    | `#FFFBEB`   | `open`, `pending` |
| Vencido   | `#B91C1C` (vermelho) | `#FEF2F2`   | `overdue`         |
| Cancelado | `#78716C` (cinza)    | `#F5F5F4`   | `cancelled`       |

---

## Tipografia

| Elemento      | Estilo                                                 |
| ------------- | ------------------------------------------------------ |
| Font family   | Inter (via `next/font`)                                |
| Page title    | `text-2xl font-semibold tracking-tight text-stone-900` |
| Page subtitle | `text-sm text-stone-500`                               |
| Section title | `text-lg font-medium text-stone-800`                   |
| Body          | `text-sm text-stone-700`                               |
| Table data    | `text-sm text-stone-700`                               |
| Label         | `text-sm font-medium text-stone-700`                   |
| KPI value     | `text-3xl font-semibold tracking-tight text-stone-900` |
| KPI label     | `text-sm text-stone-500`                               |

---

## Espaçamento e superfícies

| Elemento          | Estilo                                                              |
| ----------------- | ------------------------------------------------------------------- |
| Page padding      | `p-6 lg:p-8`                                                        |
| Gap entre seções  | `space-y-6` ou `gap-6`                                              |
| Card              | `bg-white rounded-xl border border-stone-200 shadow-sm`             |
| Card padding      | `p-6`                                                               |
| Input             | `rounded-lg border-stone-200 focus:ring-stone-400`                  |
| Button primary    | `bg-stone-900 text-white hover:bg-stone-800 rounded-lg`             |
| Button secondary  | `bg-white border border-stone-200 text-stone-700 hover:bg-stone-50` |
| Sidebar width     | `w-64` (desktop)                                                    |
| Content max-width | `max-w-7xl mx-auto`                                                 |

Sombras: leves (`shadow-sm`), nunca pesadas. Bordas: `rounded-lg` a `rounded-xl`.

---

## Componentes obrigatórios

Todos em `src/components/`, usando shadcn/ui como base.

### Layout (`components/layout/`)

| Componente   | Descrição                                                                             |
| ------------ | ------------------------------------------------------------------------------------- |
| `Sidebar`    | Menu lateral discreto, fundo branco, item ativo com fundo stone-100 e texto stone-900 |
| `Topbar`     | Barra superior limpa: nome do usuário, botão logout; sem excesso de ícones            |
| `PageHeader` | Título + subtítulo opcional + slot para ação primária à direita                       |

### Compartilhados (`components/shared/`)

| Componente            | Descrição                                                                  |
| --------------------- | -------------------------------------------------------------------------- |
| `AuthCard`            | Card centralizado para login; logo/nome da loja; fundo off-white na página |
| `DashboardCard`       | Card de KPI: label, valor grande, ícone discreto opcional                  |
| `DataTable`           | Tabela organizada com header sticky, hover sutil, paginação simples        |
| `StatusBadge`         | Badge semântico: Pago, Em aberto, Vencido, Cancelado                       |
| `EmptyState`          | Ilustração/ícone + mensagem + ação opcional; para listas vazias            |
| `FormSection`         | Agrupamento de campos com título de seção e espaçamento generoso           |
| `ConfirmDialog`       | Dialog de confirmação assíncrono; permanece aberto até a ação concluir     |
| `ListErrorAlert`      | Banner de erro quando falha o carregamento de listagens ou dashboard       |
| `TableSkeleton`       | Placeholder discreto para tabelas durante carregamento                     |
| `PageLoadingSkeleton` | Skeleton genérico para navegação entre rotas protegidas                    |

### Base (`components/ui/`)

Primitives do shadcn/ui: Button, Input, Select, Table, Card, Badge, Dialog, Sheet, Label, Separator, DropdownMenu, Skeleton.

### Feedback (`sonner`)

- Toasts para sucesso/erro em ações sem redirect (toggle status, quitar fiado)
- Erros de formulário permanecem **inline** (`fieldErrors` + `text-destructive`)
- Erros de carregamento usam `ListErrorAlert` (não toast)
- Estilo discreto: borda `stone-200`, fundo branco, cantos arredondados

---

## Padrões de tela

### Login

- Fundo off-white full-screen
- `AuthCard` centralizado vertical e horizontalmente
- Campos email + senha bem espaçados
- Botão primário full-width
- Sem elementos decorativos excessivos

### Dashboard

- `PageHeader` com saudação simples
- Grid de 4–6 `DashboardCard` no topo
- Uma seção inferior: fiados próximos do vencimento ou últimas vendas
- Sem gráficos no MVP

### Listagem (clientes, produtos, vendas, fiados)

- `PageHeader` + botão "Novo ..."
- Busca simples (input com ícone)
- `DataTable` com colunas essenciais (máx. 6–7)
- `StatusBadge` na coluna de status
- `EmptyState` quando sem dados (não exibir quando houver erro de carregamento)
- `ListErrorAlert` quando falha a busca de dados
- `TableSkeleton` no `Suspense` dos filtros e `loading.tsx` no layout protegido

### Formulário (criar/editar)

- `PageHeader` com título da ação
- `FormSection` agrupando campos relacionados
- Grid 1 coluna (mobile) / 2 colunas (desktop) para campos curtos
- Botão primário destacado + secundário "Cancelar"
- Validação inline via `fieldErrors` do Server Action

### Detalhe do cliente

- Dados do cliente no topo (card)
- Abas ou seções: Vendas, Fiados em aberto, Fiados pagos
- `StatusBadge` em cada registro financeiro

### Configurações (`/configuracoes`)

- `PageHeader` com título e subtítulo informativo
- Grid responsivo `lg:grid-cols-2` com cards brancos (`border-stone-200`, `shadow-sm`)
- Ícone Lucide discreto no título de cada seção (`stone-100` / `stone-600`)
- Campos somente leitura em grid `sm:grid-cols-2` (padrão `SettingsDetailField`)
- `StatusBadge` para status operacionais (Ativo)
- Chips neutros para módulos ativos
- Sem formulários, botões de salvar ou campos editáveis
- Dados do usuário logado (nome, e-mail, role) via server; demais conteúdo estático

---

## Menu lateral (Sidebar)

| Item          | Rota             | Ícone           |
| ------------- | ---------------- | --------------- |
| Dashboard     | `/dashboard`     | LayoutDashboard |
| Clientes      | `/clientes`      | Users           |
| Produtos      | `/produtos`      | Package         |
| Vendas        | `/vendas`        | ShoppingCart    |
| Fiados        | `/fiados`        | Wallet          |
| Configurações | `/configuracoes` | Settings        |

Item ativo: fundo `stone-100`, texto `stone-900`, borda esquerda sutil.

---

## Responsividade

| Breakpoint      | Comportamento                                                 |
| --------------- | ------------------------------------------------------------- |
| Mobile (< lg)   | Sidebar vira Sheet (hamburger no Topbar)                      |
| Desktop (>= lg) | Sidebar fixa, conteúdo fluido                                 |
| Tabelas         | Scroll horizontal se necessário; priorizar colunas essenciais |

---

## Estados de interface

| Estado  | Padrão                                                        |
| ------- | ------------------------------------------------------------- |
| Loading | Skeleton nos cards e tabelas; spinner no botão durante submit |
| Empty   | `EmptyState` com mensagem contextual e CTA                    |
| Error   | Toast vermelho discreto + mensagem inline no formulário       |
| Success | Toast verde discreto                                          |

---

## Mapa shadcn → sistema

| Necessidade      | shadcn base                        |
| ---------------- | ---------------------------------- |
| Botões           | Button                             |
| Inputs / selects | Input, Select, Label               |
| Tabelas          | Table                              |
| Cards KPI        | Card                               |
| Status           | Badge (customizado em StatusBadge) |
| Modais           | Dialog                             |
| Menu mobile      | Sheet                              |
| Toasts           | sonner                             |

---

## Documentação relacionada

- Visão do produto: `docs/PROJECT_VISION.md`
- Padrões de código: `docs/CODING_RULES.md`
