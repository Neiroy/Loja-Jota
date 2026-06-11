'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import {
  createCustomerAction,
  updateCustomerAction,
} from '@/features/customers/actions/customer.actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSection } from '@/components/shared/form-section';
import type { Customer } from '@/types/customer.types';

type CustomerFormProps = {
  mode: 'create' | 'edit';
  customer?: Customer;
  cancelHref: string;
};

export function CustomerForm({
  mode,
  customer,
  cancelHref,
}: CustomerFormProps) {
  const action =
    mode === 'create'
      ? createCustomerAction
      : updateCustomerAction.bind(null, customer!.id);

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <FormSection
      title={mode === 'create' ? 'Dados do cliente' : 'Editar dados'}
      description="Telefone é essencial para contato e acompanhamento de fiado."
    >
      <form
        action={formAction}
        className={cn(
          'space-y-4',
          isPending && 'pointer-events-none opacity-80'
        )}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={customer?.name ?? ''}
            placeholder="Nome completo"
            aria-invalid={Boolean(state?.fieldErrors?.name)}
            disabled={isPending}
            required
          />
          {state?.fieldErrors?.name ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.name[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone / WhatsApp *</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={customer?.phone ?? ''}
            placeholder="(11) 99999-9999"
            aria-invalid={Boolean(state?.fieldErrors?.phone)}
            disabled={isPending}
            required
          />
          {state?.fieldErrors?.phone ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.phone[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF (opcional)</Label>
          <Input
            id="cpf"
            name="cpf"
            defaultValue={customer?.cpf ?? ''}
            placeholder="Somente números ou com pontuação"
            aria-invalid={Boolean(state?.fieldErrors?.cpf)}
            disabled={isPending}
          />
          {state?.fieldErrors?.cpf ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.cpf[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={customer?.notes ?? ''}
            placeholder="Anotações internas sobre o cliente"
            aria-invalid={Boolean(state?.fieldErrors?.notes)}
            disabled={isPending}
          />
          {state?.fieldErrors?.notes ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.notes[0]}
            </p>
          ) : null}
        </div>

        {mode === 'edit' ? (
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              defaultChecked={customer?.is_active ?? true}
              disabled={isPending}
              className="size-4 rounded border-stone-300"
            />
            <Label htmlFor="is_active" className="font-normal">
              Cliente ativo
            </Label>
          </div>
        ) : null}

        {state?.error ? (
          <p className="text-destructive text-sm">{state.error}</p>
        ) : null}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? 'Salvando...'
              : mode === 'create'
                ? 'Cadastrar cliente'
                : 'Salvar alterações'}
          </Button>
          <Link
            href={cancelHref}
            aria-disabled={isPending}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              isPending && 'pointer-events-none opacity-50'
            )}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </FormSection>
  );
}
