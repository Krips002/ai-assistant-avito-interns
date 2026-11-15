import { useState } from "react";
import { errorText } from "../api/errors";
import { useCreateTimeOff } from "../hooks/queries";
import { useChat, type DraftEntry } from "../store/chat";

export function TimeOffDraftCard({ entry }: { entry: DraftEntry }) {
  const [dateFrom, setDateFrom] = useState(entry.draft.dateFrom);
  const [dateTo, setDateTo] = useState(entry.draft.dateTo);
  const setDraftState = useChat((state) => state.setDraftState);
  const push = useChat((state) => state.push);
  const create = useCreateTimeOff();
  const locked = entry.state !== "open" || create.isPending;

  function submit() {
    create.mutate(
      { dateFrom, dateTo },
      {
        onSuccess: (request) => {
          setDraftState(entry.id, "sent");
          push({ kind: "created", request });
        },
      },
    );
  }

  function changeFrom(value: string) {
    setDateFrom(value);
    if (value > dateTo) {
      setDateTo(value);
    }
  }

  return (
    <article className="card draft" aria-label="Черновик заявки на отгул">
      <span className="who">Помощник</span>
      <p>{entry.text}</p>
      <div className="dates">
        <label>
          С
          <input type="date" value={dateFrom} onChange={(event) => changeFrom(event.target.value)} disabled={locked} />
        </label>
        <label>
          По
          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={(event) => setDateTo(event.target.value)}
            disabled={locked}
          />
        </label>
      </div>
      {create.isError && (
        <p className="error" role="alert">
          {errorText(create.error)}
        </p>
      )}
      {entry.state === "open" ? (
        <div className="card-actions">
          <button type="button" onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Отправляем…" : "Отправить заявку"}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => setDraftState(entry.id, "cancelled")}
            disabled={create.isPending}
          >
            Отменить
          </button>
        </div>
      ) : (
        <p className="muted">{entry.state === "sent" ? "Заявка отправлена." : "Заявка отменена."}</p>
      )}
    </article>
  );
}
