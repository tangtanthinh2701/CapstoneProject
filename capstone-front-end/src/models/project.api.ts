import type { TreeSpecies } from './treeSpecies.api';

const API_BASE_URL = 'http://localhost:8088/api/projects';
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

export const getProjectById = async (id: string) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token không tồn tại.  Vui lòng đăng nhập lại.');
  }

  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Phiên đăng nhập hết hạn');
    }
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();

  // API mới trả về { success, data, ...  }
  if (!json.success) {
    throw new Error(json.message || 'Không thể tải dự án');
  }

  return json; // Trả về toàn bộ response
};

export const createProject = async (payload: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/create-projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updateProject = async (id: string, payload: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/${id}`, {
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
  const res = await fetch(`${API_BASE_URL}/${id}`, {
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
