const ReportsSection = () => {
  return (
    <section className='py-16 px-6 lg:px-8 bg-gray-50'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          <div className='bg-white rounded-3xl p-8 shadow-xl'>
            <div className='flex items-center space-x-2 mb-6 overflow-x-auto pb-2'>
              {[...Array(8)].map((_, i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/40?img=${i + 15}`}
                  alt='User'
                  className='w-10 h-10 rounded-full border-2 border-white shadow flex-shrink-0'
                />
              ))}
            </div>

            <div className='space-y-4 mb-6'>
              <div className='flex items-center space-x-4'>
                <div className='w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-3 bg-gray-200 rounded-full w-3/4'></div>
                  <div className='h-2 bg-gray-100 rounded-full w-1/2'></div>
                </div>
              </div>
              <div className='flex items-center space-x-4'>
                <div className='w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-3 bg-gray-200 rounded-full w-3/4'></div>
                  <div className='h-2 bg-gray-100 rounded-full w-1/2'></div>
                </div>
              </div>
            </div>

            <div className='flex justify-center mb-6'>
              <div className='w-24 h-24 border-8 border-blue-300 rounded-full relative'>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='text-sm font-semibold text-gray-700'>
                    100%
                  </span>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-6 gap-2'>
              {[40, 70, 90, 110, 80, 60].map((height, i) => (
                <div key={i} className='flex flex-col items-center'>
                  <div
                    className='w-full bg-blue-300 rounded-t'
                    style={{ height: height + 'px' }}
                  ></div>
                  <span className='text-xs text-gray-400 mt-1'>
                    {20 * (i + 1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-5'>
            <h2 className='text-4xl font-bold text-gray-900'>
              Easy-to-Read Reports
            </h2>
            <p className='text-gray-700 leading-relaxed'>
              Get instant insights into your team performance with beautiful,
              comprehensive reports. Track progress, identify bottlenecks, and
              make data-driven decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ReportsSection;
