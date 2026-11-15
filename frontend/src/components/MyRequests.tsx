import type { TimeOffRequest } from "../api/schemas";
import { useTimeOffList } from "../hooks/queries";
import { formatRange } from "../lib/dates";

export const requestStatusLabel: Record<TimeOffRequest["status"], string> = {
  pending: "на согласовании",
  approved: "согласована",
  rejected: "отклонена",
};

export function MyRequests() {
  const requests = useTimeOffList();

  return (
    <section className="panel" aria-labelledby="requests-title">
      <h2 id="requests-title">Мои заявки</h2>
      {requests.isPending ? (
        <p className="muted">Загружаем заявки…</p>
      ) : requests.isError ? (
        <p className="error" role="alert">
          Не удалось загрузить заявки.
        </p>
      ) : requests.data.length === 0 ? (
        <p className="muted">Заявок пока нет. Напишите помощнику, на какой день нужен отгул.</p>
      ) : (
        <ul className="requests">
          {requests.data.map((request) => (
            <li key={request.id}>
              <strong>{request.id}</strong>
              <span className="request-dates">Отгул · {formatRange(request.dateFrom, request.dateTo)}</span>
              <span className={`status ${request.status}`}>{requestStatusLabel[request.status]}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
