# Especificação de Segurança

---

## Autenticação

| Item     | Implementação                              |
| -------- | ------------------------------------------ |
| Provedor | Supabase Auth                              |
| Método   | Email + senha (principal)                  |
| Sessão   | Cookies httpOnly via SSR (`@supabase/ssr`) |
| Login    | `/login` (rota pública)                    |
| Callback | `/auth/callback` (rota pública, OAuth)     |
| Logout   | Server Action que invalida sessão          |
| Perfil   | Tabela `profiles` vinculada a `auth.users` |

### Fluxo de autenticação

```
1. Proxy (src/proxy.ts) renova sessão Supabase e protege rotas
2. Sem sessão em rota protegida → redirect /login?redirectTo=...
3. Layout (protected) valida profile + store_id + loja ativa
4. Server Actions validam sessão antes de operar
5. Queries respeitam RLS multi-loja (store_id do usuário)
```

### Validações pós-login

- Usuário **sem loja** (`profiles.store_id` nulo): sign-out + mensagem
- **Loja inativa** (`stores.is_active = false`): sign-out + mensagem
- Callback OAuth: `ensureValidSessionOrSignOut()` + `getSafeRedirectPath()`

---

## Autorização

### Implementado

| Papel      | Acesso operacional                                                         | Provisionamento de lojas                             |
| ---------- | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| `operator` | Vendas, clientes, produtos, fiados, configurações (exceto gerenciar lojas) | **Negado**                                           |
| `admin`    | Igual ao operador + gerenciar lojas                                        | **Permitido** (se `STORE_PROVISIONING_ENABLED=true`) |

- `profiles.role`: `admin` | `operator`
- Guard server-side em `/configuracoes/lojas` (`canManageStores()`)
- Server Actions de lojas exigem `requireStoreProvisioner()`

### Futuro (não implementado)

- Permissões granulares por módulo para operador (ex.: ocultar configurações)

---

## Row Level Security (RLS)

RLS **habilitado** em: `stores`, `profiles`, `customers`, `products`, `sales`, `sale_items`, `receivables`.

### Multi-loja (migration 010+)

Isolamento via `public.current_user_store_id()` — retorna `profiles.store_id` do usuário autenticado.

| Tabela        | Escopo principal                                             |
| ------------- | ------------------------------------------------------------ |
| `stores`      | SELECT da própria loja                                       |
| `profiles`    | SELECT/UPDATE do próprio profile; INSERT bloqueado (019)     |
| `customers`   | CRUD filtrado por `store_id`                                 |
| `products`    | CRUD filtrado por `store_id`                                 |
| `sales`       | SELECT/INSERT/UPDATE filtrado por `store_id`; writes via RPC |
| `sale_items`  | SELECT/INSERT filtrado por `store_id`                        |
| `receivables` | SELECT/INSERT/UPDATE filtrado por `store_id`                 |

**DELETE físico:** proibido em tabelas financeiras. Customers/products: DELETE permitido via policies 014 quando sem histórico vinculado.

### Proteção de profiles (015 + 019)

- **015:** trigger/policy impede UPDATE de `store_id` e `role` pelo usuário
- **019:** remove policy de INSERT autenticado — profile criado apenas por:
  - trigger `handle_new_user` (012)
  - service role (provisionamento admin)

---

## Validação de entrada

1. **Zod** em Server Actions
2. Sanitização: `trim()`, limites de tamanho
3. CPF: formato (11 dígitos)
4. Valores monetários: `numeric(12,2)`; arredondamento no servidor
5. UUIDs validados antes de queries
6. Quantidades: inteiros positivos

---

## Proteção de secrets

| Variável                        | Onde usar                     | Nunca expor   |
| ------------------------------- | ----------------------------- | ------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Server (SSR)                  | —             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Server (SSR)                  | —             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only (provisionamento) | Client bundle |
| `STORE_PROVISIONING_ENABLED`    | Server only (gate de feature) | Client bundle |

- `.env.local` no `.gitignore`
- Nunca commitar secrets

---

## Server-only

Módulos sensíveis com `import 'server-only'`:

- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/middleware.ts` (helper de sessão usado pelo proxy)
- `src/lib/tenant/get-current-store.ts`
- `src/lib/tenant/require-store-provisioner.ts`
- `src/lib/auth/ensure-valid-session.ts`
- `src/features/stores/services/store-provisioning.service.ts`
- Repositories `*-admin.repository.ts`

### Client Supabase

**Removido.** Não existe `src/lib/supabase/client.ts`. Login e logout usam Server Actions + `server.ts`.

### Admin Client (`src/lib/supabase/admin.ts`)

Somente provisionamento de lojas:

- Requer `SUPABASE_SERVICE_ROLE_KEY`
- Requer `STORE_PROVISIONING_ENABLED=true`
- Requer `profiles.role === 'admin'`
- Usado em `stores-admin`, `auth-admin`, `profiles-admin` repositories
- **Nunca** importar em Client Components

---

## Proteção de rotas (`src/proxy.ts`)

Next.js 16 usa `proxy.ts` (substitui `middleware.ts`):

- Rotas públicas: `/login`, `/auth/*`
- Rotas protegidas: `/dashboard`, `/clientes`, `/produtos`, `/vendas`, `/fiados`, `/configuracoes`
- Logado em `/login` → `/dashboard`
- Sem sessão → `/login?redirectTo=<rota>`
- Validação de tenant/loja: **layout protegido**, não no proxy

---

## Dados financeiros

1. **Sem DELETE físico** em `sales`, `sale_items`, `receivables`
2. Cancelamento via RPC `cancel_sale` → `payment_status = cancelled`
3. Bloqueio de cancelamento se receivable `paid` existir
4. `paid_at` imutável após quitação
5. Operações financeiras apenas server-side (Services + RPCs)

---

## CSRF e headers

- Server Actions possuem proteção CSRF nativa do Next.js
- HTTPS em produção (Vercel / Supabase)
- Headers padrão do Next.js

---

## Checklist de segurança (produção)

- [ ] Migrations 001–019 aplicadas (incl. 015 e 019)
- [ ] RLS multi-loja ativo
- [ ] Proxy protegendo rotas
- [ ] Layout bloqueia sessão sem loja / loja inativa
- [ ] Operador não acessa provisionamento
- [ ] Service role apenas server-side (se habilitada)
- [ ] Nenhum secret no client bundle
- [ ] `.env.local` não commitado

---

## Documentação relacionada

- Banco: `docs/DATABASE_SPEC.md`
- Regras: `docs/BUSINESS_RULES.md`
- Arquitetura: `docs/SYSTEM_ARCHITECTURE.md`
- Deploy: `docs/DEPLOY_GUIDE.md`
