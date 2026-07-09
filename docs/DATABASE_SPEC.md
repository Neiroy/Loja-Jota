# Especificação do Banco de Dados

Banco: **PostgreSQL** via **Supabase**, **multi-loja** com RLS por `store_id`.

Policies detalhadas: `docs/SECURITY_SPEC.md`. Migrations: `supabase/MIGRATION_GUIDE.md`.

---

## Enums

### `sale_payment_status`

| Valor            | Descrição                                       |
| ---------------- | ----------------------------------------------- |
| `paid`           | Venda quitada (à vista ou todas parcelas pagas) |
| `pending`        | Fiado 30 dias aguardando pagamento              |
| `partially_paid` | Parcelas pendentes (Pix/dinheiro parcelado)     |
| `cancelled`      | Venda cancelada                                 |

### `receivable_status`

| Valor       | Descrição                               |
| ----------- | --------------------------------------- |
| `open`      | Em aberto, dentro do prazo              |
| `paid`      | Quitado                                 |
| `overdue`   | Vencido (`due_date < hoje`, era `open`) |
| `cancelled` | Cancelado (venda cancelada)             |

### `payment_method`

| Valor            | Descrição     |
| ---------------- | ------------- |
| `cash`           | Dinheiro      |
| `pix`            | PIX           |
| `card`           | Cartão        |
| `credit_30_days` | Fiado 30 dias |

### `card_payment_type` (017)

| Valor    | Descrição      |
| -------- | -------------- |
| `debit`  | Cartão débito  |
| `credit` | Cartão crédito |

---

## Tabelas

### `stores` (006)

| Coluna       | Tipo          | Notas                         |
| ------------ | ------------- | ----------------------------- |
| `id`         | `uuid`        | PK                            |
| `name`       | `text`        | NOT NULL                      |
| `slug`       | `text`        | UNIQUE                        |
| `is_active`  | `boolean`     | default `true`                |
| `logo_path`  | `text`        | nullable (013) — storage path |
| `created_at` | `timestamptz` |                               |
| `updated_at` | `timestamptz` |                               |

### `profiles`

| Coluna       | Tipo          | Notas                         |
| ------------ | ------------- | ----------------------------- |
| `id`         | `uuid`        | PK, FK → `auth.users`         |
| `full_name`  | `text`        | NOT NULL                      |
| `role`       | `text`        | `admin` \| `operator`         |
| `store_id`   | `uuid`        | FK → `stores`, NOT NULL (009) |
| `created_at` | `timestamptz` |                               |
| `updated_at` | `timestamptz` |                               |

**Segurança (015, 019):**

- INSERT autenticado **bloqueado** — profile via trigger (012) ou service role
- UPDATE de `store_id`/`role` **bloqueado** para usuário (015)

### `customers`, `products`, `sales`, `sale_items`, `receivables`

Todas possuem `store_id uuid NOT NULL` (007–009). Demais colunas conforme MVP (002), com extensões abaixo.

### `sales` — colunas adicionais

| Coluna                         | Migration | Descrição                             |
| ------------------------------ | --------- | ------------------------------------- |
| `card_payment_type`            | 017       | `debit` \| `credit` quando `card`     |
| `installments_count`           | 017       | Parcelas cartão crédito (informativo) |
| `down_payment`                 | 018       | Entrada em Pix/dinheiro parcelado     |
| `financing_installments_count` | 018       | N parcelas Pix/dinheiro               |

### `receivables` — relação com vendas

| Coluna               | Migration | Descrição                  |
| -------------------- | --------- | -------------------------- |
| `installment_number` | 018       | Número da parcela (1..N)   |
| `installments_total` | 018       | Total de parcelas da venda |

- **Antes (005):** 1 receivable por venda (`sale_id` UNIQUE)
- **Atual (018):** N receivables por venda — UNIQUE `(sale_id, installment_number)`
- Fiado 30 dias: 1 receivable com `installments_total = 1`
- Pix/dinheiro parcelado: N receivables + entrada opcional

---

## Funções e RPCs

### `current_user_store_id()` (010)

Retorna `profiles.store_id` do usuário autenticado. Usada em policies e RPCs.

### `create_sale_with_items` (004 → 011 → 017 → 018)

Transação atômica. Parâmetros incluem (conforme versão):

- `customer_id`, `discount`, `payment_method`, `items[]`
- `card_payment_type`, `installments_count` (cartão)
- `down_payment`, `financing_installments_count` (Pix/dinheiro parcelado)

Comportamento resumido:

| Forma de pagamento  | `payment_status`           | Receivables                    |
| ------------------- | -------------------------- | ------------------------------ |
| cash, pix (à vista) | `paid`                     | nenhum                         |
| card débito         | `paid`                     | nenhum                         |
| card crédito        | `paid`                     | nenhum (parcelas informativas) |
| credit_30_days      | `pending`                  | 1 receivable                   |
| cash/pix parcelado  | `partially_paid` ou `paid` | N receivables                  |

### `mark_receivable_as_paid` (005 → 011 → 018)

- Quita uma parcela ou fiado único
- Atualiza `sales.payment_status` para `paid` ou `partially_paid`

### `cancel_sale` (016 → 018)

- Bloqueia se receivable `paid` existir
- Devolve estoque; `sales.payment_status = cancelled`; receivables `open`/`overdue` → `cancelled`

---

## Status `overdue`

Cálculo na leitura pelo Service (sem cron):

- `receivables` com `status = open` e `due_date < hoje` → atualizar para `overdue`

---

## Política de exclusão

| Tabela        | DELETE físico                               |
| ------------- | ------------------------------------------- |
| `sales`       | **Proibido** — usar cancelamento            |
| `sale_items`  | **Proibido**                                |
| `receivables` | **Proibido** — usar `status = cancelled`    |
| `customers`   | Permitido (014) se sem histórico financeiro |
| `products`    | Permitido (014) se sem itens vinculados     |
| `profiles`    | Gerenciado pelo Supabase Auth / admin       |

---

## Diagrama de relacionamentos

```
stores (1) ←── (N) profiles
stores (1) ←── (N) customers, products, sales, receivables

customers (1) ──→ (N) sales
products  (1) ──→ (N) sale_items
sales     (1) ──→ (N) sale_items
sales     (1) ──→ (0..N) receivables
customers (1) ──→ (N) receivables
```

---

## Documentação relacionada

- Regras: `docs/BUSINESS_RULES.md`
- Segurança: `docs/SECURITY_SPEC.md`
- Migrations: `supabase/MIGRATION_GUIDE.md`
