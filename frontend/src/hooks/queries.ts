import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../api/context";
import type { Checklist, ItemStatus } from "../api/schemas";
import { withItemStatus } from "../lib/checklist";
import { useSession } from "../store/session";

function useToken(): string {
  return useSession((state) => state.token) ?? "";
}

export function useChecklist() {
  const api = useApi();
  const token = useToken();
  return useQuery({
    queryKey: ["checklist", token],
    queryFn: () => api.getChecklist(token),
    enabled: token !== "",
  });
}

export function useTimeOffList() {
  const api = useApi();
  const token = useToken();
  return useQuery({
    queryKey: ["time-off", token],
    queryFn: () => api.listTimeOff(token),
    enabled: token !== "",
  });
}

export function useToggleItem() {
  const api = useApi();
  const token = useToken();
  const queryClient = useQueryClient();
  const key = ["checklist", token];

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ItemStatus }) => api.updateChecklistItem(token, id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Checklist>(key);
      if (previous) {
        queryClient.setQueryData(key, withItemStatus(previous, id, status));
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useSendChat() {
  const api = useApi();
  const token = useToken();
  return useMutation({
    mutationFn: (message: string) => api.sendChat(token, message),
  });
}

export function useCreateTimeOff() {
  const api = useApi();
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: { dateFrom: string; dateTo: string }) => api.createTimeOff(token, draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time-off", token] }),
  });
}
