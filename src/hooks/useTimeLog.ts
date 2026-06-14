import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProjectTimeLog,
  createTimeEntry,
  deleteTimeEntry,
  type TimeEntryInput,
} from '../api/timeEntries';

export function useTimeLog(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProjectTimeLog(projectId as string),
    enabled: !!projectId,
  });
}

export function useAddTimeEntry(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TimeEntryInput) => createTimeEntry(projectId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', projectId] }),
  });
}

export function useDeleteTimeEntry(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTimeEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', projectId] }),
  });
}
