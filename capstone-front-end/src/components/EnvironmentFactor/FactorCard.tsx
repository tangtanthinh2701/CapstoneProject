import React from 'react';
import type { EnvironmentFactor } from '../../models/environmentFactor.model';
import { FactorCategoryLabels, ImpactTypeLabels } from '../../models/environmentFactor.model';

interface FactorCardProps {
  factor: EnvironmentFactor;
  onClick?: () => void;
  onToggleStatus?: (isActive: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const FactorCard: React.FC<FactorCardProps> = ({
  factor,
  onClick,
  onToggleStatus,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const getImpactColor = (impactType: string) => {
    switch (impactType) {
      case 'POSITIVE':
        return 'text-green-600 bg-green-50';
      case 'NEGATIVE':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      CLIMATE: 'ðŸŒ¡ï¸',
      SOIL: 'ðŸŒ',
      WATER: 'ðŸ’§',
      LOCATION: 'ðŸ“',
      SEASON: 'ðŸ‚',
      SPECIES: 'ðŸŒ³',
      OTHER: 'ðŸ“Š',
    };
    return icons[category] || 'ðŸ“Š';
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl'>
            {getCategoryIcon(factor.category)}
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>{factor.factorName}</h3>
            <p className='text-sm text-gray-500'>{factor.factorCode}</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(factor.impactType)}`}
          >
            {ImpactTypeLabels[factor.impactType]}
          </span>
          {!factor.isActive && (
            <span className='px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
              KhÃ´ng hoáº¡t Ä‘á»™ng
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {factor.description && (
        <p className='text-sm text-gray-600 mb-4 line-clamp-2'>{factor.description}</p>
      )}

      {/* Values */}
      <div className='grid grid-cols-3 gap-4 mb-4'>
        <div className='text-center p-3 bg-gray-50 rounded-lg'>
          <p className='text-lg font-bold text-gray-900'>{factor.baseValue}</p>
          <p className='text-xs text-gray-500'>GiÃ¡ trá»‹ cÆ¡ báº£n</p>
        </div>
        <div className='text-center p-3 bg-gray-50 rounded-lg'>
          <p className='text-lg font-bold text-gray-900'>{factor.minValue}</p>
          <p className='text-xs text-gray-500'>Tá»‘i thiá»ƒu</p>
        </div>
        <div className='text-center p-3 bg-gray-50 rounded-lg'>
          <p className='text-lg font-bold text-gray-900'>{factor.maxValue}</p>
          <p className='text-xs text-gray-500'>Tá»‘i Ä‘a</p>
        </div>
      </div>

      {/* Category & Unit */}
      <div className='flex justify-between text-sm mb-4'>
        <div>
          <span className='text-gray-500'>Danh má»¥c: </span>
          <span className='font-medium'>{FactorCategoryLabels[factor.category]}</span>
        </div>
        <div>
          <span className='text-gray-500'>ÄÆ¡n vá»‹: </span>
          <span className='font-medium'>{factor.unit}</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className='flex gap-2 pt-4 border-t border-gray-100'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus?.(!factor.isActive);
            }}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              factor.isActive
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {factor.isActive ? 'Táº¯t' : 'Báº­t'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className='flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors'
          >
            Sá»­a
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className='px-3 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors'
          >
            XÃ³a
          </button>
        </div>
      )}
    </div>
  );
};

export default FactorCard;
