import React from 'react';
import { formatNumber, formatCurrency, formatCO2, formatPercentage } from '../../utils/formatters';

interface SummaryCardProps {
  title: string;
  value: number;
  type?: 'number' | 'currency' | 'co2' | 'percentage';
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  type = 'number',
  icon,
  trend,
  subtitle,
  className = '',
  onClick,
}) => {
  const formatValue = () => {
    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'co2':
        return formatCO2(value);
      case 'percentage':
        return formatPercentage(value);
      default:
        return formatNumber(value);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-500 mb-1'>{title}</p>
          <p className='text-2xl font-bold text-gray-900'>{formatValue()}</p>

          {subtitle && <p className='text-xs text-gray-400 mt-1'>{subtitle}</p>}

          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
              <span className='mr-1'>{trend.isPositive ? 'â†‘' : 'â†“'}</span>
              <span>{formatPercentage(Math.abs(trend.value))}</span>
              <span className='text-gray-400 ml-1'>so vá»›i ká»³ trÆ°á»›c</span>
            </div>
          )}
        </div>

        {icon && (
          <div className='flex-shrink-0 p-3 bg-blue-50 rounded-lg text-blue-600'>{icon}</div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
