import type { TreeSpecies } from './treeSpecies.api';

export interface PhaseTreeSpecies {
  id?: number;
  treeSpecies: TreeSpecies;
  quantityPlanned: number;
  quantityActual: number;
  quantityDied: number;
  costPerTree: number;
  plantingCost: number;
  maintenanceCostYearly: number;
  notes: string | null;
}

export interface Phase {
  id?: number;
  phaseNumber: number;
  phaseName: string;
  description: string | null;
  phaseStatus: string;
  startDate: string;
  endDate: string | null;
  expectedDurationDays: number | null;
  actualDurationDays: number | null;
  budget: number;
  actualCost: number;
  notes: string | null;
  treeSpecies: PhaseTreeSpecies[];
}

export interface ProjectDetailResponse {
  id: number;
  code: string;
  name: string;
  description: string | null;
  locationText: string;
  latitude: number;
  longitude: number;
  area: number;
  areaUnit: string;
  usableArea: number;
  plantingDate: string;
  totalTreesPlanned: number;
  totalTreesActual: number;
  plantingDensity: number;
  projectStatus: string;
  managerId: string;
  partnerOrganizations: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  phases: Phase[];
}

export const getProjectById = async (
  id: string,
): Promise<ProjectDetailResponse> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:8088/api/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Cannot load project');
  const result = await res.json();
  return result.data;
};

export const createProject = async (payload: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(
    'http://localhost:8088/api/projects/create-projects',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
  return res.json();
};

export const updateProject = async (id: string, payload: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:8088/api/projects/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deleteProject = async (id: number) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:8088/api/projects/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Delete failed with status ${res.status}`);
  }

  return res.json();
};
