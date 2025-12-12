import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
  createTreeSpecies,
  updateTreeSpecies,
  getTreeSpeciesById,
  getTreeSpeciesList,
  deleteTreeSpecies,
} from '../models/treeSpecies.api';
import type {
  TreeSpecies,
  TreeSpeciesPayload,
} from '../models/treeSpecies.api';

export const useTreeSpeciesFormViewModel = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<TreeSpeciesPayload>({
    name: '',
    scientificName: '',
    carbonAbsorptionRate: 0,
    description: '',
    imageUrl: '',
    typicalHeight: undefined,
    typicalDiameter: undefined,
    typicalLifespan: undefined,
    growthRate: 'MEDIUM',
    climateZones: [],
    soilTypes: [],
    waterRequirement: 'MEDIUM',
    sunlightRequirement: 'FULL_SUN',
    woodValue: 0,
    fruitValue: 0,
    hasCommercialValue: false,
    isActive: true,
  });

  /** LOAD DATA WHEN UPDATE */
  useEffect(() => {
    if (!isEdit) return;

    getTreeSpeciesById(Number(id))
      .then((res) => {
        const data = res.data ?? res;

        setForm({
          name: data.name,
          scientificName: data.scientificName,
          carbonAbsorptionRate: data.carbonAbsorptionRate,
          description: data.description ?? '',
          imageUrl: data.imageUrl ?? '',
          typicalHeight: data.typicalHeight,
          typicalDiameter: data.typicalDiameter,
          typicalLifespan: data.typicalLifespan,
          growthRate: data.growthRate,
          climateZones: data.climateZones ?? [],
          soilTypes: data.soilTypes ?? [],
          waterRequirement: data.waterRequirement,
          sunlightRequirement: data.sunlightRequirement,
          woodValue: data.woodValue ?? 0,
          fruitValue: data.fruitValue ?? 0,
          hasCommercialValue: data.hasCommercialValue,
          isActive: data.isActive,
        });
      })
      .catch(() => setError('Không tải được dữ liệu loài cây'))
      .finally(() => setInitialLoading(false));
  }, [id, isEdit]);

  /** UPDATE FIELD */
  const updateField = <K extends keyof TreeSpeciesPayload>(
    key: K,
    value: TreeSpeciesPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /** TOGGLE ARRAY FIELD */
  const toggleArrayValue = (
    key: 'climateZones' | 'soilTypes',
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  /** SAVE */
  const save = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        return await updateTreeSpecies(Number(id), form);
      }
      return await createTreeSpecies(form);
    } catch (e: any) {
      setError(e.message || 'Lưu loài cây thất bại');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    isEdit,
    loading,
    initialLoading,
    error,
    form,
    updateField,
    toggleArrayValue,
    save,
  };
};

export const useTreeSpeciesViewModel = () => {
  const [data, setData] = useState<TreeSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setData(await getTreeSpeciesList());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa loại cây này?')) return;
    await deleteTreeSpecies(id);
    load();
  };

  const filtered = data.filter(
    (x) =>
      x.name.toLowerCase().includes(search.toLowerCase()) ||
      x.scientificName.toLowerCase().includes(search.toLowerCase()),
  );

  return {
    loading,
    error,
    search,
    setSearch,
    data: filtered,
    remove,
  };
};
