import React, { useState, useEffect } from 'react';
import type {
  ProjectPartnerRequest,
  PartnerRole,
  PartnerRoleLabels,
} from '../../models/partner.model';
import { X } from 'lucide-react';

interface ProjectPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectPartnerRequest) => Promise<void>;
  projectId?: number;
  partners: Array<{ id: number; partnerName: string }>;
}

export const ProjectPartnerModal: React.FC<ProjectPartnerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  partners,
}) => {
  const [formData, setFormData] = useState<ProjectPartnerRequest>({
    projectId: projectId || 0,
    partnerId: 0,
    role: PartnerRole.INVESTOR,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (projectId) {
      setFormData((prev) => ({ ...prev, projectId }));
    }
  }, [projectId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.partnerId) {
      newErrors.partnerId = 'Vui lòng chọn đối tác';
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
      console.error('Error adding project partner:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-800 rounded-lg max-w-2xl w-full'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-700'>
          <h2 className='text-xl font-semibold text-white'>
            Thêm đối tác vào dự án
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
          {/* Select Partner */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Chọn đối tác <span className='text-red-400'>*</span>
            </label>
            <select
              value={formData.partnerId}
              onChange={(e) =>
                setFormData({ ...formData, partnerId: Number(e.target.value) })
              }
              className={`w-full px-4 py-2 bg-gray-700 border ${
                errors.partnerId ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors`}
            >
              <option value={0}>-- Chọn đối tác --</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.partnerName}
                </option>
              ))}
            </select>
            {errors.partnerId && (
              <p className='mt-1 text-sm text-red-400'>{errors.partnerId}</p>
            )}
          </div>

          {/* Select Role */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Vai trò <span className='text-red-400'>*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as PartnerRole,
                })
              }
              className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus: outline-none focus:border-green-500 transition-colors'
            >
              {Object.entries(PartnerRoleLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors resize-none'
              placeholder='Nhập ghi chú về vai trò của đối tác...'
            />
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
              {loading ? 'Đang thêm...' : 'Thêm đối tác'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
