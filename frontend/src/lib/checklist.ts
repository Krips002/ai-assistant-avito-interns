import type { Checklist, ItemStatus, Stage } from "../api/schemas";

export const statusLabel: Record<ItemStatus, string> = {
  todo: "не начато",
  in_progress: "в процессе",
  done: "готово",
};

export function computeNextStep(stages: Stage[]): Checklist["nextStep"] {
  for (const stage of stages) {
    for (const item of stage.items) {
      if (item.status !== "done") {
        return { itemId: item.id, title: item.title };
      }
    }
  }
  return null;
}

export function withItemStatus(checklist: Checklist, itemId: string, status: ItemStatus): Checklist {
  const stages = checklist.stages.map((stage) => ({
    ...stage,
    items: stage.items.map((item) => (item.id === itemId ? { ...item, status } : item)),
  }));
  return { stages, nextStep: computeNextStep(stages) };
}
