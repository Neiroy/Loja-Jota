# Regras de Negócio

Documento formal das regras do domínio. Alterações exigem aprovação explícita.

---

## 1. Vendas — estrutura obrigatória

1. Toda venda precisa ter **pelo menos um item**.
2. Totais calculados no servidor (RPC):
   - `subtotal` = soma de `sale_items.total`
   - `discount` >= 0, <= subtotal
   - `total` = `subtotal - discount`
3. `unit_price` = snapshot de `products.sale_price`.
4. Toda venda pertence à loja do usuário (`store_id`).

---

## 2. Formas de pagamento

### À vista — dinheiro ou Pix (`cash`, `pix`)

| Campo                  | Valor  |
| ---------------------- | ------ |
| `sales.payment_status` | `paid` |
| `receivables`          | nenhum |

### À vista — cartão (`card`)

| Tipo    | Campos extras                                                               | Status |
| ------- | --------------------------------------------------------------------------- | ------ |
| Débito  | `card_payment_type = debit`                                                 | `paid` |
| Crédito | `card_payment_type = credit` + parcelas informativas (`installments_count`) | `paid` |

Parcelamento de cartão crédito é **apenas informativo** — não gera receivables.

### Fiado 30 dias (`credit_30_days`)

| Campo                  | Valor                        |
| ---------------------- | ---------------------------- |
| `sales.payment_status` | `pending`                    |
| Receivables            | 1 registro, `amount = total` |
| `due_date`             | `sale_date + 30 dias`        |
| `status`               | `open`                       |

### Pix/dinheiro parcelado (`cash` ou `pix` + `financing_installments_count`)

| Campo                    | Valor                                                     |
| ------------------------ | --------------------------------------------------------- |
| Entrada (`down_payment`) | opcional, >= 0, <= total                                  |
| Receivables              | N parcelas do valor financiado                            |
| `sales.payment_status`   | `partially_paid` (parcelas abertas) ou `paid` (sem saldo) |

---

## 3. Estoque

1. Venda confirmada **baixa estoque** automaticamente.
2. Estoque insuficiente → bloqueio antes de persistir.
3. Estoque nunca negativo.
4. Produto inativo não entra em novas vendas.
5. **Cancelamento** devolve estoque (RPC `cancel_sale`).

---

## 4. Fiado — vencimento e quitação

### Vencido (`overdue`)

- `due_date < hoje` e `status = open` → atualizar para `overdue` na leitura.

### Quitação de parcela/fiado

| Campo                        | Valor                                            |
| ---------------------------- | ------------------------------------------------ |
| `receivables.status`         | `paid`                                           |
| `receivables.paid_at`        | now()                                            |
| `receivables.payment_method` | `cash`, `pix` ou `card`                          |
| `sales.payment_status`       | `paid` se todas quitadas; senão `partially_paid` |

Quitação **não altera estoque**.

Formas aceitas na quitação: dinheiro, Pix, cartão — **nunca** `credit_30_days`.

---

## 5. Cancelamento

1. **Sem DELETE físico** em dados financeiros.
2. RPC `cancel_sale`:
   - `sales.payment_status = cancelled`
   - receivables `open`/`overdue` → `cancelled`
   - estoque devolvido
3. **Bloqueado** se existir receivable com `status = paid` (parcela ou fiado já quitado).

---

## 6. Validação de entrada

1. Zod em Server Actions.
2. Totais recalculados no servidor — nunca confiar no client.
3. Mensagens de erro em português.

---

## 7. Clientes

1. Cliente inativo não recebe novas vendas.
2. CPF único **por loja** (índice composto após 009).
3. Histórico financeiro detalhado: consultar módulos **Vendas** e **Fiados** (detalhe do cliente exibe atalhos).

---

## 8. Produtos

1. `sale_price >= 0`, `stock_quantity >= 0`
2. Inativo oculto em novas vendas
3. Ajuste manual de estoque na tela de produtos

---

## 9. Dashboard — indicadores

| Indicador            | Regra                                          |
| -------------------- | ---------------------------------------------- |
| Vendas do dia/mês    | Soma `sales.total` **exceto** `cancelled`      |
| Fiado em aberto      | Soma receivables `open`                        |
| Fiados vencidos      | Contagem/valor `overdue`                       |
| Clientes com dívida  | Distinct `customer_id` com `open` ou `overdue` |
| Próximos vencimentos | `open` com `due_date` nos próximos 7 dias      |
| Vendas recentes      | Exclui `cancelled`                             |

**Nota:** vendas `partially_paid` entram no KPI de vendas (valor total da venda), enquanto saldo pendente aparece em fiados em aberto.

---

## 10. Multi-loja e acesso

1. Cada usuário vinculado a **uma loja** (`profiles.store_id`).
2. Dados isolados por RLS — usuário só vê dados da própria loja.
3. Loja inativa → login bloqueado.
4. Provisionamento de novas lojas: **admin** + service role (opcional, ver `STORE_PROVISIONING_ENABLED`).

---

## 11. WhatsApp reminder (fiados)

- Botão no detalhe do fiado gera link `wa.me` com mensagem de lembrete.
- Usa telefone do cliente quando disponível.
- **Não** envia automaticamente — operador confirma no app WhatsApp.

---

## 12. Invariantes (nunca violar)

| #   | Invariante                                                           |
| --- | -------------------------------------------------------------------- |
| 1   | Estoque >= 0 após qualquer operação                                  |
| 2   | Toda venda tem >= 1 item                                             |
| 3   | Venda à vista/cartão não tem receivable                              |
| 4   | Fiado 30 dias tem exatamente 1 receivable                            |
| 5   | Pix/dinheiro parcelado: soma das parcelas + entrada = total da venda |
| 6   | Dados financeiros nunca deletados fisicamente                        |
| 7   | Totais calculados no servidor                                        |
| 8   | Toda entrada validada com Zod                                        |
| 9   | Queries respeitam `store_id` da loja do usuário                      |

---

## 13. Futuro (não implementado)

- Histórico financeiro embutido na tela do cliente
- Permissões granulares por módulo para operador
- Job/cron para `overdue` (hoje: sync na leitura)
- Gateway de pagamento externo

---

## Documentação relacionada

- Banco: `docs/DATABASE_SPEC.md`
- Segurança: `docs/SECURITY_SPEC.md`
- Arquitetura: `docs/SYSTEM_ARCHITECTURE.md`
