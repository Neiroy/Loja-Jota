'use client';

import { ImageIcon } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { StoreBrandMark } from '@/components/layout/store-brand-mark';
import {
  removeStoreLogoAction,
  updateStoreLogoAction,
} from '@/features/settings/actions/store-logo.actions';
import { StoreLogoEditor } from '@/features/settings/components/store-logo-editor';
import {
  isAllowedLogoSourceFile,
  STORE_LOGO_SOURCE_MAX_BYTES,
} from '@/features/settings/utils/store-logo-canvas';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type StoreLogoCardProps = {
  storeName: string;
  storeMonogram: string;
  initialLogoUrl: string | null;
};

export function StoreLogoCard({
  storeName,
  storeMonogram,
  initialLogoUrl,
}: StoreLogoCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorImageSource, setEditorImageSource] = useState<string | null>(
    null
  );
  const [isRemovePending, startRemoveTransition] = useTransition();

  const isPending = isRemovePending;

  useEffect(() => {
    return () => {
      if (editorImageSource) {
        URL.revokeObjectURL(editorImageSource);
      }
    };
  }, [editorImageSource]);

  function handleSelectFile() {
    inputRef.current?.click();
  }

  function resetEditorSource() {
    setEditorImageSource((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setError(null);

    if (!isAllowedLogoSourceFile(file)) {
      const message = 'Formato inválido. Use PNG, JPG ou WEBP.';
      setError(message);
      toast.error(message);
      return;
    }

    if (file.size > STORE_LOGO_SOURCE_MAX_BYTES) {
      const message = 'A imagem original deve ter no máximo 10 MB.';
      setError(message);
      toast.error(message);
      return;
    }

    resetEditorSource();
    setEditorImageSource(URL.createObjectURL(file));
    setEditorOpen(true);
  }

  async function handleSaveEditedLogo(file: File) {
    const formData = new FormData();
    formData.set('logo', file);

    const result = await updateStoreLogoAction(formData);

    if (!result.success) {
      const message = result.error ?? 'Não foi possível enviar a logo.';
      setError(message);
      toast.error(message);
      throw new Error(message);
    }

    setLogoUrl(result.data?.logoUrl ?? null);
    toast.success('Logo da loja atualizada com sucesso.');
  }

  function handleEditorOpenChange(open: boolean) {
    setEditorOpen(open);

    if (!open) {
      resetEditorSource();
    }
  }

  function handleRemove() {
    setError(null);

    startRemoveTransition(async () => {
      const result = await removeStoreLogoAction();

      if (!result.success) {
        const message = result.error ?? 'Não foi possível remover a logo.';
        setError(message);
        toast.error(message);
        return;
      }

      setLogoUrl(null);
      toast.success('Logo removida com sucesso.');
    });
  }

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <StoreBrandMark
            storeName={storeName}
            storeMonogram={storeMonogram}
            logoUrl={logoUrl}
            size="preview"
          />

          <div className="min-w-0 space-y-2">
            <p className="text-base font-medium text-stone-900">{storeName}</p>
            <p className="text-sm text-stone-500">
              Use uma imagem quadrada em PNG, JPG ou WEBP. Recomendado:
              512x512px.
            </p>
            <p className="text-xs text-stone-400">
              Após selecionar, ajuste zoom e posição antes de salvar.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:min-w-[15rem]">
          <Button
            type="button"
            variant="outline"
            onClick={handleSelectFile}
            disabled={isPending}
            className="gap-2"
          >
            <ImageIcon className="size-4" />
            {isRemovePending ? 'Removendo...' : 'Enviar nova logo'}
          </Button>

          {logoUrl ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={isPending}
              className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              {isRemovePending ? 'Removendo...' : 'Remover logo'}
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        id="store-logo-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        disabled={isPending}
        onChange={handleFileChange}
      />

      <Label htmlFor="store-logo-input" className="sr-only">
        Selecionar logo da loja
      </Label>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <StoreLogoEditor
        key={editorImageSource ?? 'closed'}
        open={editorOpen}
        onOpenChange={handleEditorOpenChange}
        imageSource={editorImageSource}
        onSave={handleSaveEditedLogo}
      />
    </>
  );
}
