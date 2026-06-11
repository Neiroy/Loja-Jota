# Arquitetura do Sistema

## Fluxo obrigatório de dados

```
Page / RSC
  → Server Action
    → Service
      → Repository
        → Supabase Server Client
          → Database (PostgreSQL)
```

Nenhuma camada pode pular a anterior. Pages **nunca** acessam Repository ou Supabase diretamente.

## Responsabilidades por camada

### Pages / RSC (`src/app/`)

- Renderizar páginas e layouts
- Buscar dados iniciais quando necessário (via Server Actions ou props)
- Compor componentes de `components/` e `features/`
- **Não** conter regra de negócio complexa
- **Não** executar queries ou mutações diretamente

### Server Actions (`src/features/*/actions/`)

- Receber dados de formulários e interações
- Validar toda entrada com Zod (`src/schemas/`)
- Chamar o Service correspondente
- Retornar resultado padronizado (sucesso ou erro)
- **Não** conter lógica de domínio complexa
- **Não** executar queries Supabase

### Services (`src/services/`)

- Concentrar regras de negócio
- Validar estoque antes de vendas
- Calcular totais no servidor (subtotal, desconto, total)
- Criar vendas com itens
- Criar fiados automaticamente quando `payment_method = credit_30_days`
- Marcar fiados como pagos
- Identificar fiados vencidos (`overdue`)
- Orquestrar operações compostas (transações)
- **Não** conter JSX ou lógica visual
- **Não** acessar Supabase diretamente (usar Repositories)

### Repositories (`src/repositories/`)

- Comunicação direta com Supabase (queries, inserts, updates)
- Retornar tipos do domínio
- **Não** conter regra de negócio complexa
- **Não** conter regra visual

### Schemas (`src/schemas/`)

- Validação Zod de toda entrada do sistema
- Schemas de criação, edição e ações específicas

### Types (`src/types/`)

- Tipagens compartilhadas do domínio
- Tipos derivados de Zod (`z.infer<>`)
- Tipos gerados do Supabase (`database.types.ts` — fase futura)

## Estrutura de pastas

```
Sistema Controle Loja Jota/
├── docs/                              # Documentação (fora de src/)
│
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   └── login/
    │   └── (protected)/
    │       ├── dashboard/
    │       ├── clientes/
    │       ├── produtos/
    │       ├── vendas/
    │       ├── fiados/
    │       └── configuracoes/
    │
    ├── components/
    │   ├── ui/                          # shadcn/ui primitives
    │   ├── layout/                      # Sidebar, Topbar, PageHeader
    │   └── shared/                      # AuthCard, DataTable, StatusBadge, etc.
    │
    ├── features/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── customers/
    │   ├── products/
    │   ├── sales/
    │   └── receivables/
    │
    ├── lib/
    │   ├── supabase/                    # server.ts, client.ts, middleware
    │   ├── utils/
    │   └── constants/
    │
    ├── repositories/
    │   ├── customers.repository.ts
    │   ├── products.repository.ts
    │   ├── sales.repository.ts
    │   └── receivables.repository.ts
    │
    ├── services/
    │   ├── customers.service.ts
    │   ├── products.service.ts
    │   ├── sales.service.ts
    │   └── receivables.service.ts
    │
    ├── schemas/
    │   ├── customer.schema.ts
    │   ├── product.schema.ts
    │   ├── sale.schema.ts
    │   └── receivable.schema.ts
    │
    └── types/
        ├── customer.types.ts
        ├── product.types.ts
        ├── sale.types.ts
        └── receivable.types.ts
```

## Organização por feature

Cada domínio em `src/features/<nome>/`:

```
features/customers/
├── actions/           # Server Actions do módulo
├── components/        # UI específica do módulo
└── hooks/             # Apenas se necessário (client components)
```

Código compartilhado permanece em `repositories/`, `services/`, `schemas/`, `types/`, `components/`.

## Padrão de resposta (Server Actions)

```typescript
type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
```

- `success: true` → operação concluída; `data` opcional
- `success: false` → `error` (mensagem geral) ou `fieldErrors` (validação Zod)
- Mensagens de erro ao usuário sempre em português

## Server Components vs Client Components

- **Server Component** por padrão em todo o projeto
- `'use client'` apenas quando necessário: formulários interativos, dialogs, hooks de estado, toasts
- Dados sensíveis nunca buscados no client via Supabase anon key

## Autenticação e proteção de rotas

- Supabase Auth com email/senha
- `src/middleware.ts` protege rotas em `(protected)/`
- Rotas públicas: `/login`, `/auth/callback`
- Sessão validada via Supabase Server Client em toda operação server-side
- Perfil do usuário em tabela `profiles` (ver `docs/DATABASE_SPEC.md`)

## Transações

Operações compostas (criar venda + itens + baixar estoque + criar receivable) devem ser atômicas.

**Estratégia recomendada:** função RPC PostgreSQL `create_sale_with_items` documentada em `docs/DATABASE_SPEC.md`.

## Fluxo de criação de venda (referência)

```
1. Page renderiza formulário de venda
2. Server Action recebe payload → valida com sale.schema.ts
3. sales.service.ts:
   a. Valida cliente ativo
   b. Valida estoque de cada item
   c. Calcula subtotal, desconto, total no servidor
   d. Chama RPC ou orquestra repositories em transação
   e. Se credit_30_days → cria receivable (due_date = sale_date + 30 dias)
4. Repository persiste dados
5. Action retorna ActionResult com venda criada
```

## Anti-patterns (proibido)

- Page chamando Repository ou Supabase diretamente
- API Routes para CRUD interno (usar Server Actions)
- Lógica de negócio em components ou repositories
- Totais calculados no client e aceitos sem recálculo no servidor
- DELETE físico em tabelas financeiras
- Expor `SUPABASE_SERVICE_ROLE_KEY` no client bundle

## Documentação relacionada

- Regras de negócio: `docs/BUSINESS_RULES.md`
- Banco de dados: `docs/DATABASE_SPEC.md`
- Segurança: `docs/SECURITY_SPEC.md`
- Padrões de código: `docs/CODING_RULES.md`
- Guardrails IA: `docs/AI_GUARDRAILS.md`
