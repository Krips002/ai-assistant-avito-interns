import type { ApiClient } from "./client";
import { createHttpClient } from "./http";
import { createMockClient } from "./mock/client";

type ApiEnv = {
  VITE_API_MODE?: string;
  VITE_API_URL?: string;
};

export function createClientFromEnv(env: ApiEnv): ApiClient {
  if (env.VITE_API_MODE === "http") {
    return createHttpClient(env.VITE_API_URL ?? "");
  }
  return createMockClient();
}
