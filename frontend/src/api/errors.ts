export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message?: string) {
    super(message ?? code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function errorText(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "invalid_credentials":
        return "Неверное имя или пароль.";
      case "unauthorized":
        return "Сессия закончилась. Войдите заново.";
      case "timeout":
        return "Сервер долго не отвечает. Попробуйте ещё раз.";
      case "network":
        return "Нет связи с сервером. Проверьте, что он запущен.";
      case "llm_unavailable":
        return "Помощник сейчас недоступен. Попробуйте ещё раз.";
      case "validation":
        return error.message;
    }
  }
  return "Что-то пошло не так. Попробуйте ещё раз.";
}
