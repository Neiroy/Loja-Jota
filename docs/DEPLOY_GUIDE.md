# Guia de Deploy e Homologação — Sistema Controle Loja Jota

Sistema **interno** de controle da loja. Este guia descreve como colocar o MVP em homologação e produção com segurança.

**Não é e-commerce.** Não há vitrine pública, checkout online, carrinho ou cadastro público de clientes.

---

## 1. Visão geral do deploy

### Arquitetura

```
[Navegador da loja]
       ↓ HTTPS
[Vercel — Next.js 16 App Router]
       ↓
  Middleware (sessão Supabase)
       ↓
  Server Actions → Services → Repositories
       ↓
[Supabase — Auth + PostgreSQL + RPCs]
```

| Componente         | Onde roda           | Responsabilidade                    |
| ------------------ | ------------------- | ----------------------------------- |
| **Frontend + API** | Vercel              | UI, middleware, Server Actions, SSR |
| **Auth**           | Supabase Auth       | Login email/senha, sessão, cookies  |
| **Banco**          | Supabase PostgreSQL | Dados, RLS, RPCs atômicas           |
| **Migrations**     | SQL Editor (manual) | Schema, policies, funções           |

### Princípios

- **Supabase separado do host Next.js** — o deploy do app não aplica SQL; migrations são manuais.
- **Deploy recomendado na Vercel** — suporte nativo a Next.js, middleware, Server Actions e HTTPS.
- **Homologação antes de produção** — validar fluxo operacional completo antes de dados reais.
- **Dois ambientes ideais** — projeto Supabase (e env vars) distintos para homolog e prod.

### Documentação relacionada

| Documento                     | Conteúdo                           |
| ----------------------------- | ---------------------------------- |
| `docs/GO_LIVE_CHECKLIST.md`   | Checklist operacional imprimível   |
| `supabase/MIGRATION_GUIDE.md` | Detalhe das migrations 001–005     |
| `supabase/README.md`          | Referência rápida Supabase         |
| `docs/SECURITY_SPEC.md`       | Regras de segurança                |
| `.env.example`                | Template das variáveis de ambiente |

---

## 2. Variáveis de ambiente obrigatórias

Configurar no **Vercel** (Settings → Environment Variables) e no `.env.local` para desenvolvimento.

| Variável                        | Onde obter                                          | Ambientes                        |
| ------------------------------- | --------------------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Project Settings → API → **Project URL** | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → **anon public** | Production, Preview, Development |

### Desenvolvimento local

Copie `.env.example` para `.env.local` e preencha com os valores do projeto Supabase de **desenvolvimento/homolog**.

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

**Nunca commitar** `.env.local` (já está no `.gitignore`).

### Importante

As variáveis `NEXT_PUBLIC_*` são incluídas no bundle do cliente. Isso é **esperado** — a proteção vem do **RLS**, não do segredo da anon key.

---

## 3. Variáveis que não devem ser usadas

| Variável                    | Motivo                                                                       |
| --------------------------- | ---------------------------------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypassa RLS; **não** está no código do sistema e **não** deve ser adicionada |

O MVP opera exclusivamente com:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` no client e server
- Sessão autenticada do usuário interno
- RLS em todas as tabelas de negócio

---

## 4. Checklist Supabase

Executar **antes** do primeiro deploy funcional.

### Projeto

- [ ] Projeto Supabase criado (região adequada, ex.: South America)
- [ ] Plano definido (Free ok para homolog; avaliar limites para produção)

### Authentication

- [ ] **Email + Password** habilitado (Authentication → Providers → Email)
- [ ] **Sign-up público desabilitado**, se a opção estiver disponível no painel
- [ ] **Site URL** configurada com a URL final do app (Vercel ou domínio customizado)
- [ ] **Redirect URLs** incluem:
  - `https://<sua-url>/auth/callback`
  - `http://localhost:3000/auth/callback` (desenvolvimento)
  - `https://*.vercel.app/auth/callback` (previews Vercel, se usar)
- [ ] Usuários internos criados manualmente: **Authentication → Users → Add user**
- [ ] Senhas fortes; acesso restrito à equipe da loja

### Database — tabelas

Confirmar em **Table Editor** ou via SQL (seção 6):

- [ ] `profiles`
- [ ] `customers`
- [ ] `products`
- [ ] `sales`
- [ ] `sale_items`
- [ ] `receivables`

### Database — RLS

- [ ] RLS ativo (`rowsecurity = true`) em todas as tabelas acima + `profiles`

### Database — RPCs

- [ ] `create_sale_with_items` — vendas atômicas com baixa de estoque e criação de fiado
- [ ] `mark_receivable_as_paid` — quitação atômica de fiado

Detalhes de aplicação: `supabase/MIGRATION_GUIDE.md`.

---

## 5. Checklist de migrations

