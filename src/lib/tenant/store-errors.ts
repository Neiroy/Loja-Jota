export type StoreContextErrorCode =
  | 'UNAUTHENTICATED'
  | 'NO_PROFILE'
  | 'NO_STORE'
  | 'INACTIVE_STORE';

export class StoreContextError extends Error {
  constructor(
    message: string,
    public readonly code: StoreContextErrorCode
  ) {
    super(message);
    this.name = 'StoreContextError';
  }
}
