import type {
  ChatResponse,
  Checklist,
  ChecklistItem,
  ItemStatus,
  LoginResponse,
  TimeOffDraft,
  TimeOffRequest,
} from "./schemas";

export interface ApiClient {
  login(login: string, password: string): Promise<LoginResponse>;
  getChecklist(token: string): Promise<Checklist>;
  updateChecklistItem(token: string, itemId: string, status: ItemStatus): Promise<ChecklistItem>;
  sendChat(token: string, message: string): Promise<ChatResponse>;
  createTimeOff(token: string, draft: TimeOffDraft): Promise<TimeOffRequest>;
  listTimeOff(token: string): Promise<TimeOffRequest[]>;
}
