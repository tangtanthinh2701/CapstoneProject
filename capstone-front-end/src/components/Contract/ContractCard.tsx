import React from 'react';
import type { Contract } from '../../models/contract.model';
import { ContractStatusLabels, ContractTypeLabels } from '../../models/contract.model';
import { formatDate, formatCurrency, formatPercentage } from '../../utils/formatters';
import { getStatusColor } from '../../utils/formatters';

interface ContractCardProps {
  contract: Contract;
  onClick?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onClick,
  onApprove,
  onReject,
  showActions = false,
}) => {
  const statusColor = getStatusColor(contract.contractStatus);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>{contract.contractCode}</h3>
          <p className='text-sm text-gray-500'>{ContractTypeLabels[contract.contractType]}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-700`}
        >
          {ContractStatusLabels[contract.contractStatus]}
        </span>
      </div>

      {/* Project Info */}
      {contract.projectName && (
        <div className='mb-4'>
          <p className='text-sm text-gray-500'>Du an</p>
          <p className='text-sm font-medium text-gray-900'>{contract.projectName}</p>
        </div>
      )}

      {/* Contract Details */}
      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div>
          <p className='text-xs text-gray-500'>Gia tri hop dong</p>
          <p className='text-sm font-semibold text-gray-900'>
            {formatCurrency(contract.totalAmount)}
          </p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>Ty le Carbon</p>
          <p className='text-sm font-semibold text-gray-900'>
            {formatPercentage(contract.carbonCreditPercentage)}
          </p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>Ngay bat dau</p>
          <p className='text-sm text-gray-900'>{formatDate(contract.startDate)}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500'>Ngay ket thuc</p>
          <p className='text-sm text-gray-900'>{formatDate(contract.endDate)}</p>
        </div>
      </div>

      {/* Features */}
      <div className='flex flex-wrap gap-2 mb-4'>
        {contract.autoRenewal && (
          <span className='px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded'>Co the gia han</span>
        )}
        {contract.transferAllowed && (
          <span className='px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded'>
            Cho phep chuyen nhuong
          </span>
        )}
        {contract.harvestRights && (
          <span className='px-2 py-1 bg-green-50 text-green-700 text-xs rounded'>
            Quyen thu hoach
          </span>
        )}
      </div>

      {/* Actions */}
      {showActions && contract.contractStatus === 'PENDING' && (
        <div className='flex gap-2 pt-4 border-t border-gray-100'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApprove?.();
            }}
            className='flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors'
          >
            Phe duyet
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReject?.();
            }}
            className='flex-1 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors'
          >
            Tu choi
          </button>
        </div>
      )}
    </div>
  );
};

export default ContractCard;
