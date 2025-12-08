import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';

interface TreeSpecies {
  id: number;
  name: string;
  scientificName: string;
  carbonAbsorptionRate: number;
  quantityPlanned: number;
  quantityActual: number;
  costPerTree: number;
  notes: string | null;
}

interface Phase {
  id: number;
  phaseNumber: number;
  phaseName: string;
  phaseStatus: string;
  startDate: string;
  expectedDurationDays: number | null;
  treeSpecies: TreeSpecies[];
}

interface ProjectDetail {
  id: number;
  code: string;
  name: string;
  description: string | null;
  locationText: string;
  latitude: number;
  longitude: number;
  area: number;
  areaUnit: string;
  usableArea: number;
  plantingDate: string;
  totalTreesPlanned: number;
  totalTreesActual: number;
  plantingDensity: number;
  status: string;
  partnerOrganizations: string[];
  createdAt: string;
  updatedAt: string;
  phases: Phase[];
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // Load data by ID
  useEffect(() => {
    const loadProject = async () => {
      try {
        const res = await fetch(`http://localhost:8088/api/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to load project');

        const json = await res.json();
        setProject(json);
      } catch (err) {
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  if (loading)
    return <div className='text-white p-20'>Đang tải thông tin dự án...</div>;

  if (!project)
    return (
      <div className='text-white p-20'>
        Không tìm thấy dự án hoặc đã bị xóa.
      </div>
    );

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-8'>
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Danh sách dự án', href: '/projects' },
            { label: project.name },
          ]}
        />

        {/* Title */}
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold'>{project.name}</h1>

          <div className='flex gap-3'>
            <button
              onClick={() => navigate(`/projects/${id}/edit`)}
              className='px-4 py-2 bg-green-500 text-black rounded-lg font-semibold'
            >
              Chỉnh sửa dự án
            </button>
            <button className='px-4 py-2 text-green-500 bg-gray-700 rounded-lg'>
              Xuất báo cáo
            </button>
            <button className='px-4 py-2 text-blue-400 bg-gray-700 rounded-lg'>
              Lưu trữ
            </button>
          </div>
        </div>

        <p className='text-gray-300 mb-6'>
          Chi tiết thông tin và tiến độ dự án
        </p>

        {/* 📌 Top Statistics */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <p className='text-gray-400'>Tổng cây trồng</p>
            <p className='text-3xl font-bold'>
              {project.totalTreesActual} / {project.totalTreesPlanned}
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <p className='text-gray-400'>Mật độ trồng</p>
            <p className='text-3xl font-bold'>
              {project.plantingDensity} cây/ha
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <p className='text-gray-400'>Diện tích sử dụng</p>
            <p className='text-3xl font-bold'>
              {project.usableArea.toLocaleString()} {project.areaUnit}
            </p>
          </div>
        </div>

        {/* 📌 Thông tin chung */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
          <h2 className='text-xl font-bold mb-3'>Thông tin chung</h2>
          <p className='text-gray-300 mb-4'>{project.description}</p>

          {/* Progress Bar */}
          <div className='mb-2'>Tiến độ dự án</div>
          <div className='w-full h-3 bg-gray-700 rounded-full'>
            <div
              className='h-3 bg-green-500 rounded-full'
              style={{
                width: `${
                  (project.totalTreesActual / project.totalTreesPlanned) * 100
                }%`,
              }}
            ></div>
          </div>
          <p className='text-right text-sm text-gray-400 mt-1'>
            {Math.round(
              (project.totalTreesActual / project.totalTreesPlanned) * 100,
            )}
            %
          </p>
        </div>

        {/* 📌 Content Layout */}
        <div className='grid grid-cols-3 gap-6'>
          {/* Left content */}
          <div className='col-span-2 space-y-6'>
            {/* Tabs */}
            <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
              <div className='flex gap-8 border-b border-[#1E3A2B] pb-3 mb-4'>
                <button className='text-green-400 font-semibold border-b-2 border-green-500 pb-2'>
                  Tổng quan
                </button>
                <button className='text-red-400 hover:text-yellow-400'>
                  Lịch sử cập nhật
                </button>
                <button className='text-blue-400 hover:text-blue'>
                  Tài liệu & hình ảnh
                </button>
              </div>

              {/* Overview content */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-gray-400'>Địa điểm</p>
                  <p>{project.locationText}</p>
                </div>
                <div>
                  <p className='text-gray-400'>Ngày bắt đầu</p>
                  <p>{project.plantingDate}</p>
                </div>

                <div>
                  <p className='text-gray-400'>Diện tích</p>
                  <p>
                    {project.area.toLocaleString()} {project.areaUnit}
                  </p>
                </div>

                <div>
                  <p className='text-gray-400'>Diện tích sử dụng</p>
                  <p>
                    {project.usableArea.toLocaleString()} {project.areaUnit}
                  </p>
                </div>

                <div>
                  <p className='text-gray-400'>Tổ chức đối tác</p>
                  {project.partnerOrganizations.map((p, i) => (
                    <div key={i}>{p}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* 📌 Phases */}
            <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
              <h3 className='font-semibold text-lg mb-4'>
                Các giai đoạn triển khai
              </h3>

              {project.phases.map((ph) => (
                <div key={ph.id} className='p-4 mb-4 bg-[#13271F] rounded-lg'>
                  <p className='font-bold mb-1'>{ph.phaseName}</p>
                  <p className='text-gray-300 mb-2'>
                    Trạng thái: {ph.phaseStatus}
                  </p>
                  <p className='text-gray-300 mb-2'>
                    Ngày bắt đầu: {ph.startDate}
                  </p>

                  <div className='mt-3'>
                    <p className='font-semibold mb-2'>
                      Các loài cây trong giai đoạn:
                    </p>
                    {ph.treeSpecies.map((t) => (
                      <div
                        key={t.id}
                        className='bg-[#0E2219] p-3 rounded-lg mb-2 border border-[#1E3A2B]'
                      >
                        <p className='font-semibold'>{t.name}</p>
                        <p className='text-sm text-gray-400 italic'>
                          {t.scientificName}
                        </p>
                        <p className='mt-1 text-sm'>
                          Số lượng dự kiến: {t.quantityPlanned}
                        </p>
                        <p className='text-sm'>
                          Chi phí mỗi cây: {t.costPerTree.toLocaleString()} VND
                        </p>
                        {t.notes && (
                          <p className='text-sm text-gray-300 mt-1'>
                            Ghi chú: {t.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right content */}
          <div className='space-y-6'>
            {/* Map */}
            <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
              <h3 className='font-semibold text-lg mb-4'>Vị trí dự án</h3>

              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${project.latitude},${project.longitude}&zoom=13&size=600x300&markers=color:green|${project.latitude},${project.longitude}&key=YOUR_GOOGLE_API_KEY`}
                className='rounded-lg'
              />

              <p className='mt-3'>{project.locationText}</p>
              <p className='text-gray-400 text-sm'>
                {project.latitude}, {project.longitude}
              </p>
            </div>

            {/* Partners */}
            <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
              <h3 className='font-semibold text-lg mb-4'>Đối tác tham gia</h3>

              {project.partnerOrganizations.map((org, i) => (
                <div key={i} className='p-3 mb-2 bg-[#13271F] rounded-lg'>
                  {org}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
