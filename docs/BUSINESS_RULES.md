# Regras de Negócio

Documento formal das regras do domínio. Alterações exigem aprovação explícita.

---

## 1. Vendas — estrutura obrigatória

1. Toda venda precisa ter **pelo menos um item**.
2. Toda venda deve calcular no servidor:
   - `subtotal` = soma de `sale_items.total`
   - `discount` = desconto informado (>= 0, <= subtotal)
   - `total` = `subtotal - discount`
3. `unit_price` de cada item é snapshot de `products.sale_price` no momento da venda.
4. `sale_items.total` = `quantity * unit_price` (calculado no servidor).

---

## 2. Formas de pagamento

### À vista (`cash`, `pix`, `card`)

| Campo                  | Valor         |
| ---------------------- | ------------- |
| `sales.payment_status` | `paid`        |
| `receivables`          | **Não criar** |

### Fiado 30 dias (`credit_30_days`)

| Campo                        | Valor                           |
| ---------------------------- | ------------------------------- |
| `sales.payment_status`       | `pending`                       |
| `receivables.amount`         | `sales.total`                   |
| `receivables.due_date`       | `sales.sale_date + 30 dias`     |
| `receivables.status`         | `open`                          |
| `receivables.paid_at`        | `null`                          |
| `receivables.payment_method` | `null` (preenchido na quitação) |

---

## 3. Estoque

1. Toda venda confirmada **baixa estoque** automaticamente de cada produto vendido.
2. **Não permitir** venda com estoque insuficiente — bloquear antes de persistir.
3. Estoque nunca pode ficar negativo.
4. Produto com `is_active = false` não pode ser adicionado a novas vendas.
5. Ao **cancelar** venda: devolver quantidade de cada item ao estoque.

---

## 4. Fiado — vencimento e quitação

### Identificação de vencido (`overdue`)

Fiado vencido quando:

- `receivables.due_date < data atual`
- `receivables.status = open`

Ao detectar, atualizar `status` para `overdue`.

### Quitação de fiado

Ao marcar fiado como pago:

| Campo                        | Valor                                             |
| ---------------------------- | ------------------------------------------------- |
| `receivables.status`         | `paid`                                            |
| `receivables.paid_at`        | data/hora atual                                   |
| `receivables.payment_method` | forma usada na quitação (`cash`, `pix` ou `card`) |
| `sales.payment_status`       | `paid`                                            |

---

## 5. Cancelamento

1. **Não excluir** dados financeiros (sales, sale_items, receivables).
2. Usar status `cancelled` quando necessário:
   - `sales.payment_status = cancelled`
   - `receivables.status = cancelled` (se existir)
3. Devolver estoque dos itens da venda cancelada.

---

## 6. Validação de entrada

1. Toda entrada de formulário e Server Action deve ser validada com **Zod**.
2. Totais de venda devem ser **calculados no servidor** — nunca confiar em valores do client.
3. Mensagens de erro em português, claras e objetivas.

---

## 7. Clientes

1. Cliente com `is_active = false` **não pode** receber novas vendas.
2. CPF único quando informado.
3. O cliente deve manter histórico completo:
   - Todas as vendas
   - Fiados em aberto (`open`, `overdue`)
   - Fiados pagos (`paid`)
   - Fiados cancelados (`cancelled`) — com indicação visual discreta
4. Histórico financeiro acessível na tela de detalhe do cliente.

---

## 8. Produtos

1. `sale_price >= 0`
2. `stock_quantity >= 0`
3. Produto inativo não aparece em seleção de novas vendas.
4. Edição de estoque permitida via tela de produtos (ajuste manual).

---

## 9. Dashboard — indicadores esperados

| Indicador                     | Descrição                                                |
| ----------------------------- | -------------------------------------------------------- |
| Vendas do dia                 | Total vendido hoje (todas as formas, exceto canceladas)  |
| Total vendido no mês          | Soma do mês corrente                                     |
| Fiado em aberto               | Soma de receivables com `status = open`                  |
| Fiados vencidos               | Quantidade e valor de receivables com `status = overdue` |
| Clientes com dívida ativa     | Clientes com receivables `open` ou `overdue`             |
| Fiados próximos do vencimento | Receivables `open` com `due_date` nos próximos 7 dias    |

---

## 10. Invariantes (nunca violar)

| #   | Invariante                                                            |
| --- | --------------------------------------------------------------------- |
| 1   | Estoque >= 0 após qualquer operação                                   |
| 2   | Toda venda tem >= 1 item                                              |
| 3   | Toda venda fiada tem exatamente 1 receivable                          |
| 4   | Venda à vista não tem receivable                                      |
| 5   | Dados financeiros nunca são deletados fisicamente                     |
| 6   | Totais sempre calculados no servidor                                  |
| 7   | Toda entrada validada com Zod                                         |
| 8   | `receivables.amount` sempre igual ao `sales.total` da venda vinculada |

---

## 11. Prioridades do sistema

1. **Simplicidade** — fluxos diretos, sem etapas desnecessárias
2. **Segurança** — auth, RLS, validação, sem DELETE financeiro
3. **Consistência** — estoque e valores sempre corretos
4. **Clareza visual** — status sempre visíveis via badges

---

## Documentação relacionada

- Banco de dados: `docs/DATABASE_SPEC.md`
- Arquitetura: `docs/SYSTEM_ARCHITECTURE.md`
- Segurança: `docs/SECURITY_SPEC.md`
