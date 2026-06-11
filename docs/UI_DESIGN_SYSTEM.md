# Design System — Visual Premium

Sistema interno com aparência profissional, minimalista e elegante. Poucas informações por tela. Uso diário rápido e sem fricção.

**Status:** Refinamento Visual Premium Global **concluído** (Etapas 1–4).

---

## Conceito: quiet luxury operacional

Direção visual aplicada em todo o sistema:

- Fundo off-white sofisticado (`#F7F6F3`) — calmo, sem frieza de branco puro
- Superfícies brancas com bordas suaves (`stone-200/80`) e sombras leves (`shadow-sm`)
- Hierarquia tipográfica clara; poucas cores; badges discretos
- Inputs e botões confortáveis (`h-9`); tabelas com header uppercase
- Layout premium: sidebar elegante, topbar translúcida com blur sutil
- Zero excesso decorativo; aparência de produto profissional interno

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

| Token          | Valor                        | Uso                                                            |
| -------------- | ---------------------------- | -------------------------------------------------------------- |
| Background     | `#F7F6F3` (off-white quente) | Fundo principal da aplicação (`--background` em `globals.css`) |
| Surface        | `#FFFFFF`                    | Cards, modais, sidebar                                         |
| Border         | `#E8E6E3` / `stone-200/80`   | Bordas suaves de cards e inputs                                |
| Text primary   | `#1C1917` (grafite)          | Títulos, dados principais                                      |
| Text secondary | `#78716C`                    | Subtítulos, labels, metadados                                  |
| Text muted     | `#A8A29E`                    | Placeholders, hints                                            |

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

| Elemento      | Estilo                                                       |
| ------------- | ------------------------------------------------------------ |
| Font family   | Inter (via `next/font`)                                      |
| Page title    | `text-2xl font-semibold tracking-tight text-stone-900`       |
| Page subtitle | `text-sm text-stone-500`                                     |
| Section title | `text-lg font-semibold text-stone-900`                       |
| Body          | `text-sm text-stone-700`                                     |
| Table data    | `text-sm text-stone-700`                                     |
| Table header  | `text-xs font-medium tracking-wide text-stone-500 uppercase` |
| Label         | `text-sm font-medium text-stone-700`                         |
| Detail label  | `text-xs font-medium tracking-wide text-stone-500 uppercase` |
| KPI value     | `text-3xl font-semibold tracking-tight text-stone-900`       |
| KPI label     | `text-sm text-stone-500`                                     |

---

## Espaçamento e superfícies

| Elemento          | Estilo                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Page padding      | `p-6 lg:p-8`                                                           |
| Gap entre seções  | `space-y-6` ou `gap-6`                                                 |
| Surface card      | `.surface-card` ou `surfaceCardClassName` (`src/lib/surface.ts`)       |
| Surface muted     | `.surface-muted` — headers de tabela, footers de dialog/card           |
| Card              | `bg-white rounded-xl border border-stone-200/80 shadow-sm`             |
| Card padding      | `p-6`                                                                  |
| Input / select    | `h-9 rounded-lg border-stone-200/80 bg-white px-3 focus:ring-2`        |
| Button default    | `h-9 bg-stone-900 text-white hover:bg-stone-800 rounded-lg shadow-sm`  |
| Button secondary  | `bg-white border border-stone-200/80 text-stone-700 hover:bg-stone-50` |
| Sidebar width     | `w-64` (desktop)                                                       |
| Topbar height     | `h-14` sticky com `backdrop-blur-md`                                   |
| Content max-width | `max-w-7xl mx-auto`                                                    |

Sombras: leves (`shadow-sm`), nunca pesadas. Bordas: `rounded-lg` a `rounded-xl`.

### Tokens CSS (`src/app/globals.css`)

Variáveis shadcn alinhadas à paleta stone/off-white:

- `--background: #f7f6f3`
- `--border` / `--input`: tom quente suave (OKLCH ~0.91)
- `--ring`: foco discreto em stone
- Utilitários em `@layer components`: `.surface-card`, `.surface-muted`

### Utilitário de superfície (`src/lib/surface.ts`)

| Export                  | Uso                                              |
| ----------------------- | ------------------------------------------------ |
| `surfaceCardClassName`  | Cards, filtros, tabelas, empty states            |
| `surfaceMutedClassName` | Headers de tabela, footers de dialog/card        |
| `fieldControlClassName` | Inputs nativos e `<select>` em filtros (`h-9`)   |
| `surfaceCard()`         | Helper `cn()` para composição com classes extras |

---

## Componentes obrigatórios

Todos em `src/components/`, usando shadcn/ui como base refinada.

### Layout (`components/layout/`)

| Componente       | Descrição                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| `AppShell`       | Shell principal: sidebar + coluna (topbar + main); fundo `bg-background`; `overflow-x-hidden` no main |
| `Sidebar`        | Menu lateral fixo (desktop): monograma LJ, nome + subtítulo, nav com item ativo refinado              |
| `SidebarNavLink` | Link de navegação com estado ativo (`border-l-2`, `bg-stone-100/80`) e hover discreto                 |
| `Topbar`         | Barra sticky: blur sutil (`bg-white/80 backdrop-blur-md`), botão Sair; sem nome de usuário            |
| `MobileSidebar`  | Sheet lateral (mobile): mesmo branding da sidebar; fecha ao navegar                                   |
| `PageHeader`     | Título + subtítulo opcional + slot para ação primária à direita                                       |

### Compartilhados (`components/shared/`)

