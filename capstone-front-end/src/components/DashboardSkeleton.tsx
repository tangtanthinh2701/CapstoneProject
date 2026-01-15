export default function DashboardSkeleton() {
  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <div className='w-64 bg-[#07150D] border-r border-[#0E2219]'></div>

      <main className='flex-1 p-8 animate-pulse'>
        {/* Header skeleton */}
        <div className='h-8 bg-[#0E2219] rounded w-1/3 mb-6'></div>

        {/* Stats cards skeleton */}
        <div className='grid grid-cols-4 gap-4 mb-6'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-32 bg-[#0E2219] rounded-xl'></div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className='grid grid-cols-3 gap-6'>
          <div className='col-span-2 h-96 bg-[#0E2219] rounded-xl'></div>
          <div className='h-96 bg-[#0E2219] rounded-xl'></div>
        </div>
      </main>
    </div>
  );
}
