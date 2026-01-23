import React, { useState } from 'react';
import type { CarbonCredit, CreditPurchaseRequest } from '../../models/carbonCredit.model';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreditPurchaseRequest) => void;
  credit: CarbonCredit;
  isLoading?: boolean;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  credit,
  isLoading = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const totalAmount = quantity * credit.currentPricePerCredit;
  const maxQuantity = credit.creditsAvailable;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      creditId: credit.id,
      quantity,
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
            <h2 className='text-xl font-semibold text-gray-900'>Mua tin chi Carbon</h2>
            <button
              onClick={onClose}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            {/* Credit Info */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-sm text-gray-500'>Ma tin chi</p>
              <p className='text-lg font-semibold text-gray-900'>{credit.creditCode}</p>
              <p className='text-sm text-gray-500 mt-2'>Du an</p>
              <p className='text-sm font-medium text-gray-900'>{credit.projectName}</p>
            </div>

            {/* Price Info */}
            <div className='flex justify-between p-4 bg-blue-50 rounded-lg'>
              <div>
                <p className='text-sm text-gray-500'>Gia moi tin chi</p>
                <p className='text-lg font-semibold text-blue-600'>
                  {formatCurrency(credit.currentPricePerCredit)}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-500'>Con lai</p>
                <p className='text-lg font-semibold text-green-600'>
                  {formatNumber(credit.creditsAvailable)} credits
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                So luong mua <span className='text-red-500'>*</span>
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
              <p className='text-sm text-gray-500 mt-1'>
                Toi da: {formatNumber(maxQuantity)} credits
              </p>
            </div>

            {/* Quick Select */}
            <div className='flex gap-2'>
              {[1, 5, 10, 20]
                .filter((n) => n <= maxQuantity)
                .map((n) => (
                  <button
                    key={n}
                    type='button'
                    onClick={() => setQuantity(n)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      quantity === n
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              <button
                type='button'
                onClick={() => setQuantity(maxQuantity)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  quantity === maxQuantity
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tat ca
              </button>
            </div>

            {/* Total */}
            <div className='p-4 bg-green-50 rounded-lg'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-700'>Tong thanh toan</span>
                <span className='text-2xl font-bold text-green-600'>
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <p className='text-sm text-gray-500 mt-1'>
                = {quantity} tin chi × {formatCurrency(credit.currentPricePerCredit)}
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Ghi chu</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Muc dich mua, ghi chu them...'
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
                disabled={isLoading || quantity < 1}
                className='flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
              >
                {isLoading ? 'Dang xu ly...' : 'Thanh toan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
