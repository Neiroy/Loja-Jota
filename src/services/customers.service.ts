import { getCurrentStoreId } from '@/lib/tenant/get-current-store';
import * as customersRepository from '@/repositories/customers.repository';
import {
  createCustomerSchema,
  customerIdSchema,
  listCustomersSchema,
  updateCustomerSchema,
  type CreateCustomerInput,
  type ListCustomersInput,
  type UpdateCustomerInput,
} from '@/schemas/customer.schema';
import type { Customer } from '@/types/customer.types';

export class CustomerServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'NOT_FOUND'
      | 'DUPLICATE_CPF'
      | 'INVALID_ID'
      | 'HAS_LINKS'
      | 'DATABASE'
  ) {
    super(message);
    this.name = 'CustomerServiceError';
  }
}

function isDuplicateCpfError(error: { code?: string; message?: string }) {
  return (
    error.code === '23505' &&
    (error.message?.includes('idx_customers_store_cpf') ||
      error.message?.includes('idx_customers_cpf') ||
      error.message?.includes('customers_cpf'))
  );
}

function isForeignKeyError(error: { code?: string }) {
  return error.code === '23503';
}

const CUSTOMER_HAS_LINKS_MESSAGE =
  'Este cliente possui histórico financeiro. Use a opção Inativar cliente.';

function normalizeCreateInput(input: CreateCustomerInput) {
  return {
    name: input.name.trim(),
    phone: input.phone.trim(),
    cpf: input.cpf ?? null,
    notes: input.notes ?? null,
    is_active: input.is_active ?? true,
  };
}

function normalizeUpdateInput(input: UpdateCustomerInput) {
  return {
    name: input.name.trim(),
    phone: input.phone.trim(),
    cpf: input.cpf ?? null,
    notes: input.notes ?? null,
    is_active: input.is_active,
  };
}

export async function list(
  filters: ListCustomersInput = { status: 'all' }
): Promise<Customer[]> {
  const parsed = listCustomersSchema.safeParse(filters);

  if (!parsed.success) {
    return [];
  }

  const storeId = await getCurrentStoreId();
  const { data, error } = await customersRepository.findAll(
    storeId,
    parsed.data
  );

  if (error) {
    throw new CustomerServiceError(
      'Não foi possível carregar os clientes.',
      'DATABASE'
    );
  }

  return data ?? [];
}

export async function getById(id: string): Promise<Customer> {
  const parsedId = customerIdSchema.safeParse(id);

  if (!parsedId.success) {
    throw new CustomerServiceError('Identificador inválido.', 'INVALID_ID');
  }

  const storeId = await getCurrentStoreId();
  const { data, error } = await customersRepository.findById(
    storeId,
    parsedId.data
  );

  if (error) {
    throw new CustomerServiceError(
      'Não foi possível carregar o cliente.',
      'DATABASE'
    );
  }

  if (!data) {
    throw new CustomerServiceError('Cliente não encontrado.', 'NOT_FOUND');
  }

  return data;
}

export async function create(input: CreateCustomerInput): Promise<Customer> {
  const parsed = createCustomerSchema.safeParse(input);

  if (!parsed.success) {
    throw new CustomerServiceError('Dados do cliente inválidos.', 'INVALID_ID');
  }

  const storeId = await getCurrentStoreId();
  const payload = normalizeCreateInput(parsed.data);
  const { data, error } = await customersRepository.insert(storeId, payload);

  if (error) {
    if (isDuplicateCpfError(error)) {
      throw new CustomerServiceError(
        'CPF já cadastrado para outro cliente nesta loja.',
        'DUPLICATE_CPF'
      );
    }

    throw new CustomerServiceError(
      'Não foi possível cadastrar o cliente.',
      'DATABASE'
    );
  }

  if (!data) {
    throw new CustomerServiceError(
      'Não foi possível cadastrar o cliente.',
      'DATABASE'
    );
  }

  return data;
}

export async function update(
  id: string,
  input: UpdateCustomerInput
): Promise<Customer> {
  const parsedId = customerIdSchema.safeParse(id);

  if (!parsedId.success) {
    throw new CustomerServiceError('Identificador inválido.', 'INVALID_ID');
  }

  const parsed = updateCustomerSchema.safeParse(input);

  if (!parsed.success) {
    throw new CustomerServiceError('Dados do cliente inválidos.', 'INVALID_ID');
  }

  await getById(parsedId.data);

  const storeId = await getCurrentStoreId();
  const payload = normalizeUpdateInput(parsed.data);
  const { data, error } = await customersRepository.update(
    storeId,
    parsedId.data,
    payload
  );

  if (error) {
    if (isDuplicateCpfError(error)) {
      throw new CustomerServiceError(
        'CPF já cadastrado para outro cliente nesta loja.',
        'DUPLICATE_CPF'
      );
    }

    throw new CustomerServiceError(
      'Não foi possível atualizar o cliente.',
      'DATABASE'
    );
  }

  if (!data) {
    throw new CustomerServiceError('Cliente não encontrado.', 'NOT_FOUND');
  }

  return data;
}

export async function setStatus(
  id: string,
  isActive: boolean
): Promise<Customer> {
  const parsedId = customerIdSchema.safeParse(id);

  if (!parsedId.success) {
    throw new CustomerServiceError('Identificador inválido.', 'INVALID_ID');
  }

  await getById(parsedId.data);

  const storeId = await getCurrentStoreId();
  const { data, error } = await customersRepository.update(
    storeId,
    parsedId.data,
    {
      is_active: isActive,
    }
  );

  if (error) {
    throw new CustomerServiceError(
      'Não foi possível alterar o status do cliente.',
      'DATABASE'
    );
  }

  if (!data) {
    throw new CustomerServiceError('Cliente não encontrado.', 'NOT_FOUND');
  }

  return data;
}

export async function remove(id: string): Promise<void> {
  const parsedId = customerIdSchema.safeParse(id);

  if (!parsedId.success) {
    throw new CustomerServiceError('Identificador inválido.', 'INVALID_ID');
  }

  await getById(parsedId.data);

  const storeId = await getCurrentStoreId();
  const { hasLinks, error: linksError } =
    await customersRepository.hasFinancialLinks(storeId, parsedId.data);

  if (linksError) {
    throw new CustomerServiceError(
      'Não foi possível verificar o histórico do cliente.',
      'DATABASE'
    );
  }

  if (hasLinks) {
    throw new CustomerServiceError(CUSTOMER_HAS_LINKS_MESSAGE, 'HAS_LINKS');
  }

  const { error } = await customersRepository.deleteById(
    storeId,
    parsedId.data
  );

  if (error) {
    if (isForeignKeyError(error)) {
      throw new CustomerServiceError(CUSTOMER_HAS_LINKS_MESSAGE, 'HAS_LINKS');
    }

    throw new CustomerServiceError(
      'Não foi possível excluir o cliente.',
      'DATABASE'
    );
  }
}
