# Especificação de Segurança

---

## Autenticação

| Item       | Implementação                                   |
| ---------- | ----------------------------------------------- |
| Provedor   | Supabase Auth                                   |
| Método MVP | Email + senha                                   |
| Sessão     | Cookies httpOnly via SSR (`@supabase/ssr`)      |
| Login      | `/login` (rota pública)                         |
| Callback   | `/auth/callback` (rota pública)                 |
| Logout     | Server Action que invalida sessão               |
| Perfil     | Tabela `profiles` sincronizada com `auth.users` |

### Fluxo de autenticação

```
1. Usuário acessa rota protegida
2. Middleware verifica sessão Supabase
3. Sem sessão → redirect para /login
4. Com sessão → permite acesso
5. Server Actions validam sessão antes de operar
```

---

## Autorização

### MVP

- Qualquer usuário autenticado acessa todas as funcionalidades
- `profiles.role` existe para evolução futura (valores: `admin`, `operator`)
- Sem distinção de permissões no MVP

### Evolução futura (fora do MVP)

- `admin`: acesso total + configurações
- `operator`: vendas, clientes, produtos, fiados (sem configurações)

---

## Row Level Security (RLS)

RLS **habilitado em todas as tabelas**: `profiles`, `customers`, `products`, `sales`, `sale_items`, `receivables`.

### Policies MVP

```sql
-- Padrão para todas as tabelas:
-- SELECT, INSERT, UPDATE: auth.uid() IS NOT NULL
-- DELETE: restrito ou desabilitado (ver DATABASE_SPEC.md)
```

| Tabela        | SELECT        | INSERT          | UPDATE        | DELETE            |
| ------------- | ------------- | --------------- | ------------- | ----------------- |
| `profiles`    | own row       | trigger only    | own row       | cascade from auth |
| `customers`   | authenticated | authenticated   | authenticated | desabilitado      |
| `products`    | authenticated | authenticated   | authenticated | desabilitado      |
| `sales`       | authenticated | via RPC/service | status only   | desabilitado      |
| `sale_items`  | authenticated | via RPC/service | desabilitado  | desabilitado      |
| `receivables` | authenticated | via RPC/service | authenticated | desabilitado      |

---

## Validação de entrada

1. **Zod** em 100% das Server Actions
2. Sanitização: `trim()` em strings, limites de tamanho
3. CPF: validação de formato (11 dígitos); dígitos verificadores opcional no MVP
4. Valores monetários: `numeric(12,2)`, nunca `float` no JS
5. UUIDs: validar formato antes de queries
6. Quantidades: inteiros positivos

---

## Proteção de secrets

| Variável                        | Onde usar                              | Nunca expor   |
| ------------------------------- | -------------------------------------- | ------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Client + Server                        | —             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server                        | —             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only (provisionamento de lojas) | Client bundle |

- Arquivo `.env.local` para desenvolvimento
- `.env.local` no `.gitignore`
- Nunca commitar secrets

---

## Server-only

- Operações de escrita sempre via Server Actions
- Supabase Server Client (`src/lib/supabase/server.ts`) apenas em:
  - Server Actions
  - Services (indiretamente via Repositories)
  - Repositories
  - Middleware
- Client Supabase (`src/lib/supabase/client.ts`) apenas para auth UI (login form)
- Supabase Admin Client (`src/lib/supabase/admin.ts`) **somente** para provisionamento de lojas:
  - Requer `SUPABASE_SERVICE_ROLE_KEY` no servidor
  - Requer `STORE_PROVISIONING_ENABLED=true`
  - Requer `profiles.role === 'admin'`
  - Usado em `stores-admin.repository.ts`, `auth-admin.repository.ts`, `profiles-admin.repository.ts`
  - **Nunca** importar em Client Components

---

## Dados financeiros

1. **Sem DELETE físico** em `sales`, `sale_items`, `receivables`
2. Cancelamento via `status = cancelled`
3. `paid_at` registrado uma vez na quitação; imutável no MVP
4. Toda alteração de status financeiro passa pelo Service (auditoria via timestamps)

---

## CSRF e headers

- Server Actions do Next.js possuem proteção CSRF nativa
- Produção sempre em HTTPS (Vercel / Supabase default)
- Headers de segurança padrão do Next.js em produção

---

## Middleware (`src/middleware.ts`)

```typescript
// Rotas públicas: /login, /auth/*
// Todas as outras: exigir sessão válida
// Redirect não autenticado → /login?redirectTo=<rota>
```

---

## Checklist de segurança por fase

### Fase 3 (Auth)

- [ ] Login funcional com Supabase Auth
- [ ] Middleware protegendo `(protected)/`
- [ ] Logout invalida sessão
- [ ] `profiles` criado no signup

### Fase 4 (DB/RLS)

- [ ] RLS habilitado em todas as tabelas
- [ ] Policies testadas com usuário autenticado
- [ ] Acesso negado sem sessão
- [ ] Tipos gerados sem expor service role

### Fase 8+ (Operações)

- [ ] Toda entrada validada com Zod
- [ ] Nenhum secret no client bundle (`next build` + inspeção)
- [ ] Operações financeiras apenas server-side

### Fase 11 (Validação final)

- [ ] Teste de acesso não autenticado a rotas protegidas
- [ ] Teste de acesso não autenticado a Server Actions
- [ ] `.env.local` não commitado

---

## Documentação relacionada

- Banco de dados: `docs/DATABASE_SPEC.md`
- Regras de negócio: `docs/BUSINESS_RULES.md`
- Arquitetura: `docs/SYSTEM_ARCHITECTURE.md`
