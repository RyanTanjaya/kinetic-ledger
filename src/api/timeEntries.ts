import { api } from '../lib/api';
import { Project, TimeEntry } from '../types';

export interface TimeLogData {
  project: Project;
  entries: TimeEntry[];
}

// Loads a project (with its client) + its time entries, mapped to UI types.
export async function fetchProjectTimeLog(projectId: string): Promise<TimeLogData> {
  const r = await api.get(`/api/projects/${projectId}`);
  const p = r.data.project;
  const clientName = p.client?.name ?? '';

  const project: Project = {
    id: p.id,
    clientId: p.clientId,
    clientName,
    title: p.title,
    description: p.description ?? '',
    status: p.status,
    hourlyRate: p.hourlyRate,
    totalHours: p.totalHours ?? 0,
    budget: p.totalBudget ?? undefined,
  };

  const entries: TimeEntry[] = (p.timeEntries ?? []).map((t: any) => ({
    id: t.id,
    projectId: p.id,
    projectTitle: p.title,
    clientId: p.clientId,
    clientName,
    date: new Date(t.date).toISOString().slice(0, 10),
    description: t.description,
    hours: t.hours,
    earnings: t.hours * p.hourlyRate,
  }));

  return { project, entries };
}

export interface TimeEntryInput {
  date: string;
  description: string;
  hours: number;
}

export async function createTimeEntry(projectId: string, input: TimeEntryInput): Promise<void> {
  await api.post(`/api/projects/${projectId}/time-entries`, input);
}

export async function deleteTimeEntry(id: string): Promise<void> {
  await api.delete(`/api/time-entries/${id}`);
}
