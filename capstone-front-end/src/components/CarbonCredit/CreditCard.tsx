import React from 'react';
import type { CarbonCredit } from '../../models/carbonCredit.model';
import { CreditStatusLabels, VerificationStandardLabels } from '../../models/carbonCredit.model';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { getStatusColor } from '../../utils/formatters';

interface CreditCardProps {
  credit: CarbonCredit;
  onClick?: () => void;
  onPurchase?: () => void;
  showPurchaseButton?: boolean;
}

const CreditCard: React.FC<CreditCardProps> = ({
  credit,
  onClick,
  onPurchase,
  showPurchaseButton = false,
}) => {
  const statusColor = getStatusColor(credit.creditStatus);
  const availablePercentage =
    credit.creditsIssued > 0 ? (credit.creditsAvailable / credit.creditsIssued) * 100 : 0;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>{credit.creditCode}</h3>
          <p className='text-sm text-gray-500'>{credit.projectName}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-700`}
        >
          {CreditStatusLabels[credit.creditStatus]}
        </span>
      </div>

      {/* Credit Stats */}
      <div className='grid grid-cols-3 gap-4 mb-4'>
        <div className='text-center p-3 bg-blue-50 rounded-lg'>
          <p className='text-2xl font-bold text-blue-600'>{formatNumber(credit.creditsIssued)}</p>
          <p className='text-xs text-gray-500'>PhÃ¡t hÃ nh</p>
        </div>
        <div className='text-center p-3 bg-green-50 rounded-lg'>
          <p className='text-2xl font-bold text-green-600'>
            {formatNumber(credit.creditsAvailable)}
          </p>
          <p className='text-xs text-gray-500'>Kháº£ dá»¥ng</p>
        </div>
        <div className='text-center p-3 bg-orange-50 rounded-lg'>
          <p className='text-2xl font-bold text-orange-600'>
            {formatNumber(credit.creditsRetired)}
          </p>
          <p className='text-xs text-gray-500'>ÄÃ£ sá»­ dá»¥ng</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='mb-4'>
        <div className='flex justify-between text-sm mb-1'>
          <span className='text-gray-500'>Tá»· lá»‡ cÃ²n láº¡i</span>
          <span className='font-medium text-gray-700'>{availablePercentage.toFixed(1)}%</span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-green-500 h-2 rounded-full transition-all'
            style={{ width: `${availablePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Details */}
      <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
        <div>
          <p className='text-gray-500'>GiÃ¡ hiá»‡n táº¡i</p>
          <p className='font-semibold text-gray-900'>
            {formatCurrency(credit.currentPricePerCredit)}/credit
          </p>
        </div>
        <div>
          <p className='text-gray-500'>TiÃªu chuáº©n</p>
          <p className='font-medium text-gray-900'>
            {VerificationStandardLabels[credit.verificationStandard]}
          </p>
        </div>
        <div>
          <p className='text-gray-500'>NÄƒm phÃ¡t hÃ nh</p>
          <p className='text-gray-900'>{credit.issuanceYear}</p>
        </div>
        <div>
          <p className='text-gray-500'>COâ‚‚ tÆ°Æ¡ng Ä‘Æ°Æ¡ng</p>
          <p className='text-gray-900'>{credit.totalCo2Tons} táº¥n</p>
        </div>
      </div>

      {/* Purchase Button */}
      {showPurchaseButton && credit.creditsAvailable > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPurchase?.();
          }}
          className='w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors'
        >
          Mua tÃ­n chá»‰
        </button>
      )}
    </div>
  );
};

export default CreditCard;
