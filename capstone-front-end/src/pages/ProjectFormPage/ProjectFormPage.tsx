import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import {
  useProjectFormViewModel,
  type PhaseForm,
} from '../../viewmodels/useProjectFormViewModel';

const statusOptions = [
  { value: 'PLANNING', label: 'Lập kế hoạch', color: 'yellow' },
  { value: 'PLANTING', label: 'Đang trồng', color: 'blue' },
  { value: 'GROWING', label: 'Sinh trưởng', color: 'green' },
  { value: 'MATURE', label: 'Trưởng thành', color: 'red' },
  { value: 'HARVESTING', label: 'Thu hoạch', color: 'purple' },
  { value: 'COMPLETED', label: 'Hoàn thành', color: 'gray' },
];

export default function ProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    isEdit,
    loading,
    saving,
    error,
    form,
    updateField,
    addPhase,
    removePhase,
    updatePhaseField,
    save,
  } = useProjectFormViewModel(id);

  if (loading) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4'></div>
          <p className='text-gray-400'>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      await save();
      navigate('/projects');
    } catch (err) {
      // Error already handled in viewmodel
    }
  };

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-10 max-w-5xl mx-auto'>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Danh sách dự án', href: '/projects' },
            { label: isEdit ? 'Cập nhật dự án' : 'Tạo dự án mới' },
          ]}
        />

        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>
            {isEdit ? 'Cập nhật Dự án' : 'Tạo Dự án Mới'}
          </h1>
          <p className='text-gray-400'>
            Điền đầy đủ thông tin để {isEdit ? 'cập nhật' : 'tạo'} dự án trồng
            rừng carbon.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className='mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            <span>{error}</span>
          </div>
        )}

        {/* ======================= BASIC INFO ======================= */}
        <section className='mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-green-500'>info</span>
            Thông tin cơ bản
          </h2>

          <div className='space-y-4'>
            {/* NAME */}
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Tên dự án <span className='text-red-400'>*</span>
              </label>
              <input
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 placeholder-gray-500 focus:outline-none focus: ring-2 focus:ring-green-500'
                placeholder='Ví dụ: Dự án Carbon Xanh Mekong Delta'
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Mô tả dự án
              </label>
              <textarea
                rows={4}
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500'
                placeholder='Mô tả chi tiết về mục tiêu, phạm vi và ý nghĩa của dự án...'
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            {/* STATUS & PUBLIC */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Trạng thái dự án
                </label>
                <select
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                  value={form.projectStatus}
                  onChange={(e) => updateField('projectStatus', e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Quyền truy cập
                </label>
                <div className='flex items-center gap-4 h-12'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='isPublic'
                      checked={form.isPublic === true}
                      onChange={() => updateField('isPublic', true)}
                      className='w-4 h-4 text-green-500 focus:ring-green-500'
                    />
                    <span className='text-sm'>🌐 Công khai</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='isPublic'
                      checked={form.isPublic === false}
                      onChange={() => updateField('isPublic', false)}
                      className='w-4 h-4 text-green-500 focus:ring-green-500'
                    />
                    <span className='text-sm'>🔒 Riêng tư</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================= PHASES ======================= */}
        <section className='mb-10'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold flex items-center gap-2'>
              <span className='material-icons text-blue-500'>timeline</span>
              Các giai đoạn triển khai ({form.phases.length})
            </h2>

            <button
              className='px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold flex items-center gap-2 transition'
              onClick={addPhase}
            >
              <span className='material-icons text-lg'>add</span>
              Thêm giai đoạn
            </button>
          </div>

          {form.phases.length === 0 ? (
            <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-xl p-12 text-center text-gray-400'>
              <span className='material-icons text-5xl mb-2 opacity-30'>
                event_busy
              </span>
              <p>Chưa có giai đoạn nào. Nhấn "Thêm giai đoạn" để bắt đầu.</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {form.phases.map((phase: PhaseForm, index: number) => (
                <div
                  key={index}
                  className='bg-[#0E2219] border border-[#1E3A2B] p-5 rounded-xl'
                >
                  {/* HEADER */}
                  <div className='flex justify-between items-center mb-4'>
                    <div className='flex items-center gap-3'>
                      <span className='px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded'>
                        #{phase.phaseOrder}
                      </span>
                      <input
                        className='flex-1 bg-[#071811] border border-[#1E3A2B] rounded-lg px-4 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500'
                        placeholder='Tên giai đoạn'
                        value={phase.phaseName}
                        onChange={(e) =>
                          updatePhaseField(index, 'phaseName', e.target.value)
                        }
                      />
                    </div>

                    <button
                      className='text-red-400 hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-500/10 transition flex items-center gap-1'
                      onClick={() => removePhase(index)}
                    >
                      <span className='material-icons text-lg'>delete</span>
                      Xóa
                    </button>
                  </div>

                  {/* DESCRIPTION */}
                  <div className='mb-4'>
                    <label className='block text-sm mb-1 text-gray-400'>
                      Mô tả giai đoạn
                    </label>
                    <textarea
                      rows={2}
                      className='w-full px-4 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus: ring-green-500'
                      placeholder='Mô tả chi tiết hoạt động trong giai đoạn này...'
                      value={phase.description}
                      onChange={(e) =>
                        updatePhaseField(index, 'description', e.target.value)
                      }
                    />
                  </div>

                  {/* DATES */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                    <div>
                      <label className='block text-sm mb-1 text-gray-400'>
                        Dự kiến bắt đầu
                      </label>
                      <input
                        type='date'
                        className='w-full px-4 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                        value={phase.expectedStartDate}
                        onChange={(e) =>
                          updatePhaseField(
                            index,
                            'expectedStartDate',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className='block text-sm mb-1 text-gray-400'>
                        Dự kiến kết thúc
                      </label>
                      <input
                        type='date'
                        className='w-full px-4 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                        value={phase.expectedEndDate}
                        onChange={(e) =>
                          updatePhaseField(
                            index,
                            'expectedEndDate',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className='block text-sm mb-1 text-gray-400'>
                        Thực tế bắt đầu
                      </label>
                      <input
                        type='date'
                        className='w-full px-4 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                        value={phase.actualStartDate}
                        onChange={(e) =>
                          updatePhaseField(
                            index,
                            'actualStartDate',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* STATUS, BUDGET, CARBON */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                    <div>
                      <label className='block text-sm mb-1 text-gray-400'>
                        Trạng thái giai đoạn
                      </label>
                      <select
                        className='w-full px-4 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg focus: outline-none focus:ring-2 focus:ring-green-500'
                        value={phase.phaseStatus}
                        onChange={(e) =>
                          updatePhaseField(index, 'phaseStatus', e.target.value)
                        }
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm mb-1 text-gray-400'>
                        Ngân sách (VND)
                      </label>
                      <input
                        type='number'
                        min='0'
                        step='1000000'
                        className='w-full px-4 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg focus:outline-none focus: ring-2 focus:ring-green-500'
                        placeholder='0'
                        value={phase.budget ?? ''}
                        onChange={(e) =>
                          updatePhaseField(
                            index,
                            'budget',
                            e.target.value ? parseFloat(e.target.value) : null,
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className='block text-sm mb-1 text-gray-400'>
                        CO₂ mục tiêu (tấn)
                      </label>
                      <input
                        type='number'
                        min='0'
                        step='0.01'
                        className='w-full px-4 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                        placeholder='0'
                        value={phase.targetConsumedCarbon ?? ''}
                        onChange={(e) =>
                          updatePhaseField(
                            index,
                            'targetConsumedCarbon',
                            e.target.value ? parseFloat(e.target.value) : null,
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* NOTES */}
                  <div>
                    <label className='block text-sm mb-1 text-gray-400'>
                      Ghi chú
                    </label>
                    <textarea
                      rows={2}
                      className='w-full px-4 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus: ring-green-500'
                      placeholder='Ghi chú thêm về giai đoạn...'
                      value={phase.notes}
                      onChange={(e) =>
                        updatePhaseField(index, 'notes', e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ======================= BUTTONS ======================= */}
        <div className='flex justify-end gap-3 pt-6 border-t border-[#1E3A2B]'>
          <button
            className='px-6 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-gray-300 hover:bg-[#13271F] transition'
            onClick={() => navigate('/projects')}
            disabled={saving}
          >
            Hủy
          </button>

          <button
            className='px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className='inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-black'></div>
                Đang lưu...
              </>
            ) : (
              <>
                <span className='material-icons text-lg'>save</span>
                {isEdit ? 'Cập nhật dự án' : 'Tạo dự án'}
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
