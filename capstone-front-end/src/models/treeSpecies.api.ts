export interface TreeSpecies {
  id: number;
  name: string;
  scientificName: string;
  carbonAbsorptionRate: number;
  growthRate: string;
  hasCommercialValue: boolean;
  isActive: boolean;
}

export interface TreeSpeciesPayload {
  name: string;
  scientificName: string;
  carbonAbsorptionRate: number;
  description?: string;
  imageUrl?: string;
  typicalHeight?: number;
  typicalDiameter?: number;
  typicalLifespan?: number;
  growthRate: 'SLOW' | 'MEDIUM' | 'FAST';
  climateZones: string[];
  soilTypes: string[];
  waterRequirement: 'LOW' | 'MEDIUM' | 'HIGH';
  sunlightRequirement: 'FULL_SUN' | 'PARTIAL_SHADE' | 'SHADE';
  woodValue?: number;
  fruitValue?: number;
  hasCommercialValue: boolean;
  isActive: boolean;
}

export const createTreeSpecies = async (payload: TreeSpeciesPayload) => {
  const token = localStorage.getItem('token');

  const res = await fetch(
    `http://localhost:8088/api/tree-species/create-treeSpecies`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) throw await res.json();
  return res.json();
};

export const updateTreeSpecies = async (
  id: number,
  payload: TreeSpeciesPayload,
) => {
  const token = localStorage.getItem('token');

  const res = await fetch(`http://localhost:8088/api/tree-species/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw await res.json();
  return res.json();
};

export const getTreeSpeciesById = async (id: number) => {
  const token = localStorage.getItem('token');

  const res = await fetch(`http://localhost:8088/api/tree-species/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw await res.json();
  return res.json();
};

export const fetchTreeSpecies = async (): Promise<TreeSpecies[]> => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:8088/api/tree-species/active', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Cannot load TreeSpecies');
  const result = await res.json();
  return result.data.content;
};

export const getTreeSpeciesList = async (): Promise<TreeSpecies[]> => {
  const token = localStorage.getItem('token');

  const res = await fetch('http://localhost:8088/api/tree-species', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Không tải được danh sách loại cây');
  const json = await res.json();
  return json.data.content ?? json;
};

export const deleteTreeSpecies = async (id: number) => {
  const token = localStorage.getItem('token');

  const res = await fetch(`http://localhost:8088/api/tree-species/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Xóa loại cây thất bại');
};