| Componente            | Descrição                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `AuthCard`            | Card centralizado para login; logo/nome da loja; fundo off-white na página                                  |
| `DashboardCard`       | Card de KPI: label, valor grande, ícone discreto opcional                                                   |
| `DataTable`           | Tabela organizada com header sticky, hover sutil, paginação simples                                         |
| `StatusBadge`         | Badge semântico: Pago, Em aberto, Vencido, Cancelado                                                        |
| `EmptyState`          | Ilustração/ícone + mensagem + ação opcional; para listas vazias                                             |
| `FormSection`         | Agrupamento de campos com título de seção e espaçamento generoso                                            |
| `ConfirmDialog`       | Dialog de confirmação assíncrono; permanece aberto até a ação concluir                                      |
| `ListErrorAlert`      | Banner de erro quando falha o carregamento de listagens ou dashboard                                        |
| `TableSkeleton`       | Placeholder discreto para tabelas durante carregamento                                                      |
| `PageLoadingSkeleton` | Skeleton genérico para navegação entre rotas protegidas                                                     |
| `FilterPanel`         | Wrapper visual de filtros de listagem (`form` + surface card); usado em clientes, produtos, vendas e fiados |
| `DetailField`         | Par label/valor para telas de detalhe (label uppercase); usado em detalhes e configurações                  |

### Base (`components/ui/`)

Primitives shadcn/ui refinados visualmente:

| Componente | Padrão aplicado                                                                |
| ---------- | ------------------------------------------------------------------------------ |
| `Button`   | `h-9` default; variantes stone; foco `ring-2` discreto                         |
| `Input`    | `h-9`, fundo branco, borda `stone-200/80`, placeholder `stone-400`             |
| `Textarea` | Bordas e foco alinhados ao Input; `min-h-24`                                   |
| `Label`    | `text-sm font-medium text-stone-700`                                           |
| `Table`    | Header uppercase (`text-xs tracking-wide text-stone-500`); hover `stone-50/80` |
| `Card`     | `border-stone-200/80` + `shadow-sm` (sem ring pesado)                          |
| `Badge`    | `h-6`, `rounded-full`, paleta stone discreta                                   |
| `Dialog`   | Overlay com blur leve; conteúdo branco com padding generoso                    |
| `Sheet`    | Bordas stone; usado no menu mobile                                             |
| `Skeleton` | `rounded-lg`, `bg-stone-200/50`                                                |

### Feedback (`sonner`)

- Toasts para sucesso/erro em ações sem redirect (toggle status, quitar fiado)
- Erros de formulário permanecem **inline** (`fieldErrors` + `text-destructive`)
- Erros de carregamento usam `ListErrorAlert` (não toast)
- Estilo discreto: borda `stone-200/80`, fundo branco, cantos `rounded-xl`

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
- `FilterPanel` com busca e selects de status/pagamento (`fieldControlClassName` nos selects)
- `DataTable` com colunas essenciais (máx. 6–7); header uppercase via primitivo `Table`
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

### Detalhe (cliente, produto, venda, fiado)

- `FormSection` com grid `sm:grid-cols-2`
- Campos via `DetailField` (label uppercase + valor)
- Badges de status discretos (`StatusBadge`, badges de módulo)
- Links internos com `Button` variant `link`

### Detalhe do cliente

- Dados do cliente no topo (card)
- Abas ou seções: Vendas, Fiados em aberto, Fiados pagos
- `StatusBadge` em cada registro financeiro

### Configurações (`/configuracoes`)

- `PageHeader` com título e subtítulo informativo
- Grid responsivo `lg:grid-cols-2` com surface cards (`border-stone-200/80`, `shadow-sm`)
- Ícone Lucide discreto no título de cada seção (`stone-100/80` / `stone-600`)
- Campos somente leitura via `DetailField` (re-export `SettingsDetailField`)
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
| Vendas        | `/vendas`        | ReceiptText     |
| Fiados        | `/fiados`        | Wallet          |
| Configurações | `/configuracoes` | Settings        |

### Header da sidebar

- Monograma **LJ** em quadrado `bg-stone-900` (`rounded-lg`)
- Título **Loja Jota** + subtítulo **Controle interno**
- Borda inferior `border-stone-200/80`

### Item de navegação

- **Ativo:** `border-l-2 border-stone-900`, `bg-stone-100/80`, texto `stone-900`
- **Inativo:** `text-stone-500`, hover `bg-stone-50/80`

---

## Responsividade

| Breakpoint      | Comportamento                                                            |
| --------------- | ------------------------------------------------------------------------ |
| Mobile (< lg)   | Sidebar oculta; `MobileSidebar` (Sheet) via hamburger no Topbar          |
| Desktop (>= lg) | Sidebar fixa `w-64`; conteúdo fluido em `max-w-7xl`                      |
| AppShell        | `min-w-0` + `overflow-x-hidden` no main — sem scroll horizontal indevido |
| Tabelas         | Scroll horizontal apenas no container da tabela; colunas essenciais      |
| Topbar mobile   | Título "Loja Jota" truncado; botão Sair preservado                       |

---

## Refinamento Visual Premium Global (concluído)

| Etapa | Escopo                                                                      | Status |
| ----- | --------------------------------------------------------------------------- | ------ |
| 1     | Tokens em `globals.css`, `surface.ts`, documentação base                    | ✅     |
| 2     | Primitivos UI: Button, Input, Table, Card, Dialog, Badge, Skeleton, etc.    | ✅     |
| 3     | Shared: FilterPanel, DetailField, FormSection, DataTable, EmptyState, etc.  | ✅     |
| 4     | Layout: AppShell, Sidebar premium, Topbar blur, MobileSidebar, polish final | ✅     |

Critério de encerramento: visual consistente em todas as telas; sem alteração de lógica de negócio.

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
- Roadmap: `docs/IMPLEMENTATION_ROADMAP.md`
