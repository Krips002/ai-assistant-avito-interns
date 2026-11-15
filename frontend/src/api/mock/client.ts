import { computeNextStep } from "../../lib/checklist";
import { toIsoDate } from "../../lib/dates";
import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { Checklist, ItemStatus, TimeOffDraft, TimeOffRequest, User } from "../schemas";
import { answer } from "./assistant";
import { initialStatuses, mockUsers, stageTemplate, type MockUser } from "./data";

export type MockClientOptions = {
  latencyMs?: number;
  chatLatencyMs?: number;
  now?: () => Date;
};

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function wait(ms: number): Promise<void> {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

function tokenFor(user: MockUser): string {
  return `mock-token-${user.id}`;
}

function publicUser(user: MockUser): User {
  return { id: user.id, name: user.name, role: user.role, team: user.team, buddyName: user.buddyName };
}

function validateDraft(draft: TimeOffDraft, today: string): void {
  if (!isoDate.test(draft.dateFrom) || !isoDate.test(draft.dateTo)) {
    throw new ApiError("validation", 400, "Укажите даты отгула.");
  }
  if (draft.dateFrom < today) {
    throw new ApiError("validation", 400, "Нельзя оформить отгул на прошедшую дату.");
  }
  if (draft.dateTo < draft.dateFrom) {
    throw new ApiError("validation", 400, "Дата окончания раньше даты начала.");
  }
}

export function createMockClient(options: MockClientOptions = {}): ApiClient {
  const latency = options.latencyMs ?? 150;
  const chatLatency = options.chatLatencyMs ?? 700;
  const now = options.now ?? (() => new Date());

  const statuses = new Map<string, Record<string, ItemStatus>>(
    mockUsers.map((user) => [user.id, { ...initialStatuses[user.id] }]),
  );
  const requests = new Map<string, TimeOffRequest[]>(mockUsers.map((user) => [user.id, []]));
  let nextNumber = 1042;

  function userByToken(token: string): MockUser {
    const user = mockUsers.find((candidate) => tokenFor(candidate) === token);
    if (!user) {
      throw new ApiError("unauthorized", 401);
    }
    return user;
  }

  function checklistFor(user: MockUser): Checklist {
    const own = statuses.get(user.id) ?? {};
    const stages = stageTemplate.map((stage) => ({
      ...stage,
      items: stage.items.map((item) => ({ ...item, status: own[item.id] ?? "todo" })),
    }));
    return { stages, nextStep: computeNextStep(stages) };
  }

  return {
    async login(login, password) {
      await wait(latency);
      const user = mockUsers.find(
        (candidate) => candidate.login === login.trim().toLowerCase() && candidate.password === password,
      );
      if (!user) {
        throw new ApiError("invalid_credentials", 401);
      }
      return { token: tokenFor(user), user: publicUser(user) };
    },

    async getChecklist(token) {
      await wait(latency);
      return checklistFor(userByToken(token));
    },

    async updateChecklistItem(token, itemId, status) {
      await wait(latency);
      const user = userByToken(token);
      const item = stageTemplate.flatMap((stage) => stage.items).find((candidate) => candidate.id === itemId);
      if (!item) {
        throw new ApiError("not_found", 404);
      }
      statuses.set(user.id, { ...statuses.get(user.id), [itemId]: status });
      return { ...item, status };
    },

    async sendChat(token, message) {
      await wait(chatLatency);
      const user = userByToken(token);
      return answer({
        user,
        message,
        checklist: checklistFor(user),
        others: mockUsers.filter((candidate) => candidate.id !== user.id),
        now: now(),
      });
    },

    async createTimeOff(token, draft) {
      await wait(latency);
      const user = userByToken(token);
      validateDraft(draft, toIsoDate(now()));
      const request: TimeOffRequest = {
        id: `ОТГ-${nextNumber++}`,
        dateFrom: draft.dateFrom,
        dateTo: draft.dateTo,
        status: "pending",
        approver: user.leadName,
        createdAt: now().toISOString(),
      };
      requests.set(user.id, [request, ...(requests.get(user.id) ?? [])]);
      return request;
    },

    async listTimeOff(token) {
      await wait(latency);
      return [...(requests.get(userByToken(token).id) ?? [])];
    },
  };
}
