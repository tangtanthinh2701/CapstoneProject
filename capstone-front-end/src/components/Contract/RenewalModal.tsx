import React, { useState } from 'react';
import type { ContractRenewalRequest } from '../../models/contract.model';

interface RenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContractRenewalRequest) => void;
  contractId: number;
  contractCode: string;
  currentEndDate: string;
  userId: string;
  isLoading?: boolean;
}

const RenewalModal: React.FC<RenewalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contractId,
  contractCode,
  currentEndDate,
  userId,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    renewalTermYears: 1,
    renewalAmount: 0,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      contractId,
      requestedBy: userId,
      ...formData,
    });
  };

  const calculateNewEndDate = () => {
    const current = new Date(currentEndDate);
    current.setFullYear(current.getFullYear() + formData.renewalTermYears);
    return current.toLocaleDateString('vi-VN');
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='fixed inset-0 bg-black bg-opacity-50' onClick={onClose}></div>

        <div className='relative bg-white rounded-xl shadow-xl max-w-md w-full'>
          <div className='border-b border-gray-200 px-6 py-4'>
            <h2 className='text-xl font-semibold text-gray-900'>Yeu cau gia han hop dong</h2>
            <p className='text-sm text-gray-500 mt-1'>Hop dong: {contractCode}</p>
            <button
              onClick={onClose}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
            >
              X
            </button>
          </div>

          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            {/* Current End Date */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-sm text-gray-500'>Ngay het han hien tai</p>
              <p className='text-lg font-semibold text-gray-900'>
                {new Date(currentEndDate).toLocaleDateString('vi-VN')}
              </p>
            </div>

            {/* Renewal Term */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Thoi gian gia han (nam) <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                name='renewalTermYears'
                value={formData.renewalTermYears}
                onChange={handleChange}
                required
                min='1'
                max='10'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
              <p className='text-sm text-gray-500 mt-1'>
                Ngay het han moi: <span className='font-medium'>{calculateNewEndDate()}</span>
              </p>
            </div>

            {/* Renewal Amount */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Phi gia han (VND) <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                name='renewalAmount'
                value={formData.renewalAmount}
                onChange={handleChange}
                required
                min='0'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                placeholder='Ly do gia han, dieu khoan bo sung...'
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
                {isLoading ? 'Dang xu ly...' : 'Gui yeu cau'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RenewalModal;
