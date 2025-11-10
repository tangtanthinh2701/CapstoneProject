const ActivityTimelineSection = () => {
  return (
    <section className='py-20 px-6 lg:px-8 bg-[#fffaf6]'>
      <div className='max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center'>
        {/* LEFT: Activity Feed */}
        <div className='space-y-5'>
          {[
            {
              color: 'bg-blue-400',
              text: 'Jane attached 1 file to the board',
              avatar: 'https://i.pravatar.cc/100?img=47',
            },
            {
              color: 'bg-emerald-500',
              text: 'Phil assigned a task',
              avatar: 'https://i.pravatar.cc/100?img=64',
            },
            {
              color: 'bg-gray-400',
              text: 'Thomas booked a meeting',
              avatar: 'https://i.pravatar.cc/100?img=12',
            },
          ].map((item, i) => (
            <div
              key={i}
              className='bg-white/70 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition'
            >
              <img
                src={item.avatar}
                alt=''
                className='w-10 h-10 rounded-full object-cover'
              />
              <span className='text-gray-700 text-sm font-medium'>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT: Chart Card */}
        <div className='bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-br from-white via-white/90 to-gray-50 pointer-events-none'></div>

          <div className='relative'>
            {/* Timeline header */}
            <div className='grid grid-cols-8 gap-3 mb-6'>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div
                  key={num}
                  className='text-center text-xs text-gray-500 font-semibold'
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div className='space-y-2 mb-10'>
              <div className='h-3 rounded-full bg-emerald-200 w-3/4'></div>
              <div className='h-3 rounded-full bg-gray-200 w-1/4'></div>
              <div className='h-3 rounded-full bg-amber-200 w-full'></div>
              <div className='h-3 rounded-full bg-emerald-200 w-1/2'></div>
              <div className='h-3 rounded-full bg-pink-200 w-2/3'></div>
              <div className='h-3 rounded-full bg-emerald-200 w-1/3'></div>
              <div className='h-3 rounded-full bg-amber-200 w-3/4'></div>
              <div className='h-3 rounded-full bg-emerald-200 w-5/6'></div>
              <div className='h-3 rounded-full bg-pink-200 w-2/3'></div>
            </div>

            {/* Circle indicators */}
            <div className='flex justify-around'>
              <div className='relative w-24 h-24'>
                <div className='absolute inset-0 border-8 border-gray-200 rounded-full'></div>
                <div className='absolute inset-0 border-8 border-blue-500 rounded-full border-r-transparent rotate-45'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='text-sm font-semibold text-gray-600'>
                    75%
                  </span>
                </div>
              </div>

              <div className='relative w-24 h-24 flex items-center justify-center'>
                <div
                  className='absolute inset-0 rounded-full'
                  style={{
                    background: `conic-gradient(#10b981 0% 70%, #e5e7eb 70% 100%)`,
                  }}
                ></div>
                <div className='absolute inset-[6px] bg-white rounded-full flex items-center justify-center'>
                  <span className='text-sm font-semibold text-gray-600'>
                    70%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivityTimelineSection;
