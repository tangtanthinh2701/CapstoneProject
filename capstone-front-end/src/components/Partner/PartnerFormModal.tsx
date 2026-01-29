import React, { useState, useEffect } from 'react';
import type { Partner, PartnerRequest } from '../../models/partner.model';
import { X, Image as ImageIcon } from 'lucide-react';

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PartnerRequest) => Promise<void>;
  partner?: Partner | null;
}

export const PartnerFormModal: React.FC<PartnerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  partner,
}) => {
  const [formData, setFormData] = useState<PartnerRequest>({
    partnerName: '',
    imgUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (partner) {
      setFormData({
        partnerName: partner.partnerName,
        imgUrl: partner.imgUrl || '',
      });
    } else {
      setFormData({
        partnerName: '',
        imgUrl: '',
      });
    }
    setErrors({});
  }, [partner, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.partnerName.trim()) {
      newErrors.partnerName = 'Tên đối tác là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting partner:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-700'>
          <h2 className='text-xl font-semibold text-white'>
            {partner ? 'Chỉnh sửa đối tác' : 'Thêm đối tác mới'}
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Partner Name */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Tên đối tác <span className='text-red-400'>*</span>
            </label>
            <input
              type='text'
              value={formData.partnerName}
              onChange={(e) =>
                setFormData({ ...formData, partnerName: e.target.value })
              }
              className={`w-full px-4 py-2 bg-gray-700 border ${errors.partnerName ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors`}
              placeholder='Nhập tên đối tác...'
            />
            {errors.partnerName && (
              <p className='mt-1 text-sm text-red-400'>{errors.partnerName}</p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Logo đối tác (URL)
            </label>
            <div className='space-y-3'>
              <input
                type='url'
                value={formData.imgUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imgUrl: e.target.value })
                }
                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors'
                placeholder='https://example.com/logo.png'
              />

              {/* Image Preview */}
              {formData.imgUrl && (
                <div className='relative w-32 h-32 rounded-lg overflow-hidden border border-gray-600'>
                  <img
                    src={formData.imgUrl}
                    alt='Preview'
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {!formData.imgUrl && (
                <div className='flex items-center justify-center w-32 h-32 bg-gray-700 rounded-lg border border-dashed border-gray-600'>
                  <ImageIcon className='w-8 h-8 text-gray-500' />
                </div>
              )}
            </div>
            <p className='mt-1 text-xs text-gray-400'>
              Nhập URL của logo đối tác
            </p>
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-4 border-t border-gray-700'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors'
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type='submit'
              className='flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : partner ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
