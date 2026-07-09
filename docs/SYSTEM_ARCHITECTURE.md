# Arquitetura do Sistema

## Fluxo obrigatório de dados

```
Page / RSC
  → Server Action
    → Service
      → Repository
        → Supabase Server Client
          → Database (PostgreSQL + RLS)
```

Nenhuma camada pode pular a anterior. Pages **nunca** acessam Repository ou Supabase diretamente.

## Responsabilidades por camada

### Pages / RSC (`src/app/`)

- Renderizar páginas e layouts
- Guards server-side quando necessário (ex.: `/configuracoes/lojas`)
- Compor componentes de `components/` e `features/`
- **Não** conter regra de negócio complexa

### Server Actions (`src/features/*/actions/`)

- Receber dados de formulários
- Validar com Zod (`src/schemas/`)
- Chamar Service
- Retornar resultado padronizado

### Services (`src/services/` e `src/features/*/services/`)

- Regras de negócio
- Orquestração de RPCs e repositories
- Resolução de tenant via `getCurrentStoreId()`
- **Não** acessar Supabase diretamente

### Repositories (`src/repositories/`)

- Queries Supabase com filtro `store_id`
- Repositories `*-admin` para operações com service role (provisionamento)

## Estrutura de pastas (resumo)

```
src/
├── app/
│   ├── (auth)/login/
│   ├── auth/callback/
│   └── (protected)/
│       ├── dashboard/, clientes/, produtos/
│       ├── vendas/, fiados/, configuracoes/
│       └── layout.tsx          # gate tenant + AppShell
├── features/
│   ├── auth/, dashboard/, customers/, products/
│   ├── sales/, receivables/, settings/, stores/
├── lib/
│   ├── supabase/               # server.ts, admin.ts, middleware.ts
│   ├── tenant/                 # get-current-store, require-store-provisioner
│   └── auth/                   # ensure-valid-session, login-error-messages
├── repositories/
├── services/
├── schemas/
└── types/
```

## Autenticação e proteção de rotas

| Camada   | Arquivo                            | Função                                                   |
| -------- | ---------------------------------- | -------------------------------------------------------- |
| Proxy    | `src/proxy.ts`                     | Sessão Supabase; redirects login/dashboard               |
| Layout   | `src/app/(protected)/layout.tsx`   | `ensureValidSessionOrSignOut()` — loja ativa obrigatória |
| Login    | Server Actions + `auth.service.ts` | Valida credenciais + profile + loja                      |
| Callback | `src/app/auth/callback/route.ts`   | OAuth + validação de sessão                              |

Rotas públicas: `/login`, `/auth/callback`.

**Nota:** `src/middleware.ts` foi substituído por `src/proxy.ts` (Next.js 16). Não existe `client.ts` — auth 100% server-side.

## Multi-loja

- Tabela `stores`; `store_id` em profiles e tabelas de negócio
- RLS via `current_user_store_id()` (migration 010)
- Branding por loja (logo, monograma) via `getCurrentStoreBranding()`
- Provisionamento admin em `features/stores/` (opcional, service role)

## Transações financeiras (RPCs)

| RPC                       | Uso                                   |
| ------------------------- | ------------------------------------- |
| `create_sale_with_items`  | Venda + itens + estoque + receivables |
| `mark_receivable_as_paid` | Quitação de fiado/parcela             |
| `cancel_sale`             | Cancelamento + estorno de estoque     |

Detalhes em `docs/DATABASE_SPEC.md`.

## Server Components vs Client Components

- Server Component por padrão
- `'use client'` apenas para formulários, dialogs, filtros interativos, toasts
- Dados sensíveis nunca buscados no client via Supabase

## Anti-patterns (proibido)

- Page chamando Repository ou Supabase diretamente
- API Routes para CRUD interno
- Lógica de negócio em components
- Totais aceitos do client sem recálculo no servidor
- DELETE físico em tabelas financeiras
- Expor `SUPABASE_SERVICE_ROLE_KEY` no client bundle
- Importar módulos `server-only` em Client Components

## Documentação relacionada

- Regras: `docs/BUSINESS_RULES.md`
- Banco: `docs/DATABASE_SPEC.md`
- Segurança: `docs/SECURITY_SPEC.md`
- Deploy: `docs/DEPLOY_GUIDE.md`
