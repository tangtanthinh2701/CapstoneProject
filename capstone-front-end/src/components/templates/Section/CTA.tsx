const CTASection = () => {
  return (
    <section className='py-16 px-6 lg:px-8 bg-gradient-to-b from-white to-pink-50'>
      <div className='max-w-7xl mx-auto text-center mb-12'>
        <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-8'>
          With the Right Platform, Everything Is Possible
        </h2>
        <button className='bg-gray-900 text-green-400 px-10 py-3 rounded-full hover:bg-gray-800 transition-all shadow-lg'>
          Try for Free
        </button>
      </div>

      <div className='max-w-7xl mx-auto grid md:grid-cols-2 gap-0 items-stretch shadow-2xl rounded-3xl overflow-hidden'>
        <div className='bg-gradient-to-br from-pink-200 to-pink-100 p-12 flex items-center justify-center'>
          <img
            src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=400&fit=crop'
            alt='Happy team'
            className='rounded-2xl shadow-xl'
          />
        </div>

        <div className='bg-teal-700 text-white p-12 flex flex-col items-center justify-center space-y-6'>
          <h3 className='text-3xl font-bold'>Try Us Out</h3>
          <p className='text-teal-100 text-lg'>No credit card needed</p>
          <button className='bg-white text-teal-700 px-8 py-3 rounded-full hover:bg-gray-100 transition-all font-semibold shadow-lg'>
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
};
export default CTASection;
