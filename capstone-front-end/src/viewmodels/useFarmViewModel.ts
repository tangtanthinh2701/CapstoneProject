import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import {
  getFarmList,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
  addTreeToFarm,
  getFarmTrees,
  type Farm,
  type FarmPayload,
  type FarmTree,
  type AddTreeToFarmPayload,
} from '../models/farm.api';

// ========== FARM LIST VIEWMODEL ==========
export const useFarmViewModel = () => {
  const [data, setData] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pageInfo, setPageInfo] = useState<any>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getFarmList();

      if (response.success && response.data) {
        setData(response.data);
        setPageInfo(response.pageInfo);
      } else {
        throw new Error('Không tải được danh sách nông trại');
      }
    } catch (e: any) {
      console.error('Error loading farms:', e);
      setError(e.message || 'Không tải được danh sách nông trại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa nông trại này?')) return;

    try {
      await deleteFarm(id);
      await load();
    } catch (e: any) {
      alert(e.message || 'Xóa thất bại');
    }
  };

  const filtered = data.filter(
    (x) =>
      x.name.toLowerCase().includes(search.toLowerCase()) ||
      x.location.toLowerCase().includes(search.toLowerCase()) ||
      x.code.toLowerCase().includes(search.toLowerCase()),
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

// ========== FARM FORM VIEWMODEL ==========
export const useFarmFormViewModel = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FarmPayload>({
    name: '',
    description: '',
    location: '',
    latitude: 0,
    longitude: 0,
    area: 0,
    usableArea: 0,
    soilType: '',
    climateZone: '',
    avgRainfall: 0,
    avgTemperature: 0,
    farmStatus: 'ACTIVE',
    plantingDate: '',
  });

  useEffect(() => {
    if (!isEdit) {
      setInitialLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        const response = await getFarmById(Number(id));

        if (!response.success || !response.data) {
          throw new Error('Không tải được dữ liệu nông trại');
        }

        const data = response.data;

        setForm({
          name: data.name,
          description: data.description || '',
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          area: data.area,
          usableArea: data.usableArea,
          soilType: data.soilType,
          climateZone: data.climateZone,
          avgRainfall: data.avgRainfall,
          avgTemperature: data.avgTemperature,
          farmStatus: data.farmStatus,
          plantingDate: data.plantingDate,
        });
      } catch (err: any) {
        console.error('Error loading farm:', err);
        setError(err.message || 'Không tải được dữ liệu nông trại');
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const updateField = <K extends keyof FarmPayload>(
    key: K,
    value: FarmPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    if (!form.name.trim()) {
      setError('Tên nông trại không được để trống');
      return false;
    }
    if (!form.location.trim()) {
      setError('Địa điểm không được để trống');
      return false;
    }
    if (form.area <= 0) {
      setError('Diện tích phải lớn hơn 0');
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        const response = await updateFarm(Number(id), form);
        console.log('✅ Update success:', response);
        return response;
      } else {
        const response = await createFarm(form);
        console.log('✅ Create success:', response);
        return response;
      }
    } catch (e: any) {
      console.error('❌ Save failed:', e);
      setError(e.message || 'Lưu nông trại thất bại');
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

// ========== FARM DETAIL VIEWMODEL ==========
export const useFarmDetailViewModel = () => {
  const { id } = useParams();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [trees, setTrees] = useState<FarmTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const [farmResponse, treesData] = await Promise.all([
        getFarmById(Number(id)),
        getFarmTrees(Number(id)).catch(() => []),
      ]);

      if (!farmResponse.success || !farmResponse.data) {
        throw new Error('Không tìm thấy nông trại');
      }

      setFarm(farmResponse.data);
      setTrees(treesData);
    } catch (err: any) {
      console.error('Error loading farm detail:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const addTree = async (payload: AddTreeToFarmPayload) => {
    try {
      await addTreeToFarm(payload);
      await load(); // Reload data
    } catch (err: any) {
      throw err;
    }
  };

  return {
    farm,
    trees,
    loading,
    error,
    addTree,
    reload: load,
  };
};
