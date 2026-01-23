import React, { useState } from 'react';
import type { CarbonCredit, CreditRetireRequest } from '../../models/carbonCredit.model';
import { formatNumber } from '../../utils/formatters';

interface RetireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreditRetireRequest) => void;
  credit: CarbonCredit;
  userAvailableCredits: number;
  isLoading?: boolean;
}

const RetireModal: React.FC<RetireModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  credit,
  userAvailableCredits,
  isLoading = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [retirementReason, setRetirementReason] = useState('');
  const [notes, setNotes] = useState('');

  const maxQuantity = Math.min(credit.creditsAvailable, userAvailableCredits);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      creditId: credit.id,
      quantity,
      retirementReason,
      notes,
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='fixed inset-0 bg-black bg-opacity-50' onClick={onClose}></div>

        <div className='relative bg-white rounded-xl shadow-xl max-w-md w-full'>
          <div className='border-b border-gray-200 px-6 py-4'>
            <h2 className='text-xl font-semibold text-gray-900'>Su dung tin chi (Retire)</h2>
            <p className='text-sm text-gray-500 mt-1'>
              Tin chi sau khi retire se duoc su dung vinh vien de bu tru CO2
            </p>
            <button
              onClick={onClose}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
            >
              X
            </button>
          </div>

          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            {/* Credit Info */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-sm text-gray-500'>Ma tin chi</p>
              <p className='text-lg font-semibold text-gray-900'>{credit.creditCode}</p>
              <div className='mt-3 flex justify-between'>
                <div>
                  <p className='text-xs text-gray-500'>Tin chi kha dung cua ban</p>
                  <p className='text-lg font-semibold text-green-600'>
                    {formatNumber(userAvailableCredits)}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-xs text-gray-500'>1 tin chi =</p>
                  <p className='text-lg font-semibold text-blue-600'>1 tan CO2</p>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                So luong retire <span className='text-red-500'>*</span>
              </label>
              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className='w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 text-xl font-medium'
                >
                  -
                </button>
                <input
                  type='number'
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))
                  }
                  min='1'
                  max={maxQuantity}
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                <button
                  type='button'
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  className='w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 text-xl font-medium'
                >
                  +
                </button>
              </div>
            </div>

            {/* CO2 Equivalent */}
            <div className='p-4 bg-orange-50 rounded-lg'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-700'>CO2 bu tru</span>
                <span className='text-2xl font-bold text-orange-600'>{quantity} tan CO2</span>
              </div>
            </div>

            {/* Retirement Reason */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Ly do su dung <span className='text-red-500'>*</span>
              </label>
              <textarea
                value={retirementReason}
                onChange={(e) => setRetirementReason(e.target.value)}
                required
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Vi du: Bu tru khi thai tu hoat dong san xuat Q1/2026...'
              />
            </div>

            {/* Notes */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Ghi chu them</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Bao cao ESG, muc dich khac...'
              />
            </div>

            {/* Warning */}
            <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <div className='flex gap-3'>
                <span className='text-yellow-600 text-xl'>!</span>
                <div>
                  <p className='text-sm font-medium text-yellow-800'>Luu y quan trong</p>
                  <p className='text-sm text-yellow-700 mt-1'>
                    Tin chi sau khi retire khong the hoan tac. Ban se nhan duoc chung nhan retire
                    sau khi hoan tat.
                  </p>
                </div>
              </div>
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
                disabled={isLoading || quantity < 1 || !retirementReason}
                className='flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50'
              >
                {isLoading ? 'Dang xu ly...' : `Retire ${quantity} tin chi`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RetireModal;
