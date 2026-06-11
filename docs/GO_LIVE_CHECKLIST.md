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

### Obrigatórias (configurar no Vercel)

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Proibidas

- [ ] `SUPABASE_SERVICE_ROLE_KEY` **não** configurada

---

## C. Supabase — Auth

- [ ] Email + senha habilitado
- [ ] Sign-up público desabilitado (se disponível)
- [ ] Site URL = URL do app deste ambiente
- [ ] Redirect URL inclui `https://<url>/auth/callback`
- [ ] Redirect URL inclui `http://localhost:3000/auth/callback` (dev)
- [ ] Usuário(s) interno(s) criado(s) manualmente

---

## D. Supabase — Migrations (SQL Editor, ordem exata)

- [ ] `001_profiles.sql`
- [ ] `002_enums_and_tables.sql`
- [ ] `003_rls_policies.sql`
- [ ] `004_create_sale_with_items_rpc.sql`
- [ ] `005_mark_receivable_as_paid_rpc.sql`

---

## E. Supabase — Validação SQL

### Tabelas

```sql
select tablename from pg_tables where schemaname = 'public' order by tablename;
```

- [ ] `profiles`, `customers`, `products`, `sales`, `sale_items`, `receivables`

### RLS

```sql
select tablename, rowsecurity from pg_tables
where schemaname = 'public'
  and tablename in ('profiles','customers','products','sales','sale_items','receivables');
```

- [ ] Todas com `rowsecurity = true`

### RPCs

```sql
select routine_name from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('create_sale_with_items', 'mark_receivable_as_paid');
```

- [ ] `create_sale_with_items` existe
- [ ] `mark_receivable_as_paid` existe

---

## F. Vercel

- [ ] Repositório importado
- [ ] Framework: Next.js
- [ ] Environment variables configuradas (seção B)
- [ ] Deploy concluído com sucesso
- [ ] URL anotada: (preencher após deploy)
- [ ] Supabase Auth URLs atualizadas com URL da Vercel
- [ ] Redeploy (se env vars alteradas após 1º deploy)

---

## G. Segurança

- [ ] HTTPS ativo
- [ ] RLS ativo
- [ ] Sem service role no host nem no código
- [ ] Cadastro público bloqueado
- [ ] Rotas protegidas exigem login
- [ ] Preview Vercel **não** usa Supabase de produção

---

## H. Teste funcional pós-deploy

### Auth

- [ ] `/dashboard` sem login → `/login`
- [ ] Login inválido → erro amigável
- [ ] Login válido → dashboard
- [ ] Logout → sessão encerrada

### Módulos

- [ ] Dashboard — KPIs e listas
- [ ] Clientes — CRUD + status
- [ ] Produtos — CRUD + estoque + status
- [ ] Vendas — listagem + nova venda
- [ ] Fiados — listagem + detalhe + filtros

### Fluxos críticos

- [ ] Venda à vista — estoque baixa; sem fiado
- [ ] Venda fiada — receivable criado; estoque baixa
- [ ] Quitar fiado (Pix / dinheiro / cartão) — fiado e venda `paid`
- [ ] Estoque inalterado na quitação
- [ ] Link venda ↔ fiado

### Mobile (amostra)

- [ ] Login
- [ ] Dashboard
- [ ] Uma listagem + um formulário

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
- [ ] Equipe treinada no fluxo: cliente → produto → venda fiada → quitação

**Assinatura / data de go-live:** (preencher)

---

## Documentação relacionada

- `docs/DEPLOY_GUIDE.md`
- `supabase/MIGRATION_GUIDE.md`
- `docs/SECURITY_SPEC.md`
