import React from 'react';
import type { RecentActivity } from '../../models/dashboard.model';
import { formatRelativeTime } from '../../utils/formatters';

interface RecentActivityProps {
  activities: RecentActivity[];
  isLoading?: boolean;
  onViewAll?: () => void;
  maxItems?: number;
}

const getActivityIcon = (type: string): string => {
  const icons: Record<string, string> = {
    CONTRACT_CREATED: '📄',
    CONTRACT_APPROVED: '✅',
    CONTRACT_REJECTED: '❌',
    CREDIT_ISSUED: '🎫',
    CREDIT_PURCHASED: '💳',
    CREDIT_RETIRED: '🔥',
    PAYMENT_RECEIVED: '💰',
    TREE_PLANTED: '🌱',
    GROWTH_RECORDED: '📊',
    ALERT_CREATED: '⚠️',
  };
  return icons[type] || '📌';
};

const getActivityColor = (type: string): string => {
  const colors: Record<string, string> = {
    CONTRACT_CREATED: 'bg-blue-100 text-blue-600',
    CONTRACT_APPROVED: 'bg-green-100 text-green-600',
    CONTRACT_REJECTED: 'bg-red-100 text-red-600',
    CREDIT_ISSUED: 'bg-purple-100 text-purple-600',
    CREDIT_PURCHASED: 'bg-indigo-100 text-indigo-600',
    CREDIT_RETIRED: 'bg-orange-100 text-orange-600',
    PAYMENT_RECEIVED: 'bg-emerald-100 text-emerald-600',
    TREE_PLANTED: 'bg-lime-100 text-lime-600',
    GROWTH_RECORDED: 'bg-cyan-100 text-cyan-600',
    ALERT_CREATED: 'bg-yellow-100 text-yellow-600',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
};

const RecentActivityComponent: React.FC<RecentActivityProps> = ({
  activities,
  isLoading = false,
  onViewAll,
  maxItems = 5,
}) => {
  const displayActivities = activities.slice(0, maxItems);

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>Hoat dong gan day</h3>
        </div>
        <div className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='flex items-start gap-3 animate-pulse'>
              <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
              <div className='flex-1'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Hoat dong gan day</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className='text-sm text-blue-600 hover:text-blue-700 font-medium'
          >
            Xem tat ca
          </button>
        )}
      </div>

      {displayActivities.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <p>Chua co hoat dong nao</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {displayActivities.map((activity) => (
            <div key={activity.id} className='flex items-start gap-3'>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getActivityColor(activity.type)}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>{activity.title}</p>
                <p className='text-sm text-gray-500 truncate'>{activity.description}</p>
                <p className='text-xs text-gray-400 mt-1'>
                  {formatRelativeTime(activity.timestamp)}
                  {activity.userName && ` - ${activity.userName}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivityComponent;
