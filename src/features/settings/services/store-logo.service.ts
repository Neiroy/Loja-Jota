import { createClient } from '@/lib/supabase/server';
import { getCurrentStoreId } from '@/lib/tenant/get-current-store';
import * as storesRepository from '@/repositories/stores.repository';
import {
  STORE_LOGOS_BUCKET,
  STORE_LOGO_MAX_BYTES,
  buildStoreLogoPath,
  getStoreLogoPublicUrl,
  isAllowedStoreLogoMimeType,
  type StoreLogoMimeType,
} from '@/lib/storage/store-logos';

export class StoreLogoServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'INVALID_FILE'
      | 'FILE_TOO_LARGE'
      | 'UPLOAD'
      | 'REMOVE'
      | 'DATABASE'
  ) {
    super(message);
    this.name = 'StoreLogoServiceError';
  }
}

function parseLogoFile(formData: FormData): File {
  const value = formData.get('logo');

  if (!(value instanceof File) || value.size === 0) {
    throw new StoreLogoServiceError(
      'Selecione uma imagem válida para enviar.',
      'INVALID_FILE'
    );
  }

  return value;
}

function validateLogoFile(file: File): StoreLogoMimeType {
  if (!isAllowedStoreLogoMimeType(file.type)) {
    throw new StoreLogoServiceError(
      'Formato inválido. Use PNG, JPG ou WEBP.',
      'INVALID_FILE'
    );
  }

  if (file.size > STORE_LOGO_MAX_BYTES) {
    throw new StoreLogoServiceError(
      'A imagem deve ter no máximo 2 MB.',
      'FILE_TOO_LARGE'
    );
  }

  return file.type;
}

async function removeLogoFileQuietly(logoPath: string) {
  const supabase = await createClient();
  await supabase.storage.from(STORE_LOGOS_BUCKET).remove([logoPath]);
}

async function removeLogoFile(logoPath: string) {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(STORE_LOGOS_BUCKET)
    .remove([logoPath]);

  if (error) {
    throw new StoreLogoServiceError(
      'Não foi possível remover a logo.',
      'REMOVE'
    );
  }
}

export async function updateCurrentStoreLogo(formData: FormData) {
  const file = parseLogoFile(formData);
  const mimeType = validateLogoFile(file);

  const storeId = await getCurrentStoreId();
  const logoPath = buildStoreLogoPath(storeId, mimeType);
  const supabase = await createClient();

  const { data: currentStore, error: findError } =
    await storesRepository.findById(storeId);

  if (findError) {
    throw new StoreLogoServiceError(
      'Não foi possível carregar os dados da loja.',
      'DATABASE'
    );
  }

  if (currentStore?.logo_path && currentStore.logo_path !== logoPath) {
    await removeLogoFileQuietly(currentStore.logo_path);
  }

  const fileBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(STORE_LOGOS_BUCKET)
    .upload(logoPath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new StoreLogoServiceError(
      'Não foi possível enviar a logo. Tente novamente.',
      'UPLOAD'
    );
  }

  const { error: updateError } = await storesRepository.updateLogoPath(
    storeId,
    logoPath
  );

  if (updateError) {
    throw new StoreLogoServiceError(
      'A logo foi enviada, mas não foi possível salvar na loja.',
      'DATABASE'
    );
  }

  return {
    logoPath,
    logoUrl: getStoreLogoPublicUrl(logoPath),
  };
}

export async function removeCurrentStoreLogo() {
  const storeId = await getCurrentStoreId();
  const { data: store, error: findError } =
    await storesRepository.findById(storeId);

  if (findError) {
    throw new StoreLogoServiceError(
      'Não foi possível carregar os dados da loja.',
      'DATABASE'
    );
  }

  if (store?.logo_path) {
    await removeLogoFile(store.logo_path);
  }

  const { error: updateError } = await storesRepository.updateLogoPath(
    storeId,
    null
  );

  if (updateError) {
    throw new StoreLogoServiceError(
      'Não foi possível remover a logo da loja.',
      'DATABASE'
    );
  }
}
