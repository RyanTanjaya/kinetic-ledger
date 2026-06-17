import { api } from '../lib/api';

export interface ProjectInput {
  title: string;
  description?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  hourlyRate?: number;
  totalBudget?: number;
}

export async function createProject(clientId: string, input: ProjectInput): Promise<void> {
  await api.post(`/api/clients/${clientId}/projects`, input);
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/api/projects/${id}`);
}

export async function updateProject(id: string, input: ProjectInput): Promise<void> {
  await api.put(`/api/projects/${id}`, input);
}
