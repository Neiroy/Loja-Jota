'use server';

import { revalidatePath } from 'next/cache';

import {
  mapServiceError,
  parseProvisionFormData,
} from '@/features/stores/actions/store-action.helpers';
import {
  StoreProvisioningServiceError,
  listStores,
  provisionStore,
} from '@/features/stores/services/store-provisioning.service';
import type { ActionResult, ListActionResult } from '@/types/action.types';
import type {
  ProvisionStoreResult,
  StoreListRow,
} from '@/features/stores/types/store-provisioning.types';

export async function listStoresAction(): Promise<
  ListActionResult<StoreListRow>
> {
  try {
    const items = await listStores();
    return { items };
  } catch (error) {
    return {
      items: [],
      error: mapServiceError(error),
    };
  }
}

export async function provisionStoreAction(
  _prevState: ActionResult<ProvisionStoreResult> | null,
  formData: FormData
): Promise<ActionResult<ProvisionStoreResult>> {
  try {
    const data = await provisionStore(parseProvisionFormData(formData));

    revalidatePath('/configuracoes/lojas');
    revalidatePath('/configuracoes');

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (
      error instanceof StoreProvisioningServiceError &&
      error.code === 'VALIDATION'
    ) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: mapServiceError(error),
    };
  }
}
