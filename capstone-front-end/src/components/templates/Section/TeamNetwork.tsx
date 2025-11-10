const TeamNetworkSection = () => {
  const members = 12;
  const radius = 180;

  return (
    <section className='relative py-24 px-6 bg-[#031a3d] overflow-hidden'>
      <div className='max-w-5xl mx-auto text-center relative z-10'>
        <h2 className='text-4xl lg:text-5xl font-bold text-white mb-6'>
          Become a Better Team, Together.
        </h2>
        <p className='text-gray-300 text-base max-w-2xl mx-auto mb-16'>
          Build meaningful connections across your team, communicate seamlessly,
          and reach your shared goals faster than ever before.
        </p>

        {/* Network Container */}
        <div className='relative h-[450px] flex items-center justify-center'>
          {/* Lines connecting nodes */}
          <svg
            className='absolute inset-0 w-full h-full z-0'
            viewBox='0 0 600 600'
          >
            {[...Array(members)].map((_, i) => {
              const angle1 = (i * 360) / members;
              const angle2 = ((i + 1) * 360) / members;
              const x1 = 300 + radius * Math.cos((angle1 * Math.PI) / 180);
              const y1 = 300 + radius * Math.sin((angle1 * Math.PI) / 180);
              const x2 = 300 + radius * Math.cos((angle2 * Math.PI) / 180);
              const y2 = 300 + radius * Math.sin((angle2 * Math.PI) / 180);

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke='#4b6cb7'
                  strokeWidth='1.2'
                  strokeDasharray='4 3'
                  opacity='0.6'
                />
              );
            })}
          </svg>

          {/* Central Logo */}
          <div className='relative z-20'>
            <div className='w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center ring-4 ring-blue-400/30 animate-pulse'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-pink-400 rounded-lg'></div>
            </div>
          </div>

          {/* Team Members */}
          {[...Array(members)].map((_, i) => {
            const angle = (i * 360) / members;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <div
                key={i}
                className='absolute w-16 h-16 rounded-full border-4 border-white shadow-xl overflow-hidden transition-transform duration-300 hover:scale-110'
                style={{
                  left: `calc(50% + ${x}px - 2rem)`,
                  top: `calc(50% + ${y}px - 2rem)`,
                }}
              >
                <img
                  src={`https://i.pravatar.cc/100?img=${i + 5}`}
                  alt='Team member'
                  className='w-full h-full object-cover'
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle gradient glow */}
      <div className='absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-black/30'></div>
    </section>
  );
};

export default TeamNetworkSection;
