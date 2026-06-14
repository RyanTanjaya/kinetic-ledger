import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchInvoices,
  createInvoice,
  markInvoicePaid,
  deleteInvoice,
  type InvoiceInput,
} from '../api/invoices';

// Invoice mutations touch dashboard totals + client detail + the list, so we
// invalidate all three on success.
function useInvoiceMutation<T>(fn: (arg: T) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useInvoices() {
  return useQuery({ queryKey: ['invoices'], queryFn: fetchInvoices });
}

export function useCreateInvoice() {
  return useInvoiceMutation<InvoiceInput>(createInvoice);
}

export function useMarkInvoicePaid() {
  return useInvoiceMutation<string>(markInvoicePaid);
}

export function useDeleteInvoice() {
  return useInvoiceMutation<string>(deleteInvoice);
}
