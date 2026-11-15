import { errorText } from "../api/errors";
import { useChecklist, useToggleItem } from "../hooks/queries";
import { statusLabel } from "../lib/checklist";

export function Roadmap() {
  const checklist = useChecklist();
  const toggle = useToggleItem();

  if (checklist.isPending) {
    return (
      <section className="panel">
        <p className="muted">Загружаем маршрут…</p>
      </section>
    );
  }

  if (checklist.isError) {
    return (
      <section className="panel">
        <p className="error" role="alert">
          {errorText(checklist.error)}
        </p>
        <button type="button" onClick={() => checklist.refetch()}>
          Повторить
        </button>
      </section>
    );
  }

  const { stages, nextStep } = checklist.data;
  const items = stages.flatMap((stage) => stage.items);
  const done = items.filter((item) => item.status === "done").length;
  const percent = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <section className="panel" aria-labelledby="roadmap-title">
      <div className="panel-head">
        <h2 id="roadmap-title">Маршрут адаптации</h2>
        <span className="counter">
          {done} из {items.length}
        </span>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-label="Пройдено пунктов"
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={done}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="next">{nextStep ? `Следующий шаг: ${nextStep.title}` : "Все пункты маршрута пройдены"}</p>
      {toggle.isError && (
        <p className="error" role="alert">
          Не удалось сохранить отметку. Попробуйте ещё раз.
        </p>
      )}

      {stages.map((stage) => {
        const stageDone = stage.items.filter((item) => item.status === "done").length;
        return (
          <section key={stage.id} className="stage" aria-labelledby={`stage-${stage.id}`}>
            <h3 id={`stage-${stage.id}`}>
              {stage.title}
              <span className="period">{stage.period}</span>
              <span className="stage-count">
                {stageDone}/{stage.items.length}
              </span>
            </h3>
            <ul className="tasks">
              {stage.items.map((item) => {
                const isDone = item.status === "done";
                return (
                  <li key={item.id} className={isDone ? "is-done" : undefined}>
                    <button
                      type="button"
                      className={`check ${item.status}`}
                      aria-pressed={isDone}
                      aria-label={isDone ? `Вернуть в работу: ${item.title}` : `Отметить выполненным: ${item.title}`}
                      onClick={() => toggle.mutate({ id: item.id, status: isDone ? "todo" : "done" })}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path
                          d="M3 8.5 6.5 12 13 4.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <span className="task-title">{item.title}</span>
                    <span className={`status ${item.status}`}>{statusLabel[item.status]}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </section>
  );
}
