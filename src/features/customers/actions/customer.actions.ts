'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  createCustomerSchema,
  customerIdSchema,
  updateCustomerSchema,
  type ListCustomersInput,
} from '@/schemas/customer.schema';
import * as customersService from '@/services/customers.service';
import { CustomerServiceError } from '@/services/customers.service';
import {
  LIST_LOAD_ERROR,
  type ActionResult,
  type ListActionResult,
} from '@/types/action.types';
import type { Customer } from '@/types/customer.types';

function mapFieldErrors(
  fieldErrors: Record<string, string[] | undefined>
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(
      (entry): entry is [string, string[]] =>
        Array.isArray(entry[1]) && entry[1].length > 0
    )
  );
}

function parseCreateFormData(formData: FormData) {
  return {
    name: formData.get('name'),
    phone: formData.get('phone'),
    cpf: formData.get('cpf') ?? '',
    notes: formData.get('notes') ?? '',
  };
}

function parseUpdateFormData(formData: FormData) {
  return {
    ...parseCreateFormData(formData),
    is_active: formData.get('is_active') === 'on',
  };
}

function handleServiceError(error: unknown): ActionResult<never> {
  if (error instanceof CustomerServiceError) {
    return { success: false, error: error.message };
  }

  return {
    success: false,
    error: 'Não foi possível concluir a operação. Tente novamente.',
  };
}

export async function listCustomers(
  filters: ListCustomersInput = { status: 'all' }
): Promise<ListActionResult<Customer>> {
  try {
    const items = await customersService.list(filters);
    return { items };
  } catch {
    return { items: [], error: LIST_LOAD_ERROR };
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    return await customersService.getById(id);
  } catch {
    return null;
  }
}

export async function createCustomerAction(
  _prevState: ActionResult<Customer> | null,
  formData: FormData
): Promise<ActionResult<Customer>> {
  const parsed = createCustomerSchema.safeParse(parseCreateFormData(formData));

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: mapFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  let customer: Customer;

  try {
    customer = await customersService.create(parsed.data);
  } catch (error) {
    return handleServiceError(error);
  }

  revalidatePath('/clientes');
  redirect(`/clientes/${customer.id}`);
}

export async function updateCustomerAction(
  id: string,
  _prevState: ActionResult<Customer> | null,
  formData: FormData
): Promise<ActionResult<Customer>> {
  const parsedId = customerIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: 'Identificador inválido.' };
  }

  const parsed = updateCustomerSchema.safeParse(parseUpdateFormData(formData));

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: mapFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  let customer: Customer;

  try {
    customer = await customersService.update(parsedId.data, parsed.data);
  } catch (error) {
    return handleServiceError(error);
  }

  revalidatePath('/clientes');
  revalidatePath(`/clientes/${customer.id}`);
  revalidatePath(`/clientes/${customer.id}/editar`);
  redirect(`/clientes/${customer.id}`);
}

export async function setCustomerStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<Customer>> {
  const parsedId = customerIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: 'Identificador inválido.' };
  }

  try {
    const customer = await customersService.setStatus(parsedId.data, isActive);

    revalidatePath('/clientes');
    revalidatePath(`/clientes/${customer.id}`);
    revalidatePath(`/clientes/${customer.id}/editar`);

    return { success: true, data: customer };
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function deleteCustomerAction(
  id: string
): Promise<ActionResult<void>> {
  const parsedId = customerIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: 'Identificador inválido.' };
  }

  try {
    await customersService.remove(parsedId.data);

    revalidatePath('/clientes');
    revalidatePath(`/clientes/${parsedId.data}`);

    return { success: true };
  } catch (error) {
    return handleServiceError(error);
  }
}
