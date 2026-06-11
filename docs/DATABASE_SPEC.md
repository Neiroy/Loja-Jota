# Especificação do Banco de Dados

Banco: **PostgreSQL** via **Supabase**.

Todas as tabelas possuem **RLS habilitado**. Detalhes de policies em `docs/SECURITY_SPEC.md`.

---

## Enums

### `sale_payment_status`

| Valor       | Descrição                             |
| ----------- | ------------------------------------- |
| `paid`      | Venda quitada (à vista ou fiado pago) |
| `pending`   | Venda fiada aguardando pagamento      |
| `cancelled` | Venda cancelada                       |

### `receivable_status`

| Valor       | Descrição                                     |
| ----------- | --------------------------------------------- |
| `open`      | Fiado em aberto, dentro do prazo              |
| `paid`      | Fiado quitado                                 |
| `overdue`   | Fiado vencido (due_date < hoje e estava open) |
| `cancelled` | Fiado cancelado (venda cancelada)             |

### `payment_method`

| Valor            | Descrição     |
| ---------------- | ------------- |
| `cash`           | Dinheiro      |
| `pix`            | PIX           |
| `card`           | Cartão        |
| `credit_30_days` | Fiado 30 dias |

---

## Tabelas

### `profiles`

Espelha usuários autenticados do Supabase Auth.

| Coluna       | Tipo          | Constraints                                 |
| ------------ | ------------- | ------------------------------------------- |
| `id`         | `uuid`        | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `full_name`  | `text`        | NOT NULL                                    |
| `role`       | `text`        | NOT NULL, default `'operator'`              |
| `created_at` | `timestamptz` | NOT NULL, default `now()`                   |
| `updated_at` | `timestamptz` | NOT NULL, default `now()`                   |

**Notas:**

- Criado via trigger no signup (`auth.users` → `profiles`)
- `role` preparado para evolução futura; MVP trata todos os autenticados igualmente

---

### `customers`

| Coluna       | Tipo          | Constraints                     |
| ------------ | ------------- | ------------------------------- |
| `id`         | `uuid`        | PK, default `gen_random_uuid()` |
| `name`       | `text`        | NOT NULL                        |
| `phone`      | `text`        | nullable                        |
| `cpf`        | `text`        | nullable, UNIQUE                |
| `notes`      | `text`        | nullable                        |
| `is_active`  | `boolean`     | NOT NULL, default `true`        |
| `created_at` | `timestamptz` | NOT NULL, default `now()`       |
| `updated_at` | `timestamptz` | NOT NULL, default `now()`       |

---

### `products`

| Coluna           | Tipo            | Constraints                         |
| ---------------- | --------------- | ----------------------------------- |
| `id`             | `uuid`          | PK, default `gen_random_uuid()`     |
| `name`           | `text`          | NOT NULL                            |
| `category`       | `text`          | nullable                            |
| `size`           | `text`          | nullable                            |
| `color`          | `text`          | nullable                            |
| `sale_price`     | `numeric(12,2)` | NOT NULL, CHECK `>= 0`              |
| `stock_quantity` | `integer`       | NOT NULL, default `0`, CHECK `>= 0` |
| `is_active`      | `boolean`       | NOT NULL, default `true`            |
| `created_at`     | `timestamptz`   | NOT NULL, default `now()`           |
| `updated_at`     | `timestamptz`   | NOT NULL, default `now()`           |

---

### `sales`

| Coluna           | Tipo                  | Constraints                         |
| ---------------- | --------------------- | ----------------------------------- |
| `id`             | `uuid`                | PK, default `gen_random_uuid()`     |
| `customer_id`    | `uuid`                | NOT NULL, FK → `customers(id)`      |
| `sale_date`      | `date`                | NOT NULL, default `CURRENT_DATE`    |
| `subtotal`       | `numeric(12,2)`       | NOT NULL, CHECK `>= 0`              |
| `discount`       | `numeric(12,2)`       | NOT NULL, default `0`, CHECK `>= 0` |
| `total`          | `numeric(12,2)`       | NOT NULL, CHECK `>= 0`              |
| `payment_method` | `payment_method`      | NOT NULL (enum)                     |
| `payment_status` | `sale_payment_status` | NOT NULL (enum)                     |
| `created_at`     | `timestamptz`         | NOT NULL, default `now()`           |
| `updated_at`     | `timestamptz`         | NOT NULL, default `now()`           |

**Constraints adicionais:**

- CHECK `total = subtotal - discount`
- CHECK `discount <= subtotal`

---

### `sale_items`

| Coluna       | Tipo            | Constraints                                   |
| ------------ | --------------- | --------------------------------------------- |
| `id`         | `uuid`          | PK, default `gen_random_uuid()`               |
| `sale_id`    | `uuid`          | NOT NULL, FK → `sales(id)` ON DELETE RESTRICT |
| `product_id` | `uuid`          | NOT NULL, FK → `products(id)`                 |
| `quantity`   | `integer`       | NOT NULL, CHECK `> 0`                         |
| `unit_price` | `numeric(12,2)` | NOT NULL, CHECK `>= 0`                        |
| `total`      | `numeric(12,2)` | NOT NULL, CHECK `>= 0`                        |
| `created_at` | `timestamptz`   | NOT NULL, default `now()`                     |

