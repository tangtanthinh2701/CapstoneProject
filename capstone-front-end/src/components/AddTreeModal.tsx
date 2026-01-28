import { useState, useEffect } from 'react';
import { fetchTreeSpecies, type TreeSpecies } from '../models/treeSpecies.api';
import { addTreeToFarm, type AddTreeToFarmPayload } from '../models/farm.api';

interface Props {
  farmId: number;
  farmLatitude: number;
  farmLongitude: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTreeModal({
  farmId,
  farmLatitude,
  farmLongitude,
  onClose,
  onSuccess,
}: Props) {
  const [treeSpeciesList, setTreeSpeciesList] = useState<TreeSpecies[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<AddTreeToFarmPayload>({
    farmId,
    treeSpeciesId: 0,
    numberTrees: 0,
    latitude: farmLatitude,
    longitude: farmLongitude,
    plantingDate: new Date().toISOString().split('T')[0],
    currentAvgHeight: 0,
    currentAvgTrunkDiameter: 0,
    currentAvgCanopyDiameter: 0,
  });

  useEffect(() => {
    fetchTreeSpecies()
      .then((res: any) => setTreeSpeciesList(res.data || res))
      .catch((err) => console.error('Error loading tree species:', err));
  }, []);

  const updateField = <K extends keyof AddTreeToFarmPayload>(
    key: K,
    value: AddTreeToFarmPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (form.treeSpeciesId === 0) {
      setError('Vui lòng chọn loài cây');
      return;
    }
    if (form.numberTrees <= 0) {
      setError('Số lượng cây phải lớn hơn 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addTreeToFarm(form);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Thêm cây thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold text-white'>
            Thêm cây vào nông trại
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <span className='material-icons'>close</span>
          </button>
        </div>

        {error && (
          <div className='mb-4 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl'>
            {error}
          </div>
        )}

        <div className='space-y-4'>
          {/* TREE SPECIES */}
          <div>
            <label className='block text-sm mb-2 text-gray-300'>
              Loài cây <span className='text-red-400'>*</span>
            </label>
            <select
              className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
              value={form.treeSpeciesId}
              onChange={(e) =>
                updateField('treeSpeciesId', parseInt(e.target.value))
              }
            >
              <option value={0}>-- Chọn loài cây --</option>
              {treeSpeciesList.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.name} - {species.scientificName}
                </option>
              ))}
            </select>
          </div>

          {/* NUMBER OF TREES */}
          <div>
            <label className='block text-sm mb-2 text-gray-300'>
              Số lượng cây <span className='text-red-400'>*</span>
            </label>
            <input
              type='text'
              className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
              placeholder='10000'
              value={form.numberTrees || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                updateField('numberTrees', val === '' ? 0 : parseInt(val));
              }}
            />
          </div>

          {/* COORDINATES */}
          <div className='flex items-center justify-between'>
            <label className='block text-sm text-gray-300'>Vị trí (Tọa độ)</label>
            <button
              onClick={() => {
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition((pos) => {
                  updateField('latitude', pos.coords.latitude);
                  updateField('longitude', pos.coords.longitude);
                });
              }}
              className='text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1'
            >
              <span className='material-icons text-xs'>my_location</span>
              Lấy vị trí hiện tại
            </button>
          </div>
          <div className='grid grid-cols-2 gap-4 mt-2'>
            <div>
              <label className='block text-xs mb-1 text-gray-500'>Vĩ độ (Latitude)</label>
              <input
                type='text'
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
                value={form.latitude}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.-]/g, '');
                  updateField('latitude', val === '' ? 0 : parseFloat(val));
                }}
              />
            </div>

            <div>
              <label className='block text-xs mb-1 text-gray-500'>Kinh độ (Longitude)</label>
              <input
                type='text'
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
                value={form.longitude}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.-]/g, '');
                  updateField('longitude', val === '' ? 0 : parseFloat(val));
                }}
              />
            </div>
          </div>

          {/* MEASUREMENTS */}
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <label className='block text-xs mb-1 text-gray-400'>Chiều cao TB (cm)</label>
              <input
                type='text'
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
                placeholder='250.5'
                value={form.currentAvgHeight || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  updateField('currentAvgHeight', val === '' ? 0 : parseFloat(val));
                }}
              />
            </div>

            <div>
              <label className='block text-xs mb-1 text-gray-400'>Đường kính thân (cm)</label>
              <input
                type='text'
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
                placeholder='8.2'
                value={form.currentAvgTrunkDiameter || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  updateField('currentAvgTrunkDiameter', val === '' ? 0 : parseFloat(val));
                }}
              />
            </div>

            <div>
              <label className='block text-xs mb-1 text-gray-400'>Đường kính tán (cm)</label>
              <input
                type='text'
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
                placeholder='180.0'
                value={form.currentAvgCanopyDiameter || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  updateField('currentAvgCanopyDiameter', val === '' ? 0 : parseFloat(val));
                }}
              />
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className='flex justify-end gap-3 mt-6'>
          <button
            onClick={onClose}
            className='px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white'
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className='px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-black font-semibold disabled:opacity-50'
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Thêm cây'}
          </button>
        </div>
      </div>
    </div>
  );
}
