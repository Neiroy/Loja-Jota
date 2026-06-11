# Roadmap de Implementação

Plano de execução em 11 fases. Cada fase exige aprovação do usuário antes de iniciar e validação técnica ao concluir.

**Validação obrigatória ao final de cada fase (exceto Fase 1):**

```bash
npm run lint
npm run build
npm run format:check
```

---

## Fase 1 — Arquitetura e documentação ✅

**Status:** Concluída

### Entregáveis

- [x] `docs/PROJECT_VISION.md`
- [x] `docs/SYSTEM_ARCHITECTURE.md`
- [x] `docs/DATABASE_SPEC.md`
- [x] `docs/BUSINESS_RULES.md`
- [x] `docs/UI_DESIGN_SYSTEM.md`
- [x] `docs/SECURITY_SPEC.md`
- [x] `docs/CODING_RULES.md`
- [x] `docs/AI_GUARDRAILS.md`
- [x] `docs/IMPLEMENTATION_ROADMAP.md`

### Critério de conclusão

Documentação completa, alinhada ao escopo, aprovada pelo usuário.

---

## Fase 2 — Setup técnico ✅

**Status:** Concluída

### Entregáveis

- [x] Projeto Next.js (App Router, TypeScript, Tailwind, ESLint)
- [x] shadcn/ui inicializado
- [x] Prettier configurado
- [x] Estrutura de pastas vazia conforme `docs/SYSTEM_ARCHITECTURE.md`
- [x] `.gitignore` com `.env.local`, `node_modules`
- [x] Scripts: `lint`, `build`, `format`, `format:check`

### Critério de conclusão

`npm run lint && npm run build && npm run format:check` passam sem erros.

### Dependências

Fase 1 concluída.

---

## Fase 3 — Supabase e autenticação ✅

**Status:** Concluída

### Entregáveis

- [x] Projeto Supabase criado (remoto)
- [x] Variáveis em `.env.local`
- [x] `src/lib/supabase/server.ts` e `client.ts`
- [x] `src/middleware.ts` protegendo rotas `(protected)/`
- [x] Página de login (`src/app/(auth)/login/`)
- [x] Server Actions: login, logout
- [x] Tabela `profiles` + trigger de signup (SQL em `supabase/migrations/001_profiles.sql`)

### Critério de conclusão

Login e logout funcionais; rotas protegidas redirecionam para `/login`.

### Dependências

Fase 2 concluída.

---

## Fase 4 — Banco de dados e RLS ✅

**Status:** Concluída (arquivos versionados; aplicação manual no Supabase pelo usuário)

### Entregáveis

- [x] `002_enums_and_tables.sql` — enums, tabelas, índices, triggers
- [x] `003_rls_policies.sql` — RLS habilitado com policies MVP
- [x] `src/types/database.types.ts` — tipos base do schema
- [x] `supabase/MIGRATION_GUIDE.md` — guia de aplicação manual
- [ ] RPC `create_sale_with_items` — **adiada para Fase 8**

### Critério de conclusão

Schema aplicado no Supabase; RLS testado; tipos gerados.

### Dependências

Fase 3 concluída.

---

## Fase 5 — Layout premium base ✅

**Status:** Concluída

### Entregáveis

- [x] `Sidebar`, `Topbar`, `PageHeader` (`components/layout/`)
- [x] `AuthCard`, `DashboardCard`, `DataTable`, `StatusBadge`, `EmptyState`, `FormSection`, `ConfirmDialog` (`components/shared/`)
- [x] Layout `(protected)/layout.tsx` com shell completo
- [x] Tema visual conforme `docs/UI_DESIGN_SYSTEM.md`
- [x] Font Inter configurada

### Critério de conclusão

Shell visual premium renderizando; componentes reutilizáveis documentados.

### Dependências

Fases 2 e 3 concluídas.

---

## Fase 6 — Clientes

### Entregáveis

- [x] `customer.schema.ts`, `customer.types.ts`
- [x] `customers.repository.ts`, `customers.service.ts`
- [x] Server Actions: create, update, list, getById
- [x] Páginas: listagem, cadastro, edição, detalhe
- [x] Histórico financeiro no detalhe do cliente (placeholder)

### Critério de conclusão

CRUD completo end-to-end; histórico financeiro visível.

### Dependências

Fases 4 e 5 concluídas.

---

## Fase 7 — Produtos

### Entregáveis

- [x] `product.schema.ts`, `product.types.ts`
- [x] `products.repository.ts`, `products.service.ts`
- [x] Server Actions: create, update, list, getById
- [x] Páginas: listagem, cadastro, edição, detalhe
- [x] Controle de estoque e ativo/inativo

### Critério de conclusão

CRUD completo; estoque editável; produto inativo oculto de vendas.

### Dependências

Fases 4 e 5 concluídas.

---

## Fase 8 — Vendas

### Entregáveis

