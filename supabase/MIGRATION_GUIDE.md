# Guia de Migrations — Sistema Controle Loja Jota

Sistema **interno** multi-loja de controle da loja. Migrations versionadas em `supabase/migrations/` e aplicadas **manualmente** no SQL Editor do Supabase.

## Escopo implementado

Este banco suporta operação interna autenticada com **isolamento por loja (`store_id`)**:

- Cadastro de clientes e produtos por loja
- Registro de vendas e itens (dinheiro, Pix, cartão, fiado 30 dias, Pix/dinheiro parcelado)
- Controle de fiados e parcelas com quitação
- Cancelamento transacional de vendas
- Logo por loja
- Provisionamento administrativo de lojas (via service role no app)

**Não inclui:** e-commerce, vitrine pública, checkout online, gateway de pagamento externo ou emissão fiscal.

---

## Ordem exata de aplicação (001–019)

**Nunca pule a ordem.** Cada migration depende da anterior.

| Ordem | Arquivo                                    | Conteúdo principal                                              |
| ----- | ------------------------------------------ | --------------------------------------------------------------- |
| 1     | `001_profiles.sql`                         | Profiles, sync com auth, RLS inicial                            |
| 2     | `002_enums_and_tables.sql`                 | Enums, tabelas de negócio, índices, triggers                    |
| 3     | `003_rls_policies.sql`                     | RLS MVP (base; substituído por 010 no multi-loja)               |
| 4     | `004_create_sale_with_items_rpc.sql`       | RPC atômica de vendas                                           |
| 5     | `005_mark_receivable_as_paid_rpc.sql`      | RPC atômica de quitação de fiado                                |
| 6     | `006_stores.sql`                           | Tabela `stores` (tenants)                                       |
| 7     | `007_add_store_id_columns.sql`             | Colunas `store_id` (nullable — backfill em 008)                 |
| 8     | `008_backfill_default_store.sql`           | Loja padrão + backfill de `store_id`                            |
| 9     | `009_store_id_not_null_and_indexes.sql`    | `store_id` NOT NULL + índices por loja                          |
| 10    | `010_rls_multi_tenant.sql`                 | RLS por tenant (`current_user_store_id()`)                      |
| 11    | `011_rpc_multi_tenant.sql`                 | RPCs com escopo de loja                                         |
| 12    | `012_update_handle_new_user.sql`           | Trigger signup com `store_id` via metadata                      |
| 13    | `013_store_logo.sql`                       | Logo da loja (storage `store-logos`)                            |
| 14    | `014_tenant_delete_customers_products.sql` | DELETE policies em customers/products                           |
| 15    | `015_lock_profile_store_role.sql`          | Bloqueio de UPDATE de `store_id`/`role` em profiles             |
| 16    | `016_cancel_sale_rpc.sql`                  | RPC `cancel_sale` (estorno de estoque)                          |
| 17    | `017_sale_card_payment.sql`                | Cartão débito/crédito + parcelamento informativo                |
| 18    | `018_sale_installment_financing.sql`       | Pix/dinheiro parcelado, múltiplos receivables, `partially_paid` |
| 19    | `019_lock_profile_insert.sql`              | Remove INSERT permissivo em profiles por authenticated          |

### Blocos por tema

| Bloco               | Migrations | Observação                                                     |
| ------------------- | ---------- | -------------------------------------------------------------- |
| MVP base            | 001–005    | Schema, RLS inicial, vendas e quitação                         |
| Multi-loja          | 006–012    | **Aplicar 006–012 em sequência na mesma janela de manutenção** |
| Branding / DELETE   | 013–014    | Logo e exclusão de clientes/produtos sem histórico             |
| Segurança profiles  | 015, 019   | Proteção de `store_id`, `role` e INSERT                        |
| Financeiro avançado | 016–018    | Cancelamento, cartão, parcelamento                             |

---

## Como aplicar no Supabase SQL Editor

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard) → projeto → **SQL Editor**
2. Para cada arquivo em `supabase/migrations/`, na ordem **001 → 019**:
   - **New query** → copie todo o conteúdo do arquivo → **Run**
3. Em ambiente existente com dados, faça **backup** antes de 006–012
4. Confirme pré-requisitos indicados no cabeçalho de cada migration

### Atalho de validação pós-aplicação

```sql
-- Tabelas esperadas
select tablename from pg_tables
where schemaname = 'public'
order by tablename;

-- RPCs principais
select routine_name from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'create_sale_with_items',
    'mark_receivable_as_paid',
    'cancel_sale',
    'current_user_store_id'
  )
order by routine_name;
```

Esperado entre as tabelas: `customers`, `products`, `profiles`, `receivables`, `sale_items`, `sales`, `stores`.

---

## RPCs principais (estado atual)

### `create_sale_with_items` (004, atualizada em 011, 017, 018)

Responsabilidades:

- Validar loja do usuário (`current_user_store_id()`)
- Validar cliente e produtos ativos; estoque suficiente
- Calcular totais no banco
- Criar `sales` + `sale_items`; baixar estoque
- **À vista** (`cash`, `pix`, cartão débito/crédito): `payment_status = paid`
- **Fiado 30 dias**: 1 receivable, `payment_status = pending`
- **Pix/dinheiro parcelado** (018): N receivables + entrada opcional; `partially_paid` ou `paid`
- **Cartão crédito** (017): parcelas **informativas** apenas; venda continua `paid`

### `mark_receivable_as_paid` (005, atualizada em 011, 018)

- Quitação de parcela ou fiado único
- Atualiza receivable (`paid`, `paid_at`, `payment_method`)
- Atualiza `sales.payment_status` para `paid` ou `partially_paid` conforme parcelas restantes

### `cancel_sale` (016, atualizada em 018)

- Bloqueia se venda já cancelada ou se existir receivable `paid`
- Devolve estoque; marca venda `cancelled`; cancela receivables `open`/`overdue`

---

## Checklist de validação pós-migration

### Schema

- [ ] Enums: `payment_method`, `sale_payment_status` (incl. `partially_paid`), `receivable_status`, `card_payment_type`
- [ ] Tabelas: `stores`, `profiles`, `customers`, `products`, `sales`, `sale_items`, `receivables`
- [ ] Colunas `store_id` NOT NULL nas tabelas de negócio

### RLS

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'stores', 'profiles', 'customers', 'products',
    'sales', 'sale_items', 'receivables'
  );
```

- [ ] `rowsecurity = true` em todas

### Segurança de profiles (015 + 019)

- [ ] Usuário authenticated **não** consegue INSERT em `profiles` via API
- [ ] Usuário authenticated **não** consegue alterar `store_id` ou `role` do próprio profile

### DELETE bloqueado (dados financeiros)

- [ ] `DELETE FROM sales` → negado
- [ ] `DELETE FROM sale_items` → negado
- [ ] `DELETE FROM receivables` → negado

### App

- [ ] Login, logout e rotas protegidas funcionando
- [ ] Venda à vista, fiado, parcelamento, cartão e cancelamento operacionais

---

## Documentação relacionada

- `docs/DATABASE_SPEC.md` — schema detalhado
- `docs/SECURITY_SPEC.md` — auth, RLS, service role
- `docs/BUSINESS_RULES.md` — regras financeiras
- `docs/DEPLOY_GUIDE.md` — deploy e env vars
- `supabase/README.md` — referência rápida
