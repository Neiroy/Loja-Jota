'use server';

import { revalidatePath } from 'next/cache';

import {
  StoreLogoServiceError,
  removeCurrentStoreLogo,
  updateCurrentStoreLogo,
} from '@/features/settings/services/store-logo.service';
import type { ActionResult } from '@/types/action.types';

type StoreLogoResult = {
  logoUrl: string | null;
};

function mapServiceError(error: unknown): ActionResult<never> {
  if (error instanceof StoreLogoServiceError) {
    return { success: false, error: error.message };
  }

  return {
    success: false,
    error: 'Não foi possível concluir a operação. Tente novamente.',
  };
}

function revalidateBrandingPaths() {
  revalidatePath('/configuracoes');
  revalidatePath('/', 'layout');
}

export async function updateStoreLogoAction(
  formData: FormData
): Promise<ActionResult<StoreLogoResult>> {
  try {
    const result = await updateCurrentStoreLogo(formData);

    revalidateBrandingPaths();

    return {
      success: true,
      data: { logoUrl: result.logoUrl },
    };
  } catch (error) {
    return mapServiceError(error);
  }
}

export async function removeStoreLogoAction(): Promise<ActionResult<void>> {
  try {
    await removeCurrentStoreLogo();

    revalidateBrandingPaths();

    return { success: true };
  } catch (error) {
    return mapServiceError(error);
  }
}
