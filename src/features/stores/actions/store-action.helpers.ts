import { StoreProvisioningServiceError } from '@/features/stores/services/store-provisioning.service';
import { StoreProvisionerError } from '@/lib/tenant/require-store-provisioner';

export function mapServiceError(error: unknown): string {
  if (error instanceof StoreProvisioningServiceError) {
    return error.message;
  }

  if (error instanceof StoreProvisionerError) {
    return error.message;
  }

  return 'Não foi possível concluir a operação. Tente novamente.';
}

export function parseProvisionFormData(formData: FormData) {
  return {
    name: formData.get('name'),
    slug: formData.get('slug') ?? '',
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role') ?? 'operator',
  };
}
