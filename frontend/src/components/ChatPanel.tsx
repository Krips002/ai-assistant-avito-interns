import { useEffect, useRef, useState, type FormEvent } from "react";
import { errorText } from "../api/errors";
import type { User } from "../api/schemas";
import { useSendChat } from "../hooks/queries";
import { formatRange } from "../lib/dates";
import { useChat, type ChatEntry, type ErrorEntry } from "../store/chat";
import { requestStatusLabel } from "./MyRequests";
import { TimeOffDraftCard } from "./TimeOffDraftCard";

const suggestions = ["Когда стендап?", "Где лежат задачи?", "Что мне делать дальше?", "Хочу отгул в пятницу"];

const modeLabel = {
  llm: "Ответы ИИ по шпаргалке команды",
  fallback: "Без ИИ: поиск по шпаргалке команды",
};

export function ChatPanel({ user, hidden }: { user: User; hidden: boolean }) {
  const entries = useChat((state) => state.entries);
  const mode = useChat((state) => state.mode);
  const push = useChat((state) => state.push);
  const remove = useChat((state) => state.remove);
  const setMode = useChat((state) => state.setMode);
  const send = useSendChat();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [entries.length, send.isPending, hidden]);

  function request(message: string) {
    send.mutate(message, {
      onSuccess: (response) => {
        setMode(response.mode);
        if (response.reply.type === "text") {
          push({ kind: "bot", text: response.reply.text, sources: response.reply.sources });
        } else {
          push({ kind: "draft", text: response.reply.text, draft: response.reply.draft, state: "open" });
        }
      },
      onError: (error) => push({ kind: "error", text: errorText(error), retry: message }),
    });
  }

  function ask(message: string) {
    const trimmed = message.trim();
    if (!trimmed || send.isPending) {
      return;
    }
    push({ kind: "user", text: trimmed });
    request(trimmed);
  }

  function retry(entry: ErrorEntry) {
    remove(entry.id);
    request(entry.retry);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(text);
    setText("");
  }

  return (
    <section id="chat" className="chat" hidden={hidden} aria-labelledby="chat-title">
      <div className="chat-head">
        <h2 id="chat-title">Помощник</h2>
        {mode && <span className="mode">{modeLabel[mode]}</span>}
      </div>
      <div className="messages" ref={listRef} aria-live="polite">
        <article className="bubble bot">
          <span className="who">Помощник</span>
          <p>
            Привет, {user.name}! Подскажу, как устроены команда и инструменты, и помогу оформить отгул. Если ответа
            не знаю, честно скажу и подскажу спросить наставника — {user.buddyName}.
          </p>
        </article>
        {entries.map((entry) => (
          <Entry key={entry.id} entry={entry} userName={user.name} onRetry={retry} />
        ))}
        {send.isPending && (
          <p className="typing" role="status">
            Помощник думает
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </p>
        )}
      </div>
      {entries.length === 0 && (
        <div className="chips">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" className="chip" onClick={() => ask(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      )}
      <form className="composer" onSubmit={submit}>
        <label className="sr-only" htmlFor="question">
          Напишите вопрос
        </label>
        <input
          id="question"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Напишите вопрос"
          autoComplete="off"
        />
        <button type="submit" disabled={send.isPending || !text.trim()}>
          Отправить
        </button>
      </form>
    </section>
  );
}

function Entry({
  entry,
  userName,
  onRetry,
}: {
  entry: ChatEntry;
  userName: string;
  onRetry: (entry: ErrorEntry) => void;
}) {
  switch (entry.kind) {
    case "user":
      return (
        <article className="bubble user">
          <span className="who">{userName}</span>
          <p>{entry.text}</p>
        </article>
      );
    case "bot":
      return (
        <article className="bubble bot">
          <span className="who">Помощник</span>
          <p>{entry.text}</p>
          {entry.sources.length > 0 && <p className="source">Источник: {entry.sources.join(", ")}</p>}
        </article>
      );
    case "draft":
      return <TimeOffDraftCard entry={entry} />;
    case "created":
      return (
        <article className="card created">
          <span className="who">Сервис «Отсутствия»</span>
          <p className="card-title">Заявка {entry.request.id} создана</p>
          <p>Отгул: {formatRange(entry.request.dateFrom, entry.request.dateTo)}</p>
          <p>
            Согласует: {entry.request.approver}. Статус: {requestStatusLabel[entry.request.status]}.
          </p>
        </article>
      );
    case "error":
      return (
        <article className="bubble error-bubble" role="alert">
          <p>{entry.text}</p>
          <button type="button" className="ghost small" onClick={() => onRetry(entry)}>
            Повторить
          </button>
        </article>
      );
  }
}
