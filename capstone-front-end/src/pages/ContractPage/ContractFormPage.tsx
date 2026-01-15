import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useContractFormViewModel } from '../../viewmodels/useContractViewModel';

interface Project {
  id: number;
  name: string;
  code: string;
}

export default function ContractFormPage() {
  const navigate = useNavigate();
  const {
    isEdit,
    loading,
    initialLoading,
    error,
    form,
    updateField,
    updateContentField,
    save,
  } = useContractFormViewModel();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Load projects list
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        const token = localStorage.getItem('token');
        const res = await fetch(
          'http://localhost:8088/api/projects?size=1000',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setProjects(data.data);
          }
        }
      } catch (err) {
        console.error('Error loading projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  if (initialLoading) {
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
      navigate('/contracts');
    } catch (err) {
      // Error handled in viewmodel
    }
  };

  const handleAddBenefit = () => {
    const benefits = form.content?.benefits || [];
    const newBenefit = window.prompt('Nhập quyền lợi mới: ');
    if (newBenefit && newBenefit.trim()) {
      updateContentField('benefits', [...benefits, newBenefit.trim()]);
    }
  };

  const handleRemoveBenefit = (index: number) => {
    const benefits = form.content?.benefits || [];
    updateContentField(
      'benefits',
      benefits.filter((_, i) => i !== index),
    );
  };

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-10 max-w-5xl mx-auto'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý hợp đồng', href: '/contracts' },
            { label: isEdit ? 'Cập nhật hợp đồng' : 'Tạo hợp đồng mới' },
          ]}
        />

        <h1 className='text-3xl font-bold mb-2'>
          {isEdit ? 'Cập nhật Hợp đồng' : 'Tạo Hợp đồng Mới'}
        </h1>
        <p className='text-gray-400 mb-8'>
          Điền đầy đủ thông tin để {isEdit ? 'cập nhật' : 'tạo'} hợp đồng trồng
          rừng carbon.
        </p>

        {/* ERROR */}
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
            {/* PROJECT */}
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Dự án <span className='text-red-400'>*</span>
              </label>
              {loadingProjects ? (
                <div className='text-gray-400 text-sm'>
                  Đang tải danh sách dự án...
                </div>
              ) : (
                <select
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus: ring-green-500'
                  value={form.projectId}
                  onChange={(e) =>
                    updateField('projectId', parseInt(e.target.value))
                  }
                >
                  <option value={0}>-- Chọn dự án --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* CONTRACT CATEGORY & TYPE */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Phân loại hợp đồng <span className='text-red-400'>*</span>
                </label>
                <select
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus: ring-green-500'
                  value={form.contractCategory}
                  onChange={(e) =>
                    updateField(
                      'contractCategory',
                      e.target.value as
                        | 'ENTERPRISE_PROJECT'
                        | 'INDIVIDUAL_TREE',
                    )
                  }
                >
                  <option value='ENTERPRISE_PROJECT'>Dự án doanh nghiệp</option>
                  <option value='INDIVIDUAL_TREE'>Cây cá nhân</option>
                </select>
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Loại hợp đồng <span className='text-red-400'>*</span>
                </label>
                <select
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                  value={form.contractType}
                  onChange={(e) =>
                    updateField(
                      'contractType',
                      e.target.value as 'OWNERSHIP' | 'SERVICE',
                    )
                  }
                >
                  <option value='OWNERSHIP'>Sở hữu (Ownership)</option>
                  <option value='SERVICE'>Dịch vụ (Service)</option>
                </select>
              </div>
            </div>

            {/* PRICING */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Đơn giá (VND) <span className='text-red-400'>*</span>
                </label>
                <input
                  type='number'
                  min='0'
                  step='1000'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='500000'
                  value={form.unitPrice || ''}
                  onChange={(e) =>
                    updateField('unitPrice', parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Tổng giá trị (VND) <span className='text-red-400'>*</span>
                </label>
                <input
                  type='number'
                  min='0'
                  step='1000000'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='5000000000'
                  value={form.totalAmount || ''}
                  onChange={(e) =>
                    updateField('totalAmount', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            {/* DATES */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Thời hạn (năm) <span className='text-red-400'>*</span>
                </label>
                <input
                  type='number'
                  min='1'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='5'
                  value={form.contractTermYears || ''}
                  onChange={(e) =>
                    updateField(
                      'contractTermYears',
                      parseInt(e.target.value) || 1,
                    )
                  }
                />
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Ngày bắt đầu <span className='text-red-400'>*</span>
                </label>
                <input
                  type='date'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                  value={form.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Ngày kết thúc <span className='text-red-400'>*</span>
                </label>
                <input
                  type='date'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                  value={form.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ======================= RENEWAL SETTINGS ======================= */}
        <section className='mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-blue-500'>autorenew</span>
            Cài đặt gia hạn
          </h2>

          <div className='space-y-4'>
            {/* AUTO RENEWAL */}
            <div className='flex items-center gap-3'>
              <input
                type='checkbox'
                id='autoRenewal'
                className='w-5 h-5 rounded text-green-500 focus:ring-green-500'
                checked={form.autoRenewal}
                onChange={(e) => updateField('autoRenewal', e.target.checked)}
              />
              <label
                htmlFor='autoRenewal'
                className='text-gray-300 cursor-pointer'
              >
                Cho phép tự động gia hạn
              </label>
            </div>

            {form.autoRenewal && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pl-8'>
                <div>
                  <label className='block text-sm mb-2 text-gray-300'>
                    Thời hạn gia hạn (năm)
                  </label>
                  <input
                    type='number'
                    min='1'
                    className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                    placeholder='3'
                    value={form.renewalTermYears || ''}
                    onChange={(e) =>
                      updateField(
                        'renewalTermYears',
                        parseInt(e.target.value) || undefined,
                      )
                    }
                  />
                </div>

                <div>
                  <label className='block text-sm mb-2 text-gray-300'>
                    Thông báo trước (ngày)
                  </label>
                  <input
                    type='number'
                    min='1'
                    className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                    placeholder='30'
                    value={form.renewalNoticeDays || ''}
                    onChange={(e) =>
                      updateField(
                        'renewalNoticeDays',
                        parseInt(e.target.value) || undefined,
                      )
                    }
                  />
                </div>

                <div>
                  <label className='block text-sm mb-2 text-gray-300'>
                    Số lần gia hạn tối đa
                  </label>
                  <input
                    type='number'
                    min='1'
                    className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus: outline-none focus:ring-2 focus:ring-green-500'
                    placeholder='2'
                    value={form.maxRenewals || ''}
                    onChange={(e) =>
                      updateField(
                        'maxRenewals',
                        parseInt(e.target.value) || undefined,
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ======================= RIGHTS & TERMS ======================= */}
        <section className='mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-purple-500'>gavel</span>
            Quyền lợi & Điều khoản
          </h2>

          <div className='space-y-4'>
            {/* CHECKBOXES */}
            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  id='harvestRights'
                  className='w-5 h-5 rounded text-green-500 focus: ring-green-500'
                  checked={form.harvestRights}
                  onChange={(e) =>
                    updateField('harvestRights', e.target.checked)
                  }
                />
                <label
                  htmlFor='harvestRights'
                  className='text-gray-300 cursor-pointer'
                >
                  Quyền thu hoạch
                </label>
              </div>

              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  id='transferAllowed'
                  className='w-5 h-5 rounded text-green-500 focus:ring-green-500'
                  checked={form.transferAllowed}
                  onChange={(e) =>
                    updateField('transferAllowed', e.target.checked)
                  }
                />
                <label
                  htmlFor='transferAllowed'
                  className='text-gray-300 cursor-pointer'
                >
                  Cho phép chuyển nhượng
                </label>
              </div>
            </div>

            {/* PENALTY */}
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Phí chấm dứt sớm (VND)
              </label>
              <input
                type='number'
                min='0'
                step='1000000'
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                placeholder='500000000'
                value={form.earlyTerminationPenalty || ''}
                onChange={(e) =>
                  updateField(
                    'earlyTerminationPenalty',
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
              />
            </div>
          </div>
        </section>

        {/* ======================= CONTRACT CONTENT ======================= */}
        <section className='mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-yellow-500'>description</span>
            Nội dung hợp đồng
          </h2>

          <div className='space-y-4'>
            {form.contractType === 'OWNERSHIP' && (
              <>
                {/* TREE COUNT */}
                <div className='grid grid-cols-1 md: grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-2 text-gray-300'>
                      Số lượng cây
                    </label>
                    <input
                      type='number'
                      min='0'
                      className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                      placeholder='10000'
                      value={form.content?.treeCount || ''}
                      onChange={(e) =>
                        updateContentField(
                          'treeCount',
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className='block text-sm mb-2 text-gray-300'>
                      % Tín chỉ Carbon
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='100'
                      className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                      placeholder='80'
                      value={form.content?.carbonPercentage || ''}
                      onChange={(e) =>
                        updateContentField(
                          'carbonPercentage',
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </div>

                {/* BENEFITS */}
                <div>
                  <label className='block text-sm mb-2 text-gray-300'>
                    Quyền lợi
                  </label>
                  <div className='space-y-2 mb-2'>
                    {(form.content?.benefits || []).map((benefit, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-2 bg-[#071811] px-4 py-2 rounded-lg'
                      >
                        <span className='flex-1 text-gray-200'>{benefit}</span>
                        <button
                          onClick={() => handleRemoveBenefit(index)}
                          className='text-red-400 hover:text-red-300'
                        >
                          <span className='material-icons text-sm'>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type='button'
                    onClick={handleAddBenefit}
                    className='px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm flex items-center gap-2 transition'
                  >
                    <span className='material-icons text-sm'>add</span>
                    Thêm quyền lợi
                  </button>
                </div>
              </>
            )}

            {/* NOTES */}
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Ghi chú
              </label>
              <textarea
                rows={4}
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500'
                placeholder='Ghi chú thêm về hợp đồng...'
                value={form.notes || ''}
                onChange={(e) =>
                  updateField('notes', e.target.value || undefined)
                }
              />
            </div>
          </div>
        </section>

        {/* ======================= BUTTONS ======================= */}
        <div className='flex justify-end gap-3 pt-6 border-t border-[#1E3A2B]'>
          <button
            className='px-6 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-gray-300 hover:bg-[#13271F] transition'
            onClick={() => navigate('/contracts')}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            className='px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-semibold flex items-center gap-2 transition disabled:opacity-50'
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className='inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-black'></div>
                Đang lưu...
              </>
            ) : (
              <>
                <span className='material-icons'>save</span>
                {isEdit ? 'Cập nhật' : 'Tạo hợp đồng'}
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
