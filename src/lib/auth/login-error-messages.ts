export const LOGIN_ERROR_MESSAGES = {
  no_store:
    'Seu usuário ainda não está vinculado a uma loja. Fale com o administrador.',
  inactive_store:
    'Sua loja está inativa no momento. Entre em contato com o administrador.',
  auth_callback_error:
    'Não foi possível concluir o login. Tente novamente ou use e-mail e senha.',
  invalid_credentials: 'E-mail ou senha inválidos.',
  unknown: 'Não foi possível entrar. Tente novamente.',
} as const;

export type LoginErrorCode = keyof typeof LOGIN_ERROR_MESSAGES;

export function getLoginErrorMessage(
  error: string | null | undefined
): string | null {
  if (!error) {
    return null;
  }

  if (error in LOGIN_ERROR_MESSAGES) {
    return LOGIN_ERROR_MESSAGES[error as LoginErrorCode];
  }

  return LOGIN_ERROR_MESSAGES.unknown;
}

export function getLoginRedirectForSessionReason(
  reason: 'unauthenticated' | 'no_store' | 'inactive_store'
): string {
  if (reason === 'inactive_store') {
    return '/login?error=inactive_store';
  }

  if (reason === 'no_store') {
    return '/login?error=no_store';
  }

  return '/login';
}
