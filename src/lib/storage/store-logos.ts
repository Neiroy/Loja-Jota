export const STORE_LOGOS_BUCKET = 'store-logos';

export const STORE_LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const STORE_LOGO_ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

export type StoreLogoMimeType = (typeof STORE_LOGO_ALLOWED_MIME_TYPES)[number];

const MIME_TO_EXTENSION: Record<StoreLogoMimeType, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export function buildStoreLogoPath(
  storeId: string,
  mimeType: StoreLogoMimeType
) {
  const extension = MIME_TO_EXTENSION[mimeType];
  return `${storeId}/logo.${extension}`;
}

export function isAllowedStoreLogoMimeType(
  mimeType: string
): mimeType is StoreLogoMimeType {
  return STORE_LOGO_ALLOWED_MIME_TYPES.includes(mimeType as StoreLogoMimeType);
}

export function getStoreLogoPublicUrl(logoPath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    return null;
  }

  const encodedPath = logoPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${baseUrl}/storage/v1/object/public/${STORE_LOGOS_BUCKET}/${encodedPath}`;
}
