const CalendarWorkflowSection = () => {
  return (
    <section className='py-16 px-6 lg:px-8 bg-pink-50'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          <div className='bg-white rounded-3xl p-8 shadow-xl'>
            <div className='grid grid-cols-7 gap-2 mb-6'>
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isHighlighted = [
                  1, 2, 6, 7, 12, 15, 16, 19, 21, 23, 26, 27, 29, 30, 31,
                ].includes(day);
                const colors = [
                  'border-yellow-400',
                  'border-blue-300',
                  'border-teal-600',
                  'border-pink-300',
                ];
                const randomColor =
                  colors[Math.floor(Math.random() * colors.length)];

                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-full flex items-center justify-center text-xs ${isHighlighted ? 'border-2 ' + randomColor + ' font-semibold' : 'text-gray-400'}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className='space-y-2 mb-6'>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                <div className='h-1.5 bg-gray-200 rounded-full flex-1'></div>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 bg-blue-300 rounded-full'></div>
                <div className='h-1.5 bg-gray-200 rounded-full flex-1'></div>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 bg-teal-600 rounded-full'></div>
                <div className='h-1.5 bg-gray-200 rounded-full flex-1'></div>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 bg-pink-300 rounded-full'></div>
                <div
                  className='h-1.5 bg-gray-200 rounded-full flex-1'
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>

            <div className='bg-gray-50 rounded-xl p-4 flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gray-300 rounded-full flex-shrink-0'></div>
              <div>
                <p className='text-xs text-gray-600'>
                  11:30 - Roadmap presentation by
                </p>
                <p className='text-sm font-semibold text-gray-900'>
                  Rose and Bill
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-5'>
            <h2 className='text-4xl font-bold text-gray-900'>
              Simple & Approachable Workflow
            </h2>
            <p className='text-gray-700 leading-relaxed'>
              Organize your work with intuitive calendars, timelines, and task
              boards. Stay on top of deadlines and keep your team aligned with a
              workflow that just makes sense.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default CalendarWorkflowSection;
