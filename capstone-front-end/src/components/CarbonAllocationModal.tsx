import { useState } from 'react';
import {
  allocateCarbon,
  type CarbonAllocationPayload,
} from '../models/treePurchase.api';

interface Phase {
  id: number;
  phaseOrder: number;
  phaseName: string;
  targetConsumedCarbon: number;
}

interface Props {
  projectPhases: Phase[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CarbonAllocationModal({
  projectPhases,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CarbonAllocationPayload>({
    sourcePhaseId: 0,
    targetPhaseId: 0,
    carbonAmount: 0,
    notes: '',
  });

  const updateField = <K extends keyof CarbonAllocationPayload>(
    key: K,
    value: CarbonAllocationPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (form.sourcePhaseId === 0) {
      setError('Vui lòng chọn giai đoạn nguồn');
      return;
    }
    if (form.targetPhaseId === 0) {
      setError('Vui lòng chọn giai đoạn đích');
      return;
    }
    if (form.sourcePhaseId === form.targetPhaseId) {
      setError('Giai đoạn nguồn và đích không được trùng nhau');
      return;
    }
    if (form.carbonAmount <= 0) {
      setError('Lượng carbon phải lớn hơn 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await allocateCarbon(form);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Phân bổ carbon thất bại');
    } finally {
      setLoading(false);
    }
  };

  const sourcePhase = projectPhases.find((p) => p.id === form.sourcePhaseId);
  const targetPhase = projectPhases.find((p) => p.id === form.targetPhaseId);

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-xl max-w-2xl w-full p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
            <span className='material-icons text-yellow-500'>swap_horiz</span>
            Phân bổ Carbon giữa các Phase
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <span className='material-icons'>close</span>
          </button>
        </div>

        {error && (
          <div className='mb-4 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            {error}
          </div>
        )}

        <div className='space-y-4'>
          {/* INFO BOX */}
          <div className='bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-200'>
            <div className='flex items-start gap-2'>
              <span className='material-icons text-blue-400'>info</span>
              <div>
                <p className='font-semibold mb-1'>Hướng dẫn: </p>
                <p>
                  Chuyển carbon DƯ từ giai đoạn nguồn sang giai đoạn đích (đang
                  THIẾU carbon). Hệ thống sẽ tự động kiểm tra số dư khả dụng.
                </p>
              </div>
            </div>
          </div>

          {/* SOURCE PHASE */}
          <div>
            <label className='block text-sm mb-2 text-gray-300 font-semibold'>
              Giai đoạn nguồn (DƯ carbon){' '}
              <span className='text-red-400'>*</span>
            </label>
            <select
              className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
              value={form.sourcePhaseId}
              onChange={(e) =>
                updateField('sourcePhaseId', parseInt(e.target.value))
              }
            >
              <option value={0}>-- Chọn giai đoạn nguồn --</option>
              {projectPhases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  #{phase.phaseOrder} - {phase.phaseName}
                </option>
              ))}
            </select>
            {sourcePhase && (
              <p className='text-xs text-gray-400 mt-1'>
                Mục tiêu: {sourcePhase.targetConsumedCarbon.toLocaleString()}{' '}
                tấn CO₂
              </p>
            )}
          </div>

          {/* TARGET PHASE */}
          <div>
            <label className='block text-sm mb-2 text-gray-300 font-semibold'>
              Giai đoạn đích (THIẾU carbon){' '}
              <span className='text-red-400'>*</span>
            </label>
            <select
              className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
              value={form.targetPhaseId}
              onChange={(e) =>
                updateField('targetPhaseId', parseInt(e.target.value))
              }
            >
              <option value={0}>-- Chọn giai đoạn đích --</option>
              {projectPhases
                .filter((p) => p.id !== form.sourcePhaseId)
                .map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    #{phase.phaseOrder} - {phase.phaseName}
                  </option>
                ))}
            </select>
            {targetPhase && (
              <p className='text-xs text-gray-400 mt-1'>
                Mục tiêu: {targetPhase.targetConsumedCarbon.toLocaleString()}{' '}
                tấn CO₂
              </p>
            )}
          </div>

          {/* CARBON AMOUNT */}
          <div>
            <label className='block text-sm mb-2 text-gray-300 font-semibold'>
              Lượng carbon chuyển (tấn) <span className='text-red-400'>*</span>
            </label>
            <input
              type='number'
              min='0'
              step='0.01'
              className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus: ring-green-500'
              placeholder='Ví dụ: 5000. 00'
              value={form.carbonAmount || ''}
              onChange={(e) =>
                updateField('carbonAmount', parseFloat(e.target.value) || 0)
              }
            />
          </div>

          {/* NOTES */}
          <div>
            <label className='block text-sm mb-2 text-gray-300'>Ghi chú</label>
            <textarea
              rows={3}
              className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus: ring-green-500'
              placeholder='Lý do phân bổ.. .'
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </div>

          {/* VISUAL FLOW */}
          {form.sourcePhaseId > 0 && form.targetPhaseId > 0 && (
            <div className='bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4'>
              <div className='flex items-center justify-center gap-4'>
                <div className='text-center'>
                  <p className='text-xs text-gray-400 mb-1'>Từ</p>
                  <p className='font-semibold text-purple-400'>
                    Phase #{sourcePhase?.phaseOrder}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='material-icons text-yellow-500 animate-pulse'>
                    arrow_forward
                  </span>
                  <span className='font-bold text-yellow-400'>
                    {form.carbonAmount.toLocaleString()} tấn
                  </span>
                  <span className='material-icons text-yellow-500 animate-pulse'>
                    arrow_forward
                  </span>
                </div>
                <div className='text-center'>
                  <p className='text-xs text-gray-400 mb-1'>Đến</p>
                  <p className='font-semibold text-pink-400'>
                    Phase #{targetPhase?.phaseOrder}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-[#1E3A2B]'>
          <button
            onClick={onClose}
            className='px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition'
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className='px-6 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 flex items-center gap-2 transition'
            disabled={loading}
          >
            {loading ? (
              <>
                <div className='inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-black'></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <span className='material-icons text-lg'>swap_horiz</span>
                Phân bổ Carbon
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
