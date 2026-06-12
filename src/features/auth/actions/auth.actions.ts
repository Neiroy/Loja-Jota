'use server';

import { redirect } from 'next/navigation';

import { AuthServiceError } from '@/services/auth.service';
import * as authService from '@/services/auth.service';
import { loginSchema } from '@/schemas/auth.schema';
import type { ActionResult } from '@/types/action.types';
import type { AuthUser } from '@/types/auth.types';

export async function loginAction(
  _prevState: ActionResult<AuthUser> | null,
  formData: FormData
): Promise<ActionResult<AuthUser>> {
  return login(formData);
}

export async function login(input: unknown): Promise<ActionResult<AuthUser>> {
  const rawInput =
    input instanceof FormData
      ? {
          email: input.get('email'),
          password: input.get('password'),
        }
      : input;

  const parsed = loginSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const user = await authService.login(parsed.data);

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof AuthServiceError && error.code === 'NO_STORE') {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'E-mail ou senha inválidos.',
    };
  }
}

export async function logout(): Promise<void> {
  try {
    await authService.logout();
  } catch {
    // Falha silenciosa: redirect garante saída da área protegida.
  }

  redirect('/login');
}
