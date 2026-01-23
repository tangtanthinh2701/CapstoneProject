import api from '../utils/api';

export interface TreeSpecies {
  id: number;
  name: string;
  scientificName?: string;
  baseCarbonRate: number; // Matches DB: base_carbon_rate
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  // Computed fields (if backend provides them)
  estimatedCarbonPerYear?: number;
  estimatedCarbon5Years?: number;
  estimatedCarbon10Years?: number;
}

export interface TreeSpeciesPayload {
  name: string;
  scientificName?: string;
  baseCarbonRate: number;
  description?: string;
  imageUrl?: string;
}

export const getTreeSpeciesList = async (params?: any) => {
  return api.get('/tree-species', { params });
};

export const getTreeSpeciesById = async (id: number) => {
  return api.get(`/tree-species/${id}`);
};

export const createTreeSpecies = async (data: TreeSpeciesPayload) => {
  return api.post('/tree-species', data);
};

export const updateTreeSpecies = async (id: number, data: TreeSpeciesPayload) => {
  return api.put(`/tree-species/${id}`, data);
};

export const deleteTreeSpecies = async (id: number) => {
  return api.delete(`/tree-species/${id}`);
};

// Legacy alias for backward compatibility
export const fetchTreeSpecies = getTreeSpeciesList;
