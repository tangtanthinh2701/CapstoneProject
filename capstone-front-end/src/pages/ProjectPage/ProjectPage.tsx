import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function ProjectPage() {
  return (
    <div className='flex bg-[#07150D] text-white'>
      <Sidebar />

      <div className='flex-1 p-8'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Danh sách dự án', href: '/projects' },
            { label: 'Dự án Oxy Tinh Khiết VinES' },
          ]}
        />

        <h1 className='text-3xl font-bold mb-4'>Dự án Oxy Tinh Khiết VinES</h1>

        {/* TODO: Các component khác sẽ đặt ở đây */}
        {/* <ProjectStats /> */}
        {/* <ProjectInfoForm /> */}
        {/* <ProjectOverview /> */}
        {/* <ProjectPartners /> */}
      </div>
    </div>
  );
}