- [x] `sale.schema.ts`, `sale.types.ts`
- [x] `sales.repository.ts`, `sales.service.ts`
- [x] RPC integrada no service (`004_create_sale_with_items_rpc.sql`)
- [x] Página de criar venda (cliente, itens, desconto, pagamento)
- [x] Listagem e detalhe de vendas
- [x] Cálculo de totais no servidor
- [x] Baixa de estoque automática
- [x] Pagamento à vista (`cash`, `pix`, `card`)
- [x] Venda fiada com criação de receivable (`credit_30_days`)

### Critério de conclusão

Regras 1–3, 5–6, 9–11 de `docs/BUSINESS_RULES.md` validadas.

### Dependências

Fases 6 e 7 concluídas.

---

## Fase 9 — Fiado 30 dias ✅

### Entregáveis

- [x] `receivable.schema.ts`, `receivable.types.ts`
- [x] `receivables.repository.ts`, `receivables.service.ts`
- [x] Criação automática de receivable em venda fiada (Fase 8 / RPC 004)
- [x] Páginas: listagem (`/fiados`) e detalhe (`/fiados/[id]`)
- [x] Filtros: todos, em aberto, vencidos, pagos + busca por cliente
- [x] RPC `mark_receivable_as_paid` (migration 005)
- [x] Ação de quitar fiado (`paid_at`, `payment_method`)
- [x] Sync de `overdue` antes de listar e detalhar
- [x] Link venda ↔ fiado em `sale-receivable-summary`

### Critério de conclusão

Regras 4, 7–9, 12 de `docs/BUSINESS_RULES.md` validadas.

### Fora do escopo desta fase

- Cancelamento de venda ou fiado
- Alteração de estoque na quitação
- Dashboard com KPIs reais
- Campo `notes` na quitação

### Dependências

Fase 8 concluída.

---

## Fase 10 — Dashboard final ✅

### Entregáveis

- [x] `dashboard.repository.ts`, `dashboard.service.ts`, `dashboard.types.ts`
- [x] Cards: vendas do dia, total do mês, fiado aberto, vencidos, clientes com dívida
- [x] Lista de fiados próximos do vencimento (7 dias)
- [x] Lista de vendas recentes
- [x] KPI numérico de clientes com dívida + link para `/fiados`
- [x] Sync de `overdue` antes de carregar dados
- [x] Refinamento visual (remoção de placeholders da Fase 5)

### Critério de conclusão

Dashboard operacional conforme `docs/BUSINESS_RULES.md` seção 9.

### Fora do escopo desta fase

- Gráficos, exportação PDF/Excel, relatórios avançados
- Lista nominal de clientes com dívida
- Migrations, RPC, alteração de banco ou RLS

### Dependências

Fase 9 concluída.

---

## Fase 11 — Validação e acabamento ✅

### Entregáveis

- [x] Responsividade revisada (filtros, espaçamentos, grids)
- [x] Loading states (`loading.tsx`, `TableSkeleton`, `PageLoadingSkeleton`)
- [x] Empty states revisados (listagens, nova venda, configurações, cliente)
- [x] Toasts de sucesso e erro (`sonner`) em ações existentes
- [x] `ListErrorAlert` nas listagens e dashboard (erro não silencioso)
- [x] `ConfirmDialog` async-safe com botões disabled
- [x] `not-found.tsx` protegido
- [x] Limpeza de `confirm-dialog-demo.tsx`
- [x] Remoção de log desnecessário em `auth.service.ts`
- [x] Documentação atualizada (`UI_DESIGN_SYSTEM.md`)
- [x] `npm run lint && npm run build && npm run format:check`

### Critério de conclusão

MVP funcional, visual premium, sem funcionalidades fora do escopo.

### Dependências

Fase 10 concluída.

---

## Pós-MVP — Deploy e homologação

### Etapa 1 — Documentação ✅

- [x] `docs/DEPLOY_GUIDE.md` — guia completo de deploy (Vercel + Supabase)
- [x] `docs/GO_LIVE_CHECKLIST.md` — checklist operacional go-live
- [x] `supabase/README.md` — atualizado (migrations 001–005, links deploy)

### Etapa 2 — Deploy assistido (pendente)

- [ ] Repositório Git remoto conectado à Vercel
- [ ] Homologação: Supabase + Vercel + teste funcional
- [ ] Produção: projeto Supabase separado + go-live

Ver `docs/DEPLOY_GUIDE.md` e `docs/GO_LIVE_CHECKLIST.md`.

---

## Mapa de dependências

```
Fase 1 (Docs) ✅
  └→ Fase 2 (Setup)
       ├→ Fase 3 (Auth)
       └→ Fase 4 (DB/RLS)
            └→ Fase 5 (Layout) ← também depende de Fase 3
                 ├→ Fase 6 (Clientes)
                 └→ Fase 7 (Produtos)
                      └→ Fase 8 (Vendas)
                           └→ Fase 9 (Fiado)
                                └→ Fase 10 (Dashboard)
                                     └→ Fase 11 (Validação)
```

---

## Documentação relacionada

- Visão: `docs/PROJECT_VISION.md`
- Arquitetura: `docs/SYSTEM_ARCHITECTURE.md`
- Guardrails: `docs/AI_GUARDRAILS.md`
