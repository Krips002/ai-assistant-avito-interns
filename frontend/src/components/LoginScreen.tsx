import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useApi } from "../api/context";
import { errorText } from "../api/errors";
import { useSession } from "../store/session";
import { Brand } from "./Brand";

export function LoginScreen() {
  const api = useApi();
  const signIn = useSession((state) => state.signIn);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => api.login(login, password),
    onSuccess: (data) => signIn(data.token, data.user),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <main className="screen">
      <section className="login-card">
        <Brand />
        <h1>Вход для стажёра</h1>
        <p className="lead">Откройте свои первые недели в команде.</p>
        <form onSubmit={submit}>
          <label>
            Имя
            <input
              name="login"
              autoComplete="username"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              required
            />
          </label>
          <label>
            Пароль
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {mutation.isError && (
            <p className="error" role="alert">
              {errorText(mutation.error)}
            </p>
          )}
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Входим…" : "Войти"}
          </button>
        </form>
      </section>
    </main>
  );
}
