import React, { useState, useEffect } from 'react';
import type { Partner, PartnerRequest } from '../../models/partner.model';
import { partnerService } from '../../services/partnerService';
import { PartnerCard } from '../../components/Partner/PartnerCard';
import { PartnerFormModal } from '../../components/Partner/PartnerFormModal';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const PartnerPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalPages: 0,
    totalElements: 0,
  });

  useEffect(() => {
    fetchPartners();
  }, [pagination.page]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await partnerService.getAllPartners(
        pagination.page,
        pagination.size,
        'id',
        'desc',
      );
      setPartners(response.data);
      if (response.pageInfo) {
        setPagination((prev) => ({
          ...prev,
          totalPages: response.pageInfo!.totalPages,
          totalElements: response.pageInfo!.totalElements,
        }));
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Không thể tải danh sách đối tác');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchPartners();
      return;
    }

    setLoading(true);
    try {
      const response = await partnerService.searchPartners(searchKeyword);
      setPartners(response.data);
    } catch (error) {
      console.error('Error searching partners:', error);
      toast.error('Không thể tìm kiếm đối tác');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: PartnerRequest) => {
    try {
      if (selectedPartner) {
        await partnerService.updatePartner(selectedPartner.id, data);
        toast.success('Cập nhật đối tác thành công! ');
      } else {
        await partnerService.createPartner(data);
        toast.success('Tạo đối tác mới thành công!');
      }
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Có lỗi xảy ra khi lưu đối tác');
      throw error;
    }
  };

  const handleDelete = async (partner: Partner) => {
    if (!confirm(`Bạn có chắc muốn xóa đối tác "${partner.partnerName}"?`)) {
      return;
    }

    try {
      await partnerService.deletePartner(partner.id);
      toast.success('Xóa đối tác thành công!');
      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Không thể xóa đối tác');
    }
  };

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedPartner(null);
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý Đối tác'},
          ]}
        />

        {/* Header */}
        <div className='mt-6 mb-8'>
          <h1 className='text-3xl font-bold text-white'>Quản lý Đối tác</h1>
          <p className='text-gray-400 mt-2'>
            Danh sách các đối tác tham gia dự án trồng rừng
          </p>
        </div>

        {/* Search & Actions */}
        <div className='flex flex-col sm:flex-row gap-4 mb-6'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder='Tìm kiếm đối tác...'
              className='w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors'
            />
          </div>
          <button
            onClick={handleSearch}
            className='px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors'
          >
            Tìm kiếm
          </button>
          <button
            onClick={() => setIsFormModalOpen(true)}
            className='px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2'
          >
            <Plus className='w-5 h-5' />
            Thêm đối tác mới
          </button>
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-500'></div>
          </div>
        ) : partners.length === 0 ? (
          <div className='text-center py-20'>
            <AlertCircle className='w-16 h-16 text-gray-600 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-gray-400 mb-2'>
              Chưa có đối tác nào
            </h3>
            <p className='text-gray-500'>
              Nhấn "Thêm đối tác mới" để tạo đối tác đầu tiên
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {partners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                onView={(p) => console.log('View:', p)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className='flex justify-center items-center gap-2 mt-8'>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.max(0, prev.page - 1),
                }))
              }
              disabled={pagination.page === 0}
              className='px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors'
            >
              ← Trước
            </button>
            <span className='text-gray-400'>
              Trang {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.totalPages - 1, prev.page + 1),
                }))
              }
              disabled={pagination.page >= pagination.totalPages - 1}
              className='px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors'
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <PartnerFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateOrUpdate}
        partner={selectedPartner}
      />
    </div>
  );
};