**Constraints adicionais:**

- CHECK `total = quantity * unit_price`
- `unit_price` é snapshot do preço no momento da venda

---

### `receivables`

| Coluna           | Tipo                | Constraints                        |
| ---------------- | ------------------- | ---------------------------------- |
| `id`             | `uuid`              | PK, default `gen_random_uuid()`    |
| `sale_id`        | `uuid`              | NOT NULL, FK → `sales(id)`, UNIQUE |
| `customer_id`    | `uuid`              | NOT NULL, FK → `customers(id)`     |
| `amount`         | `numeric(12,2)`     | NOT NULL, CHECK `> 0`              |
| `due_date`       | `date`              | NOT NULL                           |
| `status`         | `receivable_status` | NOT NULL (enum)                    |
| `paid_at`        | `timestamptz`       | nullable                           |
| `payment_method` | `payment_method`    | nullable (forma usada na quitação) |
| `notes`          | `text`              | nullable                           |
| `created_at`     | `timestamptz`       | NOT NULL, default `now()`          |
| `updated_at`     | `timestamptz`       | NOT NULL, default `now()`          |

**Notas:**

- Relação 1:1 com `sales` (apenas vendas fiadas geram receivable)
- `payment_method` na quitação é `cash`, `pix` ou `card` (nunca `credit_30_days`)

---

## Índices sugeridos

```sql
-- customers
CREATE INDEX idx_customers_is_active ON customers (is_active);
CREATE UNIQUE INDEX idx_customers_cpf ON customers (cpf) WHERE cpf IS NOT NULL;

-- products
CREATE INDEX idx_products_is_active ON products (is_active);

-- sales
CREATE INDEX idx_sales_customer_id ON sales (customer_id);
CREATE INDEX idx_sales_sale_date ON sales (sale_date DESC);
CREATE INDEX idx_sales_payment_status ON sales (payment_status);

-- sale_items
CREATE INDEX idx_sale_items_sale_id ON sale_items (sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items (product_id);

-- receivables
CREATE INDEX idx_receivables_customer_id ON receivables (customer_id);
CREATE INDEX idx_receivables_status ON receivables (status);
CREATE INDEX idx_receivables_due_date ON receivables (due_date) WHERE status IN ('open', 'overdue');
```

---

## Triggers

### `updated_at` automático

Aplicar em: `profiles`, `customers`, `products`, `sales`, `receivables`.

```sql
-- Função genérica set_updated_at()
-- Trigger BEFORE UPDATE em cada tabela
```

### Sync `profiles` no signup

```sql
-- Trigger AFTER INSERT ON auth.users
-- Insere row em profiles com full_name do metadata ou email
```

---

## Função RPC: `create_sale_with_items`

Transação atômica para criação de venda. Chamada pelo `sales.service.ts`.

**Entrada (JSON):**

- `customer_id`, `sale_date`, `discount`, `payment_method`
- `items[]`: `{ product_id, quantity }`

**Fluxo interno:**

1. Validar cliente ativo
2. Para cada item: validar produto ativo e estoque suficiente
3. Calcular `unit_price` (snapshot de `products.sale_price`), `item.total`, `subtotal`, `total`
4. Inserir `sales` + `sale_items`
5. Baixar `products.stock_quantity` de cada item
6. Se `payment_method = credit_30_days`:
   - Inserir `receivables` com `amount = total`, `due_date = sale_date + 30`, `status = open`
   - `sales.payment_status = pending`
7. Se à vista (`cash`, `pix`, `card`):
   - `sales.payment_status = paid`
   - Não criar receivable
8. Retornar `sale_id` ou erro (rollback automático)

---

## Status `overdue`

**Estratégia MVP:** cálculo na leitura pelo Service.

Ao listar receivables com `status = open` e `due_date < CURRENT_DATE`:

1. Atualizar `status` para `overdue` via repository
2. Retornar lista atualizada

Sem job/cron no MVP. Evolução futura: pg_cron diário.

---

## Política de exclusão

| Tabela        | DELETE físico                                                           |
| ------------- | ----------------------------------------------------------------------- |
| `sales`       | **Proibido** — usar `payment_status = cancelled`                        |
| `sale_items`  | **Proibido**                                                            |
| `receivables` | **Proibido** — usar `status = cancelled`                                |
| `customers`   | Permitido apenas se sem vendas vinculadas; preferir `is_active = false` |
| `products`    | Permitido apenas se sem itens vinculados; preferir `is_active = false`  |
| `profiles`    | Gerenciado pelo Supabase Auth                                           |

Cancelamento de venda deve devolver estoque (ver `docs/BUSINESS_RULES.md`).

---

## Diagrama de relacionamentos

```
profiles (1) ←→ auth.users (1)

customers (1) ──→ (N) sales
products  (1) ──→ (N) sale_items
sales     (1) ──→ (N) sale_items
sales     (1) ──→ (0..1) receivables
customers (1) ──→ (N) receivables
```

---

## Documentação relacionada

- Regras de negócio: `docs/BUSINESS_RULES.md`
- Segurança / RLS: `docs/SECURITY_SPEC.md`
- Arquitetura: `docs/SYSTEM_ARCHITECTURE.md`