Migrations em `supabase/migrations/` — aplicar **manualmente** no **SQL Editor**, **na ordem**, **sem pular**.

| Ordem | Arquivo                               | Conteúdo                                     |
| ----- | ------------------------------------- | -------------------------------------------- |
| 1     | `001_profiles.sql`                    | Profiles, trigger de signup, RLS de profiles |
| 2     | `002_enums_and_tables.sql`            | Enums, 5 tabelas, índices, triggers          |
| 3     | `003_rls_policies.sql`                | RLS e policies MVP                           |
| 4     | `004_create_sale_with_items_rpc.sql`  | RPC atômica de vendas                        |
| 5     | `005_mark_receivable_as_paid_rpc.sql` | RPC atômica de quitação de fiado             |

### Por ambiente

- [ ] **Homologação:** migrations 001–005 aplicadas e validadas
- [ ] **Produção:** migrations 001–005 aplicadas e validadas (projeto Supabase separado recomendado)

O app **não funciona** para vendas/fiados se 004 ou 005 estiverem ausentes.

---

## 6. Queries SQL de validação

Executar no **SQL Editor** após aplicar as migrations.

### Tabelas

```sql
select tablename
from pg_tables
where schemaname = 'public'
order by tablename;
```

Esperado: `customers`, `products`, `profiles`, `receivables`, `sale_items`, `sales`.

### RLS

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'customers',
    'products',
    'sales',
    'sale_items',
    'receivables'
  )
order by tablename;
```

Esperado: `rowsecurity = true` em todas.

### RPC `create_sale_with_items`

```sql
select routine_name, routine_type, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'create_sale_with_items';
```

Esperado: uma linha retornada; `security_type = INVOKER`.

### RPC `mark_receivable_as_paid`

```sql
select routine_name, routine_type, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'mark_receivable_as_paid';
```

Esperado: uma linha retornada; `security_type = INVOKER`.

### Permissões (opcional)

```sql
select routine_name, grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name in ('create_sale_with_items', 'mark_receivable_as_paid')
  and grantee = 'authenticated';
```

Esperado: `EXECUTE` para `authenticated` em ambas.

### Policies (opcional)

```sql
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

---

## 7. Checklist Vercel

### Pré-requisitos

- [ ] Código em repositório Git (GitHub, GitLab ou Bitbucket)
- [ ] `.env.local` **não** commitado
- [ ] `npm run build` passa localmente

### Deploy

