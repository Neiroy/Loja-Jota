export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export type ListActionResult<T> = {
  items: T[];
  error?: string;
};

export const LIST_LOAD_ERROR =
  'Não foi possível carregar os dados. Tente novamente.';
