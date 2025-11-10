import { CheckCircle } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className='pt-28 pb-20 bg-gradient-to-b from-gray-50 to-white w-full'>
      <div className='flex flex-col lg:flex-row items-center justify-between w-full px-8 lg:px-16'>
        {/* Text Section */}
        <div className='w-full lg:w-1/2 text-center lg:text-left'>
          <h1 className='text-5xl lg:text-6xl font-bold text-blue-600 leading-tight'>
            All Your Team Needs in One Great Platform
          </h1>
          <p className='text-base text-gray-700 leading-relaxed mt-6 max-w-xl mx-auto lg:mx-0'>
            Follow your team plans, track work progress, and discuss work all in
            one place. Let us manage your work flawlessly and keep your team
            organized every step of the way.
          </p>

          <div className='mt-8 flex flex-wrap justify-center lg:justify-start gap-4'>
            <button className='bg-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold'>
              Watch Demo
            </button>

            <button className='bg-orange-500 text-orange-500 px-6 py-3 rounded-lg hover:bg-orange-600 transition-all text-sm font-semibold'>
              Get Started
            </button>
          </div>
        </div>

        {/* Image Section */}
        <div className='w-full lg:w-1/2 flex justify-center lg:justify-end mt-12 lg:mt-0'>
          <div className='relative bg-blue-50 rounded-3xl p-6 shadow-xl w-full max-w-lg lg:max-w-xl'>
            <img
              src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop'
              alt='Team collaboration'
              className='rounded-2xl w-full h-auto object-cover'
            />

            {/* Floating bubbles */}
            <div className='absolute top-10 right-8 bg-white rounded-full px-4 py-2 shadow-md flex items-center space-x-2 text-xs'>
              <CheckCircle className='w-4 h-4 text-blue-600' />
              <span className='text-gray-700 font-medium'>
                Mark task complete
              </span>
            </div>

            <div className='absolute top-32 right-8 bg-white rounded-full px-4 py-2 shadow-md flex items-center space-x-2 text-xs'>
              <div className='w-4 h-4 bg-blue-600 rounded-full'></div>
              <span className='text-gray-700 font-medium'>
                Lou booked a meeting
              </span>
            </div>

            <div className='absolute bottom-16 right-8 bg-white rounded-full px-4 py-2 shadow-md flex items-center space-x-2 text-xs'>
              <div className='w-4 h-4 bg-blue-600 rounded-full'></div>
              <span className='text-gray-700 font-medium'>
                Follow this project
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
