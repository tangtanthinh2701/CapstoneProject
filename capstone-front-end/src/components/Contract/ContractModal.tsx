import React, { useState } from 'react';
import type { ContractRequest } from '../../models/contract.model';
import { ContractTypeLabels } from '../../models/contract.model';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContractRequest) => void;
  initialData?: Partial<ContractRequest>;
  projects?: Array<{ id: number; name: string }>;
  users?: Array<{ id: string; fullname: string }>;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  projects = [],
  users = [],
  isLoading = false,
  mode = 'create',
}) => {
  const [formData, setFormData] = useState<Partial<ContractRequest>>({
    projectId: initialData?.projectId || 0,
    contractType: initialData?.contractType || 'OWNERSHIP',
    partyAId: initialData?.partyAId || '',
    totalValue: initialData?.totalValue || 0,
    paymentTerms: initialData?.paymentTerms || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    durationYears: initialData?.durationYears || 1,
    isRenewable: initialData?.isRenewable ?? true,
    maxRenewals: initialData?.maxRenewals || 2,
    carbonCreditPercentage: initialData?.carbonCreditPercentage || 0,
    harvestRights: initialData?.harvestRights ?? false,
    transferAllowed: initialData?.transferAllowed ?? true,
    termsAndConditions: initialData?.termsAndConditions || '',
    notes: initialData?.notes || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseFloat(value)
            : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as ContractRequest);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='fixed inset-0 bg-black bg-opacity-50' onClick={onClose}></div>

        <div className='relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl'>
            <h2 className='text-xl font-semibold text-gray-900'>
              {mode === 'create' ? 'Tao hop dong moi' : 'Chinh sua hop dong'}
            </h2>
            <button
              onClick={onClose}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
            >
              X
            </button>
          </div>

          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            {/* Project Selection */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Du an <span className='text-red-500'>*</span>
              </label>
              <select
                name='projectId'
                value={formData.projectId}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Chon du an</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Contract Type */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Loai hop dong <span className='text-red-500'>*</span>
              </label>
              <select
                name='contractType'
                value={formData.contractType}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                {Object.entries(ContractTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Party A Selection */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Ben A (Nguoi ky) <span className='text-red-500'>*</span>
              </label>
              <select
                name='partyAId'
                value={formData.partyAId}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Chon nguoi ky</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullname}
                  </option>
                ))}
              </select>
            </div>

            {/* Value and Duration */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Gia tri hop dong (VND) <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  name='totalValue'
                  value={formData.totalValue}
                  onChange={handleChange}
                  required
                  min='0'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Thoi han (nam) <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  name='durationYears'
                  value={formData.durationYears}
                  onChange={handleChange}
                  required
                  min='1'
                  max='30'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>

            {/* Dates */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Ngay bat dau <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  name='startDate'
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Ngay ket thuc <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  name='endDate'
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>

            {/* Carbon Credit Percentage */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Ty le tin chi carbon (%) <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                name='carbonCreditPercentage'
                value={formData.carbonCreditPercentage}
                onChange={handleChange}
                required
                min='0'
                max='100'
                step='0.01'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* Checkboxes */}
            <div className='space-y-3'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  name='isRenewable'
                  checked={formData.isRenewable}
                  onChange={handleChange}
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='ml-2 text-sm text-gray-700'>Co the gia han</span>
              </label>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  name='transferAllowed'
                  checked={formData.transferAllowed}
                  onChange={handleChange}
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='ml-2 text-sm text-gray-700'>Cho phep chuyen nhuong</span>
              </label>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  name='harvestRights'
                  checked={formData.harvestRights}
                  onChange={handleChange}
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='ml-2 text-sm text-gray-700'>Quyen thu hoach</span>
              </label>
            </div>

            {/* Payment Terms */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Dieu khoan thanh toan
              </label>
              <textarea
                name='paymentTerms'
                value={formData.paymentTerms}
                onChange={handleChange}
                rows={2}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Vi du: Thanh toan 3 dot: 40% - 30% - 30%'
              />
            </div>

            {/* Notes */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Ghi chu</label>
              <textarea
                name='notes'
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* Actions */}
            <div className='flex gap-3 pt-4 border-t border-gray-200'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Huy
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
              >
                {isLoading ? 'Dang xu ly...' : mode === 'create' ? 'Tao hop dong' : 'Cap nhat'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContractModal;