1. [ ] Acesse [vercel.com](https://vercel.com) e conecte o repositório
2. [ ] Framework detectado: **Next.js** (sem override necessário)
3. [ ] Build Command: `npm run build` (padrão)
4. [ ] Output: padrão Next.js
5. [ ] Configure **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` → URL do projeto Supabase **deste ambiente**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon key **deste ambiente**
6. [ ] Defina escopo: Production / Preview conforme homolog ou prod
7. [ ] **Deploy**
8. [ ] Anote a URL gerada (ex.: `https://sistema-loja-jota.vercel.app`)

### Pós-deploy — Supabase Auth

9. [ ] Supabase → Authentication → URL Configuration
10. [ ] Atualize **Site URL** com a URL da Vercel
11. [ ] Adicione **Redirect URL**: `https://<sua-url-vercel>/auth/callback`
12. [ ] Salve
13. [ ] Redeploy na Vercel **somente se** env vars foram alteradas após o primeiro deploy

### Domínio customizado (opcional, produção)

- [ ] Vercel → Settings → Domains → adicionar domínio
- [ ] Atualizar Site URL e Redirect URLs no Supabase com o domínio final

---

## 8. Checklist funcional pós-deploy

Executar na URL de homologação (e repetir em produção após go-live).

### Auth e navegação

- [ ] Acessar `/dashboard` sem login → redirect para `/login`
- [ ] Login com credenciais inválidas → mensagem amigável
- [ ] Login válido → redirect para `/dashboard`
- [ ] Logout → redirect `/login`; rotas protegidas bloqueadas

### Módulos

- [ ] **Dashboard** — KPIs carregam; listas de fiados próximos e vendas recentes
- [ ] **Clientes** — listar, criar, editar, inativar/reativar
- [ ] **Produtos** — listar, criar, editar, estoque, inativar/reativar
- [ ] **Vendas** — listar, registrar nova venda
- [ ] **Fiados** — listar, detalhe, filtros

### Fluxos críticos

- [ ] **Venda à vista** — estoque baixa; `payment_status = paid`; sem receivable
- [ ] **Venda fiada** (`credit_30_days`) — receivable criado; estoque baixa; venda `pending`
- [ ] **Quitação de fiado** — Pix, dinheiro ou cartão; fiado `paid`; venda `paid`; estoque inalterado na quitação
- [ ] **Dashboard** — KPIs atualizados após venda e quitação
- [ ] Link venda ↔ fiado no detalhe da venda

### Responsividade (amostra)

- [ ] Login e dashboard em mobile
- [ ] Listagens com scroll horizontal em telas estreitas
- [ ] Sidebar mobile (Sheet)

---

## 9. Checklist de segurança

- [ ] `.env.local` fora do Git (`.gitignore` cobre `.env*`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` **não** configurada no Vercel
- [ ] Nenhum secret além de `NEXT_PUBLIC_*` no painel do host
- [ ] Bundle do browser **não** contém service role (DevTools → Sources)
- [ ] RLS ativo em todas as tabelas de negócio
- [ ] Sign-up público desabilitado no Supabase (quando disponível)
- [ ] Usuários criados **manualmente** — sem cadastro público no app
- [ ] HTTPS ativo (padrão Vercel)
- [ ] Rotas protegidas inacessíveis sem sessão válida
- [ ] Sem DELETE físico em `sales`, `sale_items`, `receivables` (policies MVP)
- [ ] Preview Vercel **não** aponta para Supabase de produção

---

## 10. Plano de rollback

### Aplicação (Vercel) — rollback rápido

| Ação                   | Como                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| Voltar versão anterior | Vercel → Deployments → deployment estável → **Promote to Production** |
| Reverter env vars      | Settings → Environment Variables → restaurar valores → redeploy       |
| Pausar acesso          | Remover domínio ou desabilitar deploy automático temporariamente      |

Tempo estimado: **1–5 minutos** para rollback de app.

### Environment variables

- Anotar valores anteriores antes de alterar
- Preview e Production podem ter valores diferentes — reverter por ambiente

### Banco (Supabase) — cuidado

| Situação           | Recomendação                                                   |
| ------------------ | -------------------------------------------------------------- |
| Migration com erro | **Não** aplicar em produção sem testar em homolog              |
| Dados corrompidos  | Restaurar backup Point-in-Time (planos pagos) ou export manual |
| RPC incorreta      | Reaplicar SQL corrigido manualmente; não há `DOWN` versionado  |

**Rollback destrutivo de banco em produção exige backup.** Ativar backup / PITR antes do go-live em produção.

### Auth

- URLs erradas → reverter Site URL / Redirect URLs no Supabase
- Usuário comprometido → reset de senha ou desabilitar usuário no dashboard

### Ordem em incidente

1. Promover deployment anterior no Vercel
2. Se problema for de dados → pausar operação; avaliar backup
3. Corrigir em homolog → validar → redeploy produção

---

## 11. Separação homologação vs produção

### Recomendação

| Recurso          | Homologação                  | Produção                        |
| ---------------- | ---------------------------- | ------------------------------- |
| Projeto Supabase | Projeto **Homolog**          | Projeto **Produção** (separado) |
| Vercel           | Preview ou branch `staging`  | Production (branch `main`)      |
| Env vars         | Anon key do Supabase Homolog | Anon key do Supabase Produção   |
| Usuários         | Contas de teste              | Contas reais da equipe          |
| Dados            | Clientes/produtos fictícios  | Dados reais da loja             |

### Regras

- **Dados de teste não devem ir para produção** — bancos separados evitam contaminação
- **Usuários reais** criados apenas no Supabase de **produção**
- **Previews Vercel** devem usar env vars de **homolog**, nunca de produção
- Validar migrations 001–005 em homolog **antes** de replicar em produção

---

## 12. Ordem recomendada

```
1. Homologação
   ├─ Criar projeto Supabase Homolog
   ├─ Aplicar migrations 001 → 005
   ├─ Validar SQL (seção 6)
   ├─ Criar usuários de teste
   ├─ Deploy Vercel (Preview ou staging)
   ├─ Configurar Auth URLs
   └─ Checklist funcional (seção 8)

2. Teste operacional
   ├─ Equipe da loja usa homolog por alguns dias
   ├─ Fluxo: cliente → produto → venda fiada → quitação
   └─ Ajustes só via nova aprovação (fora deste guia)

3. Produção
   ├─ Criar projeto Supabase Produção
   ├─ Aplicar migrations 001 → 005
   ├─ Backup configurado (se plano permitir)
   ├─ Criar usuários reais
   ├─ Deploy Vercel Production + env vars prod
   ├─ Domínio customizado (opcional)
   ├─ Auth URLs finais
   └─ Checklist funcional + segurança (seções 8–9)
```

---

## Validação local antes do deploy

```bash
npm ci
npm run lint
npm run build
npm run format:check
```

---

## Documentação relacionada

- Checklist operacional: `docs/GO_LIVE_CHECKLIST.md`
- Migrations: `supabase/MIGRATION_GUIDE.md`
- Segurança: `docs/SECURITY_SPEC.md`
- Roadmap: `docs/IMPLEMENTATION_ROADMAP.md`
