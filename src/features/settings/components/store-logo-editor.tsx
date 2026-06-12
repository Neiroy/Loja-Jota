'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { STORE_LOGO_MAX_BYTES } from '@/lib/storage/store-logos';
import {
  clampOffset,
  exportCroppedLogo,
  getCenteredOffset,
  getDrawDimensions,
  loadImageElement,
  STORE_LOGO_PREVIEW_SIZE,
  type LogoCropTransform,
} from '@/features/settings/utils/store-logo-canvas';

type StoreLogoEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSource: string | null;
  onSave: (file: File) => Promise<void>;
};

const DEFAULT_TRANSFORM: LogoCropTransform = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

export function StoreLogoEditor({
  open,
  onOpenChange,
  imageSource,
  onSave,
}: StoreLogoEditorProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] =
    useState<LogoCropTransform>(DEFAULT_TRANSFORM);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();

  useEffect(() => {
    if (!open || !imageSource) {
      return;
    }

    let cancelled = false;

    loadImageElement(imageSource)
      .then((loadedImage) => {
        if (cancelled) {
          return;
        }

        const { width, height } = getDrawDimensions(
          loadedImage.naturalWidth,
          loadedImage.naturalHeight,
          STORE_LOGO_PREVIEW_SIZE,
          1
        );

        setImage(loadedImage);
        setTransform({
          zoom: 1,
          ...getCenteredOffset(width, height, STORE_LOGO_PREVIEW_SIZE),
        });
        setError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Não foi possível ajustar a imagem. Tente outro arquivo.');
          setImage(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, imageSource]);

  const drawDimensions = image
    ? getDrawDimensions(
        image.naturalWidth,
        image.naturalHeight,
        STORE_LOGO_PREVIEW_SIZE,
        transform.zoom
      )
    : null;

  function updateTransform(next: Partial<LogoCropTransform>) {
    if (!image) {
      return;
    }

    setTransform((current) => {
      const zoom = next.zoom ?? current.zoom;
      const { width, height } = getDrawDimensions(
        image.naturalWidth,
        image.naturalHeight,
        STORE_LOGO_PREVIEW_SIZE,
        zoom
      );

      const offset = clampOffset(
        next.offsetX ?? current.offsetX,
        next.offsetY ?? current.offsetY,
        width,
        height,
        STORE_LOGO_PREVIEW_SIZE
      );

      return {
        zoom,
        ...offset,
      };
    });
  }

  function handleZoomChange(value: string) {
    const zoom = Number(value);

    if (!image) {
      return;
    }

    const { width, height } = getDrawDimensions(
      image.naturalWidth,
      image.naturalHeight,
      STORE_LOGO_PREVIEW_SIZE,
      zoom
    );

    setTransform((current) => ({
      zoom,
      ...clampOffset(
        current.offsetX,
        current.offsetY,
        width,
        height,
        STORE_LOGO_PREVIEW_SIZE
      ),
    }));
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!image || isSaving) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: transform.offsetX,
      originY: transform.offsetY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId || !image) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    updateTransform({
      offsetX: dragState.originX + deltaX,
      offsetY: dragState.originY + deltaY,
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;

    if (viewportRef.current?.hasPointerCapture(event.pointerId)) {
      viewportRef.current.releasePointerCapture(event.pointerId);
    }
  }

  function handleSave() {
    if (!image) {
      return;
    }

    setError(null);

    startSaveTransition(async () => {
      try {
        const { blob, mimeType } = await exportCroppedLogo(image, transform);

        if (blob.size > STORE_LOGO_MAX_BYTES) {
          setError('A imagem ajustada deve ter no máximo 2 MB.');
          return;
        }

        const extension = mimeType === 'image/webp' ? 'webp' : 'png';
        const file = new File([blob], `logo.${extension}`, { type: mimeType });

        await onSave(file);
        onOpenChange(false);
      } catch {
        setError('Não foi possível ajustar a imagem. Tente outro arquivo.');
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar logo</DialogTitle>
          <DialogDescription>
            Ajuste o enquadramento da logo antes de salvar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div
            ref={viewportRef}
            className="relative mx-auto aspect-square w-full max-w-[18rem] touch-none overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm"
            style={{
              height: STORE_LOGO_PREVIEW_SIZE,
              maxHeight: 'min(72vw, 18rem)',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {image && drawDimensions ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview interativo da logo
              <img
                src={image.src}
                alt="Pré-visualização da logo"
                draggable={false}
                className="pointer-events-none absolute max-w-none select-none"
                style={{
                  width: drawDimensions.width,
                  height: drawDimensions.height,
                  transform: `translate(${transform.offsetX}px, ${transform.offsetY}px)`,
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-stone-50 px-6 text-center text-sm text-stone-500">
                {error ?? 'Carregando imagem...'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="store-logo-zoom">Zoom</Label>
              <span className="text-sm text-stone-500">
                {transform.zoom.toFixed(2)}x
              </span>
            </div>
            <input
              id="store-logo-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={transform.zoom}
              disabled={!image || isSaving}
              onChange={(event) => handleZoomChange(event.target.value)}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <p className="text-xs text-stone-500">
            Arraste a imagem para reposicionar. A versão final será salva em
            512x512px.
          </p>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!image || isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Salvando...' : 'Salvar logo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
