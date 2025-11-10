const IntegrationsSection = () => {
  return (
    <section className='py-16 px-6 lg:px-8 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          <div className='space-y-6'>
            <div className='bg-teal-700 rounded-3xl p-10'>
              <h2 className='text-3xl font-bold text-white mb-4'>
                Integrates Easily with Industry-Leading Software
              </h2>
              <p className='text-teal-100 leading-relaxed'>
                Connect Unite with your favorite tools and services. Seamlessly
                integrate with the software your team already uses to create a
                unified workspace.
              </p>
            </div>
          </div>

          <div className='relative'>
            <div className='bg-white rounded-3xl p-6 shadow-xl space-y-3'>
              <div className='flex items-center space-x-3 p-3 border border-gray-200 rounded-xl'>
                <div className='w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold'>
                  ☁
                </div>
                <div className='flex-1 h-2 bg-gray-200 rounded-full'></div>
              </div>

              <div className='flex items-center space-x-3 p-3 border border-gray-200 rounded-xl'>
                <div className='w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold'>
                  ▣
                </div>
                <div className='flex-1 h-2 bg-gray-200 rounded-full'></div>
              </div>

              <div className='flex items-center space-x-3 p-3 bg-pink-50 border-2 border-pink-300 rounded-xl'>
                <div className='w-10 h-10 bg-pink-300 rounded-lg'></div>
                <div className='flex-1 h-2 bg-pink-300 rounded-full'></div>
              </div>

              <div className='flex items-center space-x-3 p-3 bg-teal-50 border-2 border-teal-300 rounded-xl'>
                <div className='w-10 h-10 bg-teal-600 rounded-lg'></div>
                <div className='flex-1 h-2 bg-teal-600 rounded-full'></div>
              </div>

              <div className='flex items-center space-x-3 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl'>
                <div className='w-10 h-10 bg-yellow-400 rounded-lg'></div>
                <div className='flex-1 h-2 bg-yellow-400 rounded-full'></div>
              </div>

              <div className='flex items-center space-x-3 p-3 bg-blue-50 border-2 border-blue-300 rounded-xl'>
                <div className='w-10 h-10 bg-blue-400 rounded-lg'></div>
                <div className='flex-1 h-2 bg-blue-400 rounded-full'></div>
              </div>
            </div>

            <div className='absolute -top-4 -right-4 space-y-3'>
              <div className='bg-white rounded-xl p-2 shadow-lg text-center'>
                <p className='text-xs text-gray-600'>Let's started</p>
              </div>
              <div className='w-12 h-12 bg-blue-900 rounded-lg shadow-lg'></div>
              <div className='w-12 h-12 bg-gray-900 rounded-lg shadow-lg'></div>
            </div>

            <div className='absolute -bottom-6 -left-6 bg-white rounded-2xl p-3 shadow-lg'>
              <div className='w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xl'>
                b
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default IntegrationsSection;
