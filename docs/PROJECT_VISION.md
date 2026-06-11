# Visão do Projeto — Sistema Controle Loja Jota

## Propósito

Sistema interno premium para controle de vendas de roupas e camisas, com gestão de clientes, produtos, vendas e fiado com prazo automático de 30 dias para quitação.

Destinado ao uso diário da operação da loja — simples, rápido e confiável.

## Público-alvo

Operadores internos da loja (proprietário, vendedores, caixa). Uso exclusivo interno, single-tenant, uma única loja.

## Objetivos do sistema

- Controle de clientes (cadastro, edição, detalhe, histórico)
- Controle de produtos (cadastro, estoque, ativo/inativo)
- Registro de vendas com múltiplos itens
- Controle de fiado (contas a receber)
- Prazo automático de 30 dias para pagamento do fiado
- Registro de pagamentos quitados
- Histórico financeiro completo por cliente
- Dashboard simples, premium e objetivo

## Fora do escopo

O sistema **não** inclui:

- E-commerce público
- Checkout online
- Mercado Pago ou qualquer gateway de pagamento externo
- Marketplace
- ERP completo
- Emissão de nota fiscal
- Controle fiscal avançado
- Múltiplas lojas / filiais
- Página pública de produtos
- Carrinho público
- Cadastro público de clientes

Qualquer funcionalidade fora desta lista exige aprovação explícita antes de ser considerada.

## Princípios de produto

1. **Simples** — apenas o necessário para operar a loja no dia a dia
2. **Premium** — interface limpa, tipografia cuidada, aparência profissional
3. **Objetivo** — cada tela tem uma ação principal clara; pouca informação por vez
4. **Seguro** — dados financeiros nunca são apagados; autenticação e RLS em todas as tabelas
5. **Confiável** — estoque e totais sempre consistentes; cálculos no servidor

## Stack tecnológica

| Camada             | Tecnologia            |
| ------------------ | --------------------- |
| Framework          | Next.js (App Router)  |
| Linguagem          | TypeScript            |
| Estilo             | Tailwind CSS          |
| Componentes        | shadcn/ui             |
| Backend / DB       | Supabase + PostgreSQL |
| Autenticação       | Supabase Auth         |
| Validação          | Zod                   |
| Mutações / queries | Server Actions        |
| Qualidade          | ESLint + Prettier     |

## Módulos principais (MVP)

| Módulo       | Funcionalidades                                                          |
| ------------ | ------------------------------------------------------------------------ |
| Autenticação | Login, logout, proteção de rotas internas                                |
| Dashboard    | Vendas do dia, total do mês, fiado aberto, vencidos, clientes com dívida |
| Clientes     | CRUD, detalhe, histórico financeiro                                      |
| Produtos     | CRUD, estoque, ativo/inativo                                             |
| Vendas       | Criar venda, itens, desconto, forma de pagamento, baixa de estoque       |
| Fiados       | Listar abertos/vencidos/pagos, quitar, registrar pagamento               |

## Métricas de sucesso (MVP)

- Registrar uma venda fiada em menos de 2 minutos
- Identificar clientes com fiado vencido em 1 clique
- Consultar histórico financeiro completo de qualquer cliente
- Estoque sempre consistente após qualquer venda ou cancelamento
- Interface com aparência profissional e uso diário sem fricção

## Documentação relacionada

- Arquitetura: `docs/SYSTEM_ARCHITECTURE.md`
- Regras de negócio: `docs/BUSINESS_RULES.md`
- Banco de dados: `docs/DATABASE_SPEC.md`
- Visual: `docs/UI_DESIGN_SYSTEM.md`
- Roadmap: `docs/IMPLEMENTATION_ROADMAP.md`
