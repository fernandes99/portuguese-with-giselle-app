import { API_URL } from '@/constants/config';

export class ApiError extends Error {
  // 0 quando a requisição nem chegou ao servidor
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Chamado quando o servidor recusa o token de uma requisição autenticada
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  token?: string;
}

export async function api<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {}
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'Sem conexão. Verifique sua internet e tente novamente.',
      0
    );
  }

  const data = await response.json().catch(() => null);

  // 401 com token enviado: a sessão expirou ou foi invalidada. Sem token
  // é só credencial errada no login, que a própria tela trata.
  if (response.status === 401 && token) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    // O backend responde erros como { error: string }
    const message =
      typeof data?.error === 'string'
        ? data.error
        : 'Ocorreu um erro. Tente novamente.';
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}
