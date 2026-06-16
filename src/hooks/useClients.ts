import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchClients,
  fetchClientDetail,
  createClient,
  updateClient,
  deleteClient,
  type ClientInput,
  type ClientUpdate,
} from '../api/clients';

export function useClients() {
  return useQuery({ queryKey: ['clients'], queryFn: fetchClients });
}

export function useClientDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => fetchClientDetail(id as string),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientInput) => createClient(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ClientUpdate }) => updateClient(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}
