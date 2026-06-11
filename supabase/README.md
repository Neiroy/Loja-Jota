# Supabase — Sistema Controle Loja Jota

Sistema **interno** de controle da loja. Banco PostgreSQL + Auth hospedados no Supabase; migrations versionadas e aplicadas **manualmente** no SQL Editor.

## Migrations

| Ordem | Arquivo                                          | Descrição                          |
| ----- | ------------------------------------------------ | ---------------------------------- |
| 1     | `migrations/001_profiles.sql`                    | Profiles, trigger de signup, RLS   |
| 2     | `migrations/002_enums_and_tables.sql`            | Enums, tabelas de negócio, índices |
| 3     | `migrations/003_rls_policies.sql`                | RLS e policies MVP                 |
| 4     | `migrations/004_create_sale_with_items_rpc.sql`  | RPC atômica de vendas              |
| 5     | `migrations/005_mark_receivable_as_paid_rpc.sql` | RPC atômica de quitação de fiado   |

**Guia completo:** `MIGRATION_GUIDE.md`

## Aplicação rápida

1. Supabase Dashboard → **SQL Editor**
2. Execute na ordem: `001` → `002` → `003` → `004` → `005`
3. Valide com as queries em `MIGRATION_GUIDE.md` ou `docs/DEPLOY_GUIDE.md`

## Variáveis de ambiente

Configure no `.env.local` (desenvolvimento) ou no host (Vercel). **Não commitar.**

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

**Não usar** `SUPABASE_SERVICE_ROLE_KEY` neste sistema.

## Usuários internos

Criar em **Authentication → Users → Add user**. Não há cadastro público no app.

## Deploy e homologação

- **Deploy do app:** Vercel (Next.js) — ver `docs/DEPLOY_GUIDE.md`
- **Checklist go-live:** `docs/GO_LIVE_CHECKLIST.md`
- Recomenda-se projeto Supabase **separado** para homologação e produção

## Documentação relacionada

- `supabase/MIGRATION_GUIDE.md`
- `docs/DEPLOY_GUIDE.md`
- `docs/GO_LIVE_CHECKLIST.md`
- `docs/DATABASE_SPEC.md`
- `docs/SECURITY_SPEC.md`
