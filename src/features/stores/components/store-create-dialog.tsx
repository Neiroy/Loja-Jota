'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { FormSection } from '@/components/shared/form-section';
import { provisionStoreAction } from '@/features/stores/actions/store.actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { slugify } from '@/lib/utils/slugify';
import { cn } from '@/lib/utils';

type StoreCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StoreCreateDialog({
  open,
  onOpenChange,
}: StoreCreateDialogProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    provisionStoreAction,
    null
  );
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function resetFormFields() {
    setStoreName('');
    setSlug('');
    setSlugTouched(false);
    setFormKey((current) => current + 1);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      resetFormFields();
    }
    onOpenChange(nextOpen);
  }

  useEffect(() => {
    if (state?.success) {
      toast.success('Loja criada com sucesso', {
        description:
          'O usuário já pode acessar o sistema com o e-mail informado.',
      });
      onOpenChange(false);
      router.refresh();
    }
  }, [state?.success, onOpenChange, router]);

  function handleStoreNameChange(value: string) {
    setStoreName(value);

    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova loja</DialogTitle>
          <DialogDescription>
            Crie a loja e o primeiro usuário de acesso em uma única etapa.
          </DialogDescription>
        </DialogHeader>

        <form
          key={formKey}
          action={formAction}
          className={cn(
            'space-y-6',
            isPending && 'pointer-events-none opacity-80'
          )}
        >
          <FormSection
            title="Dados da loja"
            description="Identificação da nova loja no sistema."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Nome da loja *</Label>
                <Input
                  id="store-name"
                  name="name"
                  value={storeName}
                  onChange={(event) =>
                    handleStoreNameChange(event.target.value)
                  }
                  placeholder="Ex.: Loja Centro"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-slug">Slug</Label>
                <Input
                  id="store-slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value);
                  }}
                  placeholder="loja-centro"
                  disabled={isPending}
                />
                <p className="text-xs text-stone-500">
                  Gerado automaticamente a partir do nome. Pode ser editado.
                </p>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Usuário de acesso"
            description="Primeiro login vinculado à loja criada."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome do responsável *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="Nome completo"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail de login *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  placeholder="usuario@loja.com"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha inicial *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Tipo de acesso</Label>
                <select
                  id="role"
                  name="role"
                  defaultValue="operator"
                  disabled={isPending}
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="operator">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
          </FormSection>

          {state?.error ? (
            <p className="text-destructive text-sm">{state.error}</p>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar loja'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
