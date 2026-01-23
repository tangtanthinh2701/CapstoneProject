import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  className = '',
  isLoading = false,
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className='flex items-center justify-between p-4 border-b border-gray-100'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
          {subtitle && <p className='text-sm text-gray-500 mt-0.5'>{subtitle}</p>}
        </div>
        {actions && <div className='flex items-center gap-2'>{actions}</div>}
      </div>

      <div className='p-4'>
        {isLoading ? (
          <div className='flex items-center justify-center h-64'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartCard;
