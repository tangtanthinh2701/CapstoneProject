import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import {
  useProjectFormViewModel,
  type PhaseForm,
  type TreeSpeciesOnPhaseForm,
} from '../../viewmodels/useProjectFormViewModel';

export default function ProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    isEdit,
    loading,
    saving,
    error,
    form,
    treeSpeciesList,
    updateField,
    addPhase,
    removePhase,
    updatePhaseField,
    addTreeSpeciesToPhase,
    removeTreeSpeciesFromPhase,
    updatePhaseTreeSpeciesField,
    save,
  } = useProjectFormViewModel(id);

  if (loading)
    return <div className='text-white p-10'>Đang tải dữ liệu...</div>;

  const handleSubmit = async () => {
    await save();
    navigate('/projects');
  };

  const partnerString = form.partnerOrganizations.join(', ');

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-10 max-w-5xl mx-auto'>
        <h1 className='text-3xl font-bold mb-2'>
          {isEdit ? 'Cập nhật Dự án' : 'Thêm Dự án Mới'}
        </h1>
        <p className='text-gray-400 mb-8'>
          Điền đầy đủ thông tin để tạo / cập nhật dự án.
        </p>

        {/* ======================= BASIC INFO ======================= */}
        <section className='mb-8'>
          <h2 className='text-sm font-semibold tracking-widest text-gray-300 uppercase mb-4'>
            Thông tin cơ bản
          </h2>

          <div className='space-y-4'>
            {/* NAME */}
            <div>
              <label className='block text-sm mb-1'>Tên dự án</label>
              <input
                className='w-full px-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B]'
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className='block text-sm mb-1'>Mô tả dự án</label>
              <textarea
                className='w-full px-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B]'
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            {/* PARTNERS */}
            <div>
              <label className='block text-sm mb-1'>Tổ chức đối tác</label>
              <input
                className='w-full px-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B]'
                value={partnerString}
                onChange={(e) =>
                  updateField(
                    'partnerOrganizations',
                    e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
              />
            </div>
          </div>
        </section>

        {/* ======================= LOCATION ======================= */}
        <section className='mb-8'>
          <h2 className='text-sm text-gray-300 uppercase mb-4'>
            Vị trí & Quy mô
          </h2>

          <div className='space-y-4'>
            {/* LOCATION TEXT */}
            <div>
              <label className='block mb-1 text-sm'>Địa điểm</label>
              <input
                className='w-full px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl'
                value={form.locationText}
                onChange={(e) => updateField('locationText', e.target.value)}
              />
            </div>

            {/* LAT - LNG */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block mb-1 text-sm'>Vĩ độ</label>
                <input
                  className='w-full px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl'
                  value={form.latitude}
                  onChange={(e) => updateField('latitude', e.target.value)}
                />
              </div>

              <div>
                <label className='block mb-1 text-sm'>Kinh độ</label>
                <input
                  className='w-full px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl'
                  value={form.longitude}
                  onChange={(e) => updateField('longitude', e.target.value)}
                />
              </div>
            </div>

            {/* AREA */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block mb-1 text-sm'>Diện tích</label>
                <div className='flex gap-2'>
                  <input
                    className='flex-1 px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl'
                    value={form.area}
                    onChange={(e) => updateField('area', e.target.value)}
                  />

                  <select
                    className='px-3 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl'
                    value={form.areaUnit}
                    onChange={(e) => updateField('areaUnit', e.target.value)}
                  >
                    <option value='m2'>m²</option>
                    <option value='ha'>ha</option>
                  </select>
                </div>
              </div>

              {/* USABLE AREA */}
              <div>
                <label className='block mb-1 text-sm'>Diện tích sử dụng</label>
                <input
                  className='w-full px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl'
                  value={form.usableArea}
                  onChange={(e) => updateField('usableArea', e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ======================= PLANTING PLAN ======================= */}
        <section className='mb-8'>
          <h2 className='text-sm mb-4 uppercase text-gray-300'>
            Kế hoạch trồng cây
          </h2>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block mb-1 text-sm'>Ngày trồng</label>
              <input
                type='date'
                className='w-full px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl'
                value={form.plantingDate}
                onChange={(e) => updateField('plantingDate', e.target.value)}
              />
            </div>

            <div>
              <label className='block mb-1 text-sm'>Trạng thái</label>
              <select
                className='w-full px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl'
                value={form.projectStatus}
                onChange={(e) => updateField('projectStatus', e.target.value)}
              >
                <option value='PLANNING'>PLANNING</option>
                <option value='PLANTING'>PLANTING</option>
                <option value='GROWING'>GROWING</option>
                <option value='MATURE'>MATURE</option>
                <option value='HARVESTING'>HARVESTING</option>
                <option value='COMPLETED'>COMPLETED</option>
              </select>
            </div>

            <div>
              <label className='block mb-1 text-sm'>Tổng cây dự kiến</label>
              <input
                className='w-full px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl'
                value={form.totalTreesPlanned}
                onChange={(e) =>
                  updateField('totalTreesPlanned', e.target.value)
                }
              />
            </div>

            <div>
              <label className='block mb-1 text-sm'>Mật độ</label>
              <input
                className='w-full px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl'
                value={form.plantingDensity}
                onChange={(e) => updateField('plantingDensity', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ======================= PHASES ======================= */}
        <section className='mb-10'>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-sm font-semibold uppercase text-gray-300'>
              Các giai đoạn triển khai
            </h2>

            <button
              className='px-4 py-2 bg-green-500 text-black rounded-lg'
              onClick={addPhase}
            >
              + Thêm Giai đoạn
            </button>
          </div>

          {form.phases.map((phase: PhaseForm, index: number) => (
            <div
              key={index}
              className='bg-[#0E2219] border border-[#1E3A2B] p-4 rounded-xl mb-4'
            >
              <div className='flex justify-between items-center mb-3'>
                <input
                  className='flex-1 bg-[#071811] border border-[#1E3A2B] rounded-lg px-4 py-2 mr-3'
                  placeholder='Tên giai đoạn'
                  value={phase.phaseName}
                  onChange={(e) =>
                    updatePhaseField(index, 'phaseName', e.target.value)
                  }
                />

                <button
                  className='text-red-400 text-xs'
                  onClick={() => removePhase(index)}
                >
                  Xóa
                </button>
              </div>

              {/* START + END DATE */}
              <div className='grid grid-cols-2 gap-4 mb-3'>
                <div>
                  <label className='text-sm block mb-1'>Ngày bắt đầu</label>
                  <input
                    type='date'
                    className='w-full px-4 py-2 bg-[#0E2219] border border-[#1E3A2B] rounded-lg'
                    value={phase.startDate}
                    onChange={(e) =>
                      updatePhaseField(index, 'startDate', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className='text-sm block mb-1'>Ngày kết thúc</label>
                  <input
                    type='date'
                    className='w-full px-4 py-2 bg-[#0E2219] border border-[#1E3A2B] rounded-lg'
                    value={phase.endDate}
                    onChange={(e) =>
                      updatePhaseField(index, 'endDate', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* TREE SPECIES LIST */}
              {phase.treeSpecies.map(
                (ts: TreeSpeciesOnPhaseForm, i: number) => (
                  <>
                    <div
                      key={i}
                      className='border border-[#1E3A2B] p-3 rounded-lg mb-3'
                    >
                      <div className='grid grid-cols-3 gap-4'>
                        <div>
                          <label className='text-xs block mb-1'>Loài cây</label>
                          <select
                            className='w-full px-3 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg'
                            value={ts.treeSpeciesId ?? ''}
                            onChange={(e) =>
                              updatePhaseTreeSpeciesField(
                                index,
                                i,
                                'treeSpeciesId',
                                Number(e.target.value),
                              )
                            }
                          >
                            <option value=''>Chọn loại cây</option>
                            {treeSpeciesList.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.scientificName})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className='text-xs block mb-1'>
                            Số lượng dự kiến
                          </label>
                          <input
                            type='number'
                            className='w-full px-3 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg'
                            value={ts.quantityPlanned ?? ''}
                            onChange={(e) =>
                              updatePhaseTreeSpeciesField(
                                index,
                                i,
                                'quantityPlanned',
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className='text-xs block mb-1'>
                            Chi phí mỗi cây
                          </label>
                          <input
                            type='number'
                            className='w-full px-3 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg'
                            value={ts.costPerTree ?? ''}
                            onChange={(e) =>
                              updatePhaseTreeSpeciesField(
                                index,
                                i,
                                'costPerTree',
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className='text-xs block mb-1'>
                            Chi phí chăm sóc
                          </label>
                          <input
                            type='number'
                            className='w-full px-3 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg'
                            value={ts.maintenanceCostYearly ?? ''}
                            onChange={(e) =>
                              updatePhaseTreeSpeciesField(
                                index,
                                i,
                                'maintenanceCostYearly',
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className='text-xs block mb-1'>
                            Chi phí trồng
                          </label>
                          <input
                            type='number'
                            className='w-full px-3 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg'
                            value={ts.plantingCost ?? ''}
                            onChange={(e) =>
                              updatePhaseTreeSpeciesField(
                                index,
                                i,
                                'plantingCost',
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* NOTES */}
                      <div className='mt-2'>
                        <label className='text-xs block mb-1'>Ghi chú</label>
                        <textarea
                          className='w-full px-3 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg'
                          value={ts.notes ?? ''}
                          onChange={(e) =>
                            updatePhaseTreeSpeciesField(
                              index,
                              i,
                              'notes',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className='text-right mb-2'>
                      <button
                        className='text-red-400 hover:text-red-300 text-xs'
                        onClick={() => removeTreeSpeciesFromPhase(index, i)}
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                ),
              )}

              <button
                className='px-3 py-1 text-green-500 bg-[#143024] rounded-lg'
                onClick={() => addTreeSpeciesToPhase(index)}
              >
                + Thêm loài cây
              </button>
            </div>
          ))}
        </section>

        {/* ======================= BUTTONS ======================= */}
        <div className='flex justify-end gap-3'>
          <button
            className='px-5 py-2 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-red-400'
            onClick={() => navigate('/projects')}
          >
            Hủy
          </button>

          <button
            className='px-5 py-2 rounded-xl bg-green-500 text-black font-semibold'
            onClick={handleSubmit}
            disabled={saving}
          >
            {isEdit ? 'Cập nhật' : 'Tạo Dự án'}
          </button>
        </div>

        {error && <p className='text-red-400 mt-4'>{error}</p>}
      </main>
    </div>
  );
}
