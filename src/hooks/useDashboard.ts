import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../api/dashboard';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboardStats });
}
