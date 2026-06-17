import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject, updateProject, deleteProject, type ProjectInput } from '../api/projects';

export function useCreateProject(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectInput) => createProject(clientId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients', clientId] }),
  });
}

export function useDeleteProject(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients', clientId] }),
  });
}

export function useUpdateProject(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProjectInput }) => updateProject(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients', clientId] }),
  });
}
