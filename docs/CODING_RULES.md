# Regras de Código

Padrões obrigatórios para manter consistência, segurança e qualidade em todo o projeto.

---

## Ferramentas

| Ferramenta | Uso                      |
| ---------- | ------------------------ |
| TypeScript | `strict: true`           |
| ESLint     | Linting (config Next.js) |
| Prettier   | Formatação consistente   |
| Zod        | Validação de entrada     |
| shadcn/ui  | Componentes base         |

---

## Imports

- Usar alias `@/` para todos os imports internos
- Ordem: externos → `@/lib` → `@/types` → `@/schemas` → `@/services` → `@/repositories` → `@/components` → relativos
- Sem imports circulares entre services e repositories

```typescript
import { z } from 'zod';
import { createCustomerSchema } from '@/schemas/customer.schema';
import { customerService } from '@/services/customers.service';
import type { Customer } from '@/types/customer.types';
```

---

## Convenções de naming

| Tipo                   | Convenção            | Exemplo                     |
| ---------------------- | -------------------- | --------------------------- |
| Arquivo de componente  | `kebab-case.tsx`     | `customer-form.tsx`         |
| Arquivo de action      | `kebab-case.ts`      | `customer-actions.ts`       |
| Arquivo de service     | `kebab-case.ts`      | `customers.service.ts`      |
| Arquivo de repository  | `kebab-case.ts`      | `customers.repository.ts`   |
| Arquivo de schema      | `kebab-case.ts`      | `customer.schema.ts`        |
| Arquivo de types       | `kebab-case.ts`      | `customer.types.ts`         |
| Server Action (função) | `camelCase`          | `createCustomer`            |
| Service (função)       | `camelCase`          | `create`, `findById`        |
| Repository (função)    | `camelCase`          | `insert`, `findById`        |
| Schema Zod             | `camelCase` + sufixo | `createCustomerSchema`      |
| Type / Interface       | `PascalCase`         | `Customer`, `SaleWithItems` |
| Constantes             | `UPPER_SNAKE_CASE`   | `RECEIVABLE_DUE_DAYS`       |
| Enum values (DB)       | `snake_case`         | `credit_30_days`            |

---

## Estrutura de Server Action

```typescript
'use server';

import { createCustomerSchema } from '@/schemas/customer.schema';
import { customerService } from '@/services/customers.service';
import type { ActionResult } from '@/types/action.types';
import type { Customer } from '@/types/customer.types';

export async function createCustomer(
  input: unknown
): Promise<ActionResult<Customer>> {
  const parsed = createCustomerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const customer = await customerService.create(parsed.data);
    return { success: true, data: customer };
  } catch (error) {
    console.error('[createCustomer]', error);
    return { success: false, error: 'Não foi possível cadastrar o cliente.' };
  }
}
```

---

## Regras de camadas

| Regra             | Detalhe                                   |
| ----------------- | ----------------------------------------- |
| Fluxo obrigatório | Page → Action → Service → Repository → DB |
| Repository        | Apenas queries; sem `if/else` de negócio  |
| Service           | Sem JSX, sem cookies, sem `headers()`     |
| Component         | Sem Supabase client para dados sensíveis  |
| Action            | Sem SQL, sem cálculos complexos           |

---

## Server Components vs Client Components

```typescript
// Server Component (padrão) — sem diretiva
export default async function CustomersPage() {
  const result = await listCustomers();
  // ...
}

// Client Component — apenas quando necessário
('use client');
export function CustomerForm() {
  // useState, onSubmit, interatividade
}
```

Usar `'use client'` somente para:

- Formulários com estado local
- Dialogs e sheets interativos
- Hooks (`useState`, `useEffect`, `useForm`)
- Toasts e feedback imediato

---

## Schemas Zod

```typescript
import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(200),
  phone: z.string().trim().max(20).optional(),
  cpf: z.string().trim().max(14).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
```

- Mensagens de validação em português
- `trim()` em strings de texto
- Schemas separados para create, update e ações específicas

---

## Tratamento de erros

- Mensagens ao usuário: português, claras, sem jargão técnico
- Log técnico: `console.error` no servidor (dev); evitar vazar stack ao client
- Erros de negócio no Service: lançar erros tipados ou retornar Result
- Nunca retornar mensagens de erro do Supabase diretamente ao usuário

---

## Formatação e estilo

- Prettier com config padrão do projeto (single quotes, trailing comma, semi)
- Tailwind: classes ordenadas (prettier-plugin-tailwindcss quando configurado)
- Componentes: props tipadas com interface/type
- Evitar `any`; usar `unknown` + Zod para inputs externos

---

## Git e commits

- Commits **apenas quando solicitado** pelo usuário
- Mensagens em português, foco no "porquê"
- Nunca commitar `.env.local`, secrets ou `node_modules`

---

## Validação obrigatória ao final de cada fase

```bash
npm run lint
npm run build
npm run format:check
```

Todos devem passar sem erros antes de considerar a fase concluída.

---

## Documentação relacionada

- Arquitetura: `docs/SYSTEM_ARCHITECTURE.md`
- Guardrails IA: `docs/AI_GUARDRAILS.md`
- Roadmap: `docs/IMPLEMENTATION_ROADMAP.md`
