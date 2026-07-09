# Checklist Go-Live — Sistema Controle Loja Jota

Checklist operacional para homologação e produção. Marque cada item antes de liberar o sistema para uso real.

Guia completo: **`docs/DEPLOY_GUIDE.md`**

---

## Ambiente

| Campo            | Homolog | Produção |
| ---------------- | ------- | -------- |
| URL Vercel       |         |          |
| Projeto Supabase |         |          |
| Data do deploy   |         |          |
| Responsável      |         |          |

---

## A. Pré-deploy local

- [ ] `npm run lint` — passou
- [ ] `npm run build` — passou
- [ ] `npm run format:check` — passou
- [ ] Código em repositório Git remoto
- [ ] `.env.local` **não** commitado

---

## B. Variáveis de ambiente

### Obrigatórias (Vercel)

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Opcionais — provisionamento de lojas (server-only)

Somente se **Gerenciar lojas** estiver habilitado:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` — configurada **apenas** no servidor (Vercel env vars)
- [ ] `STORE_PROVISIONING_ENABLED=true`
- [ ] Service role **não** aparece no bundle do browser (DevTools → Sources)

### Proibido no client

- [ ] Nenhuma variável `NEXT_PUBLIC_*` contendo service role ou secrets não públicos

---

## C. Supabase — Auth

- [ ] Email + senha habilitado
- [ ] Sign-up público desabilitado (se disponível)
- [ ] Site URL = URL do app deste ambiente
- [ ] Redirect URL inclui `https://<url>/auth/callback`
- [ ] Redirect URL inclui `http://localhost:3000/auth/callback` (dev)
- [ ] Usuário(s) interno(s) criado(s) ou provisionados

---

## D. Supabase — Migrations (SQL Editor, ordem exata 001–019)

- [ ] `001_profiles.sql`
- [ ] `002_enums_and_tables.sql`
- [ ] `003_rls_policies.sql`
- [ ] `004_create_sale_with_items_rpc.sql`
- [ ] `005_mark_receivable_as_paid_rpc.sql`
- [ ] `006_stores.sql`
- [ ] `007_add_store_id_columns.sql`
- [ ] `008_backfill_default_store.sql`
- [ ] `009_store_id_not_null_and_indexes.sql`
- [ ] `010_rls_multi_tenant.sql`
- [ ] `011_rpc_multi_tenant.sql`
- [ ] `012_update_handle_new_user.sql`
- [ ] `013_store_logo.sql`
- [ ] `014_tenant_delete_customers_products.sql`
- [ ] `015_lock_profile_store_role.sql`
- [ ] `016_cancel_sale_rpc.sql`
- [ ] `017_sale_card_payment.sql`
- [ ] `018_sale_installment_financing.sql`
- [ ] `019_lock_profile_insert.sql`

---

## E. Supabase — Validação SQL

### Tabelas

```sql
select tablename from pg_tables where schemaname = 'public' order by tablename;
```

- [ ] `stores`, `profiles`, `customers`, `products`, `sales`, `sale_items`, `receivables`

### RLS

```sql
select tablename, rowsecurity from pg_tables
where schemaname = 'public'
  and tablename in (
    'stores','profiles','customers','products',
    'sales','sale_items','receivables'
  );
```

- [ ] Todas com `rowsecurity = true`

### RPCs

```sql
select routine_name from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'create_sale_with_items',
    'mark_receivable_as_paid',
    'cancel_sale',
    'current_user_store_id'
  );
```

- [ ] RPCs principais existem e `authenticated` pode executar

---

## F. Vercel

- [ ] Repositório importado
- [ ] Framework: Next.js
- [ ] Environment variables configuradas (seção B)
- [ ] Deploy concluído com sucesso
- [ ] URL anotada
- [ ] Supabase Auth URLs atualizadas com URL da Vercel
- [ ] Redeploy (se env vars alteradas após 1º deploy)

---

## G. Segurança

- [ ] HTTPS ativo
- [ ] RLS multi-loja ativo (`store_id` por tenant)
- [ ] Service role apenas server-side (se provisioning habilitado)
- [ ] Cadastro público bloqueado
- [ ] Rotas protegidas exigem login + loja ativa
- [ ] Operador não acessa `/configuracoes/lojas`
- [ ] Preview Vercel **não** usa Supabase de produção
- [ ] Migration 019 aplicada (INSERT em profiles bloqueado)

---

## H. Teste funcional pós-deploy

### Auth

- [ ] `/dashboard` sem login → `/login`
- [ ] Login inválido → erro amigável
- [ ] Login válido (loja ativa) → dashboard
- [ ] Login sem loja / loja inativa → mensagem + sessão encerrada
- [ ] Logout → sessão encerrada
- [ ] `redirectTo` seguro após login

### Módulos

- [ ] Dashboard — KPIs e listas
- [ ] Clientes — CRUD + status
- [ ] Produtos — CRUD + estoque + status
- [ ] Vendas — listagem + nova venda + detalhe + cancelamento
- [ ] Fiados — listagem + detalhe + filtros + quitação
- [ ] Configurações — logo, overview; admin vê “Gerenciar lojas”

### Fluxos críticos

- [ ] Venda à vista (dinheiro / Pix) — estoque baixa; sem receivable
- [ ] Venda cartão débito — `paid`; sem receivable
- [ ] Venda cartão crédito parcelado — informativo; `paid`
- [ ] Venda Pix/dinheiro parcelado — N receivables; `partially_paid` ou `paid`
- [ ] Venda fiada 30 dias — receivable criado; estoque baixa
- [ ] Quitar parcela/fiado — status atualizado; venda `paid` ou `partially_paid`
- [ ] Cancelamento — bloqueado se parcela já paga; estoque devolvido se permitido
- [ ] Dashboard — não soma vendas canceladas
- [ ] Lembrete WhatsApp no detalhe do fiado
- [ ] Link venda ↔ fiado

### Mobile (amostra)

- [ ] Login
- [ ] Dashboard
- [ ] Uma listagem com scroll horizontal + um formulário

---

## I. Homolog vs produção

- [ ] Homolog testado antes de produção
- [ ] Projeto Supabase de produção **separado** de homolog
- [ ] Dados de teste **não** migrados para produção
- [ ] Usuários reais criados **apenas** em produção
- [ ] Backup Supabase configurado (produção, se plano permitir)

---

## J. Rollback (anotar antes do go-live)

| Item                               | Valor / procedimento                    |
| ---------------------------------- | --------------------------------------- |
| Deployment Vercel estável anterior |                                         |
| Env vars anteriores                |                                         |
| Contato / responsável técnico      |                                         |
| Procedimento                       | Vercel → Deployments → Promote previous |

---

## Liberação

- [ ] Homologação aprovada pela equipe da loja
- [ ] Produção deployada e checklist H completo
- [ ] Equipe treinada nos fluxos: cliente → produto → venda → quitação/cancelamento

**Assinatura / data de go-live:** (preencher)

---

## Documentação relacionada

- `docs/DEPLOY_GUIDE.md`
- `supabase/MIGRATION_GUIDE.md`
- `docs/SECURITY_SPEC.md`
