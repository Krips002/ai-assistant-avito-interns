import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["intern", "buddy", "lead"]),
  team: z.string(),
  buddyName: z.string(),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});

export const itemStatusSchema = z.enum(["todo", "in_progress", "done"]);

export const checklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: itemStatusSchema,
});

export const stageSchema = z.object({
  id: z.string(),
  title: z.string(),
  period: z.string(),
  items: z.array(checklistItemSchema),
});

export const checklistSchema = z.object({
  stages: z.array(stageSchema),
  nextStep: z.object({ itemId: z.string(), title: z.string() }).nullable(),
});

export const timeOffDraftSchema = z.object({
  dateFrom: isoDate,
  dateTo: isoDate,
});

export const replySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string(),
    sources: z.array(z.string()),
  }),
  z.object({
    type: z.literal("time_off_draft"),
    text: z.string(),
    draft: timeOffDraftSchema,
  }),
]);

export const chatResponseSchema = z.object({
  mode: z.enum(["llm", "fallback"]),
  reply: replySchema,
});

export const timeOffRequestSchema = z.object({
  id: z.string(),
  dateFrom: isoDate,
  dateTo: isoDate,
  status: z.enum(["pending", "approved", "rejected"]),
  approver: z.string(),
  createdAt: z.string(),
});

export const timeOffListSchema = z.array(timeOffRequestSchema);

export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type ItemStatus = z.infer<typeof itemStatusSchema>;
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type Stage = z.infer<typeof stageSchema>;
export type Checklist = z.infer<typeof checklistSchema>;
export type TimeOffDraft = z.infer<typeof timeOffDraftSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type ChatMode = ChatResponse["mode"];
export type TimeOffRequest = z.infer<typeof timeOffRequestSchema>;
