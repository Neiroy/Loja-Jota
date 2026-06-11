# Guardrails para Agentes de IA (Cursor)

Regras obrigatórias para qualquer agente de IA trabalhando neste projeto.

---

## Escopo — o que NÃO fazer

- **Não** inventar funcionalidades fora do escopo definido em `docs/PROJECT_VISION.md`
- **Não** criar e-commerce público
- **Não** criar checkout online
- **Não** integrar Mercado Pago, Stripe ou qualquer gateway de pagamento externo
- **Não** criar carrinho público
- **Não** criar página pública de produtos
- **Não** criar cadastro público de clientes
- **Não** implementar ERP, nota fiscal, marketplace ou multi-loja
- **Não** adicionar gráficos complexos ou dashboards poluídos

---

## Arquitetura — o que NÃO alterar

- **Não** alterar o fluxo obrigatório sem aprovação:
  ```
  Page/RSC → Server Action → Service → Repository → Supabase Server Client → Database
  ```
- **Não** pular camadas (ex.: Page chamando Repository diretamente)
- **Não** criar tabelas extras sem justificativa documentada e aprovação do usuário
- **Não** modificar regras de negócio em `docs/BUSINESS_RULES.md` sem aprovação
- **Não** mudar a estrutura de pastas definida em `docs/SYSTEM_ARCHITECTURE.md` sem aprovação
- **Não** mover `docs/` para dentro de `src/`

---

## Processo de trabalho — o que SEMPRE fazer

### Antes de qualquer implementação

1. **Diagnóstico** — analisar estado atual do projeto
2. **Listar arquivos** — todos os arquivos que serão criados ou alterados
3. **Explicar motivo** — por que cada arquivo é necessário
4. **Apresentar plano técnico** — passos da fase atual
5. **Aguardar aprovação** — não aplicar código antes da autorização

### Frases de aprovação aceitas

O usuário deve responder claramente com uma destas frases:

- "Pode aplicar"
- "Autorizo"
- "Pode implementar"
- "Aprovado"

Sem uma dessas frases, **nenhum arquivo deve ser criado ou alterado**.

### Durante a implementação

6. **Trabalhar por fases** conforme `docs/IMPLEMENTATION_ROADMAP.md`
7. **Uma fase por vez** — não avançar para a próxima sem concluir a atual
8. **Mudanças mínimas** — apenas o escopo da fase; sem refatorações não solicitadas
9. **Manter simples, premium e objetivo** — sem over-engineering

### Ao finalizar cada fase

10. **Validar** com os três comandos:
    ```bash
    npm run lint
    npm run build
    npm run format:check
    ```
11. **Informar** arquivos criados/alterados e resumo do que foi feito
12. **Aguardar aprovação** antes de iniciar a próxima fase

---

## Dados e segurança

- **Não** usar DELETE físico em tabelas financeiras (`sales`, `sale_items`, `receivables`)
- **Não** expor `SUPABASE_SERVICE_ROLE_KEY` no client
- **Não** commitar `.env`, `.env.local` ou qualquer secret
- **Não** aceitar totais calculados no client sem recálculo no servidor
- **Não** pular validação Zod em Server Actions

---

## Comunicação

- Responder sempre em **português**
- Apresentar diagnóstico antes de implementar
- Não refatorar código não relacionado à tarefa atual
- Não criar commits unless explicitly requested
- Não instalar dependências não previstas no roadmap sem aprovação

---

## Template de resposta para agentes

Ao iniciar qualquer tarefa de implementação, usar este formato:

```markdown
## Diagnóstico

[Estado atual do projeto e contexto da tarefa]

## Arquivos propostos

| Arquivo | Ação          | Motivo |
| ------- | ------------- | ------ |
| ...     | criar/alterar | ...    |

## Plano técnico

1. [Passo 1]
2. [Passo 2]
   ...

## Fora desta fase

- [O que NÃO será feito agora]

Aguardando aprovação para implementar.
```

---

## Referências obrigatórias

Antes de implementar qualquer fase, consultar:

| Documento                        | Quando consultar          |
| -------------------------------- | ------------------------- |
| `docs/PROJECT_VISION.md`         | Para validar escopo       |
| `docs/SYSTEM_ARCHITECTURE.md`    | Para estrutura e camadas  |
| `docs/DATABASE_SPEC.md`          | Para schema e migrations  |
| `docs/BUSINESS_RULES.md`         | Para regras de domínio    |
| `docs/UI_DESIGN_SYSTEM.md`       | Para componentes e visual |
| `docs/SECURITY_SPEC.md`          | Para auth, RLS e secrets  |
| `docs/CODING_RULES.md`           | Para padrões de código    |
| `docs/IMPLEMENTATION_ROADMAP.md` | Para saber a fase atual   |

---

## Documentação relacionada

- Roadmap: `docs/IMPLEMENTATION_ROADMAP.md`
- Visão: `docs/PROJECT_VISION.md`
