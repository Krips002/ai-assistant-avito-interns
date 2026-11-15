import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { createClientFromEnv } from "./api";
import { ApiProvider } from "./api/context";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const apiClient = createClientFromEnv(import.meta.env);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={apiClient}>
        <App />
      </ApiProvider>
    </QueryClientProvider>
  </StrictMode>,
);
