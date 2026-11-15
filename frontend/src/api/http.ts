import type { ZodType } from "zod";
import type { ApiClient } from "./client";
import { ApiError } from "./errors";
import {
  chatResponseSchema,
  checklistItemSchema,
  checklistSchema,
  loginResponseSchema,
  timeOffListSchema,
  timeOffRequestSchema,
} from "./schemas";

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export type HttpClientOptions = {
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  chatTimeoutMs?: number;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  token?: string;
  body?: unknown;
  timeoutMs?: number;
};

export function createHttpClient(baseUrl: string, options: HttpClientOptions = {}): ApiClient {
  const root = baseUrl.replace(/\/+$/, "");
  const doFetch: FetchLike = options.fetchImpl ?? ((input, init) => globalThis.fetch(input, init));
  const timeoutMs = options.timeoutMs ?? 10_000;
  const chatTimeoutMs = options.chatTimeoutMs ?? 60_000;

  async function request<T>(schema: ZodType<T>, path: string, req: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), req.timeoutMs ?? timeoutMs);
    let response: Response;
    try {
      response = await doFetch(`${root}${path}`, {
        method: req.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
          ...(req.token ? { Authorization: `Bearer ${req.token}` } : {}),
        },
        body: req.body === undefined ? undefined : JSON.stringify(req.body),
        signal: controller.signal,
      });
    } catch {
      throw new ApiError(controller.signal.aborted ? "timeout" : "network", 0);
    } finally {
      clearTimeout(timer);
    }

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const body = (payload ?? {}) as { error?: unknown; message?: unknown };
      throw new ApiError(
        typeof body.error === "string" ? body.error : "http_error",
        response.status,
        typeof body.message === "string" ? body.message : undefined,
      );
    }

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      throw new ApiError("bad_response", response.status);
    }
    return parsed.data;
  }

  return {
    login: (login, password) =>
      request(loginResponseSchema, "/api/auth/login", { method: "POST", body: { login, password } }),
    getChecklist: (token) => request(checklistSchema, "/api/checklist", { token }),
    updateChecklistItem: (token, itemId, status) =>
      request(checklistItemSchema, `/api/checklist/items/${encodeURIComponent(itemId)}`, {
        method: "PATCH",
        token,
        body: { status },
      }),
    sendChat: (token, message) =>
      request(chatResponseSchema, "/api/chat", {
        method: "POST",
        token,
        body: { message },
        timeoutMs: chatTimeoutMs,
      }),
    createTimeOff: (token, draft) =>
      request(timeOffRequestSchema, "/api/time-off", { method: "POST", token, body: draft }),
    listTimeOff: (token) => request(timeOffListSchema, "/api/time-off", { token }),
  };
}
