import React from 'react';
import type { Partner } from '../../models/partner.model';
import { Building2, Edit, Trash2, Eye } from 'lucide-react';

interface PartnerCardProps {
  partner: Partner;
  onView: (partner: Partner) => void;
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({
  partner,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className='bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500 transition-all duration-300'>
      <div className='flex items-start gap-4'>
        {/* Partner Logo */}
        <div className='flex-shrink-0'>
          {partner.imgUrl ? (
            <img
              src={partner.imgUrl}
              alt={partner.partnerName}
              className='w-16 h-16 rounded-lg object-cover'
            />
          ) : (
            <div className='w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center'>
              <Building2 className='w-8 h-8 text-gray-400' />
            </div>
          )}
        </div>

        {/* Partner Info */}
        <div className='flex-1 min-w-0'>
          <h3 className='text-lg font-semibold text-white truncate'>
            {partner.partnerName}
          </h3>
        </div>

        {/* Actions */}
        <div className='flex gap-2'>
          <button
            onClick={() => onView(partner)}
            className='p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors'
            title='Xem chi tiết'
          >
            <Eye className='w-5 h-5' />
          </button>
          <button
            onClick={() => onEdit(partner)}
            className='p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors'
            title='Chỉnh sửa'
          >
            <Edit className='w-5 h-5' />
          </button>
          <button
            onClick={() => onDelete(partner)}
            className='p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors'
            title='Xóa'
          >
            <Trash2 className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  );
};
