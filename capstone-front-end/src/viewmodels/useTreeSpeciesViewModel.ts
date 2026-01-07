import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
  createTreeSpecies,
  updateTreeSpecies,
  getTreeSpeciesById,
  getTreeSpeciesList,
  deleteTreeSpecies,
  type TreeSpecies,
  type TreeSpeciesPayload,
} from '../models/treeSpecies.api';

// ========== FORM VIEWMODEL ==========
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
  });

  /** LOAD DATA FOR EDIT */
  useEffect(() => {
    if (!isEdit) {
      setInitialLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        console.log('🔵 Loading tree species ID:', id);

        const response = await getTreeSpeciesById(Number(id));

        console.log('✅ API Response:', response);

        if (!response.success || !response.data) {
          throw new Error('Không tải được dữ liệu loài cây');
        }

        const data = response.data;

        setForm({
          name: data.name,
          scientificName: data.scientificName,
          carbonAbsorptionRate: data.carbonAbsorptionRate,
          description: data.description || '',
          imageUrl: data.imageUrl || '',
        });

        console.log('✅ Form loaded successfully');
      } catch (err: any) {
        console.error('❌ Error loading tree species:', err);
        setError(err.message || 'Không tải được dữ liệu loài cây');
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  /** UPDATE FIELD */
  const updateField = <K extends keyof TreeSpeciesPayload>(
    key: K,
    value: TreeSpeciesPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /** VALIDATE */
  const validate = (): boolean => {
    if (!form.name.trim()) {
      setError('Tên cây không được để trống');
      return false;
    }
    if (!form.scientificName.trim()) {
      setError('Tên khoa học không được để trống');
      return false;
    }
    if (form.carbonAbsorptionRate <= 0) {
      setError('Tỷ lệ hấp thụ carbon phải lớn hơn 0');
      return false;
    }
    return true;
  };

  /** SAVE */
  const save = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: TreeSpeciesPayload = {
        name: form.name.trim(),
        scientificName: form.scientificName.trim(),
        carbonAbsorptionRate: form.carbonAbsorptionRate,
        description: form.description?.trim() || undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
      };

      if (isEdit) {
        const response = await updateTreeSpecies(Number(id), payload);
        console.log('✅ Update success:', response);
        return response;
      } else {
        const response = await createTreeSpecies(payload);
        console.log('✅ Create success:', response);
        return response;
      }
    } catch (e: any) {
      console.error('❌ Save failed:', e);
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
    save,
  };
};

// ========== LIST VIEWMODEL ==========
export const useTreeSpeciesViewModel = () => {
  const [data, setData] = useState<TreeSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pageInfo, setPageInfo] = useState<any>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTreeSpeciesList();

      console.log('✅ Tree species list loaded:', response);

      if (response.success && response.data) {
        setData(response.data);
        setPageInfo(response.pageInfo);
      } else {
        throw new Error('Không tải được danh sách loài cây');
      }
    } catch (e: any) {
      console.error('❌ Error loading tree species list:', e);
      setError(e.message || 'Không tải được danh sách loài cây');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa loài cây này?')) return;

    try {
      await deleteTreeSpecies(id);
      await load(); // Reload list
    } catch (e: any) {
      alert(e.message || 'Xóa thất bại');
    }
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
    pageInfo,
    remove,
    reload: load,
  };
};
