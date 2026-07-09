# Supabase — Sistema Controle Loja Jota

Sistema **interno multi-loja**. Banco PostgreSQL + Auth no Supabase; migrations versionadas e aplicadas **manualmente** no SQL Editor.

## Migrations (001–019)

| Ordem | Arquivo                                    | Descrição resumida            |
| ----- | ------------------------------------------ | ----------------------------- |
| 1     | `001_profiles.sql`                         | Profiles, trigger signup, RLS |
| 2     | `002_enums_and_tables.sql`                 | Enums, tabelas de negócio     |
| 3     | `003_rls_policies.sql`                     | RLS MVP (base)                |
| 4     | `004_create_sale_with_items_rpc.sql`       | RPC de vendas                 |
| 5     | `005_mark_receivable_as_paid_rpc.sql`      | RPC de quitação               |
| 6     | `006_stores.sql`                           | Tabela `stores`               |
| 7     | `007_add_store_id_columns.sql`             | Colunas `store_id`            |
| 8     | `008_backfill_default_store.sql`           | Backfill multi-loja           |
| 9     | `009_store_id_not_null_and_indexes.sql`    | NOT NULL + índices            |
| 10    | `010_rls_multi_tenant.sql`                 | RLS por tenant                |
| 11    | `011_rpc_multi_tenant.sql`                 | RPCs multi-loja               |
| 12    | `012_update_handle_new_user.sql`           | Trigger signup com loja       |
| 13    | `013_store_logo.sql`                       | Logo por loja                 |
| 14    | `014_tenant_delete_customers_products.sql` | DELETE clientes/produtos      |
| 15    | `015_lock_profile_store_role.sql`          | Protege `store_id`/`role`     |
| 16    | `016_cancel_sale_rpc.sql`                  | Cancelamento de venda         |
| 17    | `017_sale_card_payment.sql`                | Cartão débito/crédito         |
| 18    | `018_sale_installment_financing.sql`       | Pix/dinheiro parcelado        |
| 19    | `019_lock_profile_insert.sql`              | Bloqueia INSERT em profiles   |

**Guia completo:** `MIGRATION_GUIDE.md`

## Aplicação rápida

1. Supabase Dashboard → **SQL Editor**
2. Execute na ordem **001 → 019** (sem pular)
3. Valide com queries em `MIGRATION_GUIDE.md` ou `docs/DEPLOY_GUIDE.md`

## Variáveis de ambiente

Configure no `.env.local` (dev) ou Vercel. **Não commitar secrets.**

### Obrigatórias

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

### Opcionais — provisionamento de lojas (server-only)

Necessárias apenas se **Configurações → Gerenciar lojas** estiver habilitado:

```env
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
STORE_PROVISIONING_ENABLED=true
```

A service role **bypassa RLS** — usar **somente no servidor**, nunca no client bundle. Ver `docs/SECURITY_SPEC.md`.

## Usuários internos

- Criar em **Authentication → Users → Add user**, ou
- Via provisionamento admin no app (requer env vars acima + `profiles.role = admin`)

Não há cadastro público no app.

## Deploy e homologação

- **App:** Vercel (Next.js 16) — `docs/DEPLOY_GUIDE.md`
- **Checklist:** `docs/GO_LIVE_CHECKLIST.md`
- Projeto Supabase **separado** para homolog e produção (recomendado)

## Documentação relacionada

- `supabase/MIGRATION_GUIDE.md`
- `docs/DEPLOY_GUIDE.md`
- `docs/DATABASE_SPEC.md`
- `docs/SECURITY_SPEC.md`
