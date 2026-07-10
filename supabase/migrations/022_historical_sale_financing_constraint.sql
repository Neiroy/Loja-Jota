-- Migration: permitir vendas históricas com entrada e N parcelas
-- Pré-requisito: 021_historical_sale_items.sql
-- Aplicar manualmente no SQL Editor do Supabase (homologação primeiro).
--
-- Causa: sales_financing_consistency (018) só permite financing_installments_count
-- em (2,3,4,5,6,10,12) para cash/pix com entrada, e exige down_payment = 0
-- para card/credit_30_days. Vendas históricas do caderno precisam de 1+ parcelas
-- e entrada parcial em qualquer forma de pagamento original.
--
-- Não altera create_sale_with_items nem regras de venda normal (is_historical = false).

alter table public.sales
  drop constraint if exists sales_financing_consistency;

alter table public.sales
  add constraint sales_financing_consistency check (
    (
      is_historical = true
      and down_payment >= 0
      and down_payment <= total
      and (
        financing_installments_count is null
        or financing_installments_count >= 1
      )
    )
    or (
      coalesce(is_historical, false) = false
      and (
        (
          payment_method not in ('cash', 'pix')
          and down_payment = 0
          and financing_installments_count is null
        )
        or (
          payment_method in ('cash', 'pix')
          and financing_installments_count is null
          and down_payment = 0
        )
        or (
          payment_method in ('cash', 'pix')
          and financing_installments_count in (2, 3, 4, 5, 6, 10, 12)
          and down_payment >= 0
          and down_payment <= total
        )
      )
    )
  );

comment on constraint sales_financing_consistency on public.sales is
  'Regras de entrada/parcelas para venda normal; vendas históricas (is_historical) são mais flexíveis.';
