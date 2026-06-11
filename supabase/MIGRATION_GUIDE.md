# Guia de Migrations — Sistema Controle Loja Jota

Sistema **interno** de controle da loja. Migrations versionadas em `supabase/migrations/` e aplicadas **manualmente** no SQL Editor do Supabase.

## Escopo

Este banco suporta operação interna autenticada:

- Cadastro de clientes e produtos
- Registro de vendas e itens
- Controle de fiados (30 dias)
- Histórico financeiro

**Não inclui:** e-commerce, vitrine pública, checkout, Mercado Pago, multi-loja ou emissão fiscal.

---

## Ordem exata de aplicação

| Ordem | Arquivo                               | Conteúdo                             |
| ----- | ------------------------------------- | ------------------------------------ |
| 1     | `001_profiles.sql`                    | Profiles, auth sync, RLS de profiles |
| 2     | `002_enums_and_tables.sql`            | Enums, 5 tabelas, índices, triggers  |
| 3     | `003_rls_policies.sql`                | RLS e policies MVP                   |
| 4     | `004_create_sale_with_items_rpc.sql`  | RPC atômica de vendas                |
| 5     | `005_mark_receivable_as_paid_rpc.sql` | RPC atômica de quitação de fiado     |

**Nunca pule a ordem.** Cada migration depende da anterior.

---

## Como aplicar no Supabase SQL Editor

### Passo 1 — Confirmar `001_profiles.sql`

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Abra o projeto
3. Vá em **Table Editor** e confirme que `profiles` existe
4. Se não existir, aplique `001_profiles.sql` primeiro

### Passo 2 — Aplicar `002_enums_and_tables.sql`

1. Vá em **SQL Editor → New query**
2. Copie todo o conteúdo de `supabase/migrations/002_enums_and_tables.sql`
3. Execute (**Run**)
4. Confirme em **Table Editor**:
   - `customers`
   - `products`
   - `sales`
   - `sale_items`
   - `receivables`

### Passo 3 — Aplicar `003_rls_policies.sql`

1. Nova query no SQL Editor
2. Copie todo o conteúdo de `supabase/migrations/003_rls_policies.sql`
3. Execute (**Run**)
4. Confirme RLS em **Authentication → Policies** ou via query abaixo

### Passo 4 — Aplicar `004_create_sale_with_items_rpc.sql` (Fase 8)

1. Nova query no SQL Editor
2. Copie todo o conteúdo de `supabase/migrations/004_create_sale_with_items_rpc.sql`
3. Execute (**Run**)
4. Confirme a função:

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'create_sale_with_items';
```

5. Confirme permissão de execução para `authenticated`

### Passo 5 — Aplicar `005_mark_receivable_as_paid_rpc.sql` (Fase 9)

1. Nova query no SQL Editor
2. Copie todo o conteúdo de `supabase/migrations/005_mark_receivable_as_paid_rpc.sql`
3. Execute (**Run**)
4. Confirme a função:

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'mark_receivable_as_paid';
```

5. Confirme permissão de execução para `authenticated`

---

## Checklist de validação pós-migration

### Schema

- [ ] Enums: `payment_method`, `sale_payment_status`, `receivable_status`
- [ ] Tabelas: `customers`, `products`, `sales`, `sale_items`, `receivables`
- [ ] `profiles` permanece intacta

### Constraints (testar no SQL Editor)

```sql
-- Deve falhar: estoque negativo
insert into public.products (name, sale_price, stock_quantity)
values ('Teste', 10.00, -1);

-- Deve falhar: quantidade zero
insert into public.sale_items (sale_id, product_id, quantity, unit_price, total)
values ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 0, 10.00, 0);
```

- [ ] Insert com `stock_quantity = -1` → **erro**
- [ ] Insert com `quantity = 0` em `sale_items` → **erro**

### RLS

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('customers', 'products', 'sales', 'sale_items', 'receivables');
```

- [ ] `rowsecurity = true` em todas as 5 tabelas

### DELETE bloqueado (dados financeiros)

Com usuário autenticado no app ou via policy test:

- [ ] `DELETE FROM sales` → **negado**
- [ ] `DELETE FROM sale_items` → **negado**
- [ ] `DELETE FROM receivables` → **negado**

### Triggers

- [ ] `UPDATE` em `customers` atualiza `updated_at`

### App

- [ ] Login continua funcionando
- [ ] Logout continua funcionando
- [ ] Rotas protegidas continuam bloqueadas sem sessão

---

## Verificar policies criadas

```sql
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Esperado:

| Tabela      | Policies                    |
| ----------- | --------------------------- |
| customers   | SELECT, INSERT, UPDATE      |
| products    | SELECT, INSERT, UPDATE      |
| sales       | SELECT, INSERT, UPDATE      |
| sale_items  | SELECT, INSERT (sem UPDATE) |
| receivables | SELECT, INSERT, UPDATE      |

Nenhuma policy DELETE nas tabelas acima.

---

## RPC `create_sale_with_items` (Fase 8)

A função `create_sale_with_items` está em `004_create_sale_with_items_rpc.sql`.

Responsabilidades:

- Validar cliente ativo
- Validar produtos ativos e estoque
- Calcular preços e totais no banco
- Criar `sales` + `sale_items`
- Baixar estoque
- Criar `receivables` quando `payment_method = credit_30_days`
- Rollback total em qualquer erro

**Importante:** o app de vendas só funciona após aplicar a migration 004.

---

## RPC `mark_receivable_as_paid` (Fase 9)

A função `mark_receivable_as_paid` está em `005_mark_receivable_as_paid_rpc.sql`.

Responsabilidades:

- Validar receivable existente
- Permitir quitação apenas com status `open` ou `overdue`
- Bloquear quitação de fiado já `paid` ou `cancelled`
- Aceitar somente `cash`, `pix` ou `card` (bloquear `credit_30_days`)
- Atualizar `receivables`: `status = paid`, `paid_at = now()`, `payment_method`
- Atualizar `sales` vinculada: `payment_status = paid`
- Rollback total em qualquer erro
- Retornar `receivable_id`

**Importante:** a quitação de fiados no app só funciona após aplicar a migration 005.

---

## Documentação relacionada

- `docs/DATABASE_SPEC.md`
- `docs/SECURITY_SPEC.md`
- `docs/BUSINESS_RULES.md`
- `supabase/README.md`
