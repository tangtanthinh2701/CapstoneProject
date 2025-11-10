import { useState } from 'react';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      text: 'Unite has transformed how our team collaborates. The intuitive interface and powerful features have made project management effortless.',
      author: 'Adam',
      role: 'Developer, Novatech',
    },
    {
      text: 'The best team management platform we have used. It keeps everyone aligned and productive without the complexity.',
      author: 'Sarah',
      role: 'Product Manager, Brushed',
    },
    {
      text: 'Our team efficiency has increased by 40% since switching to Unite. Highly recommended!',
      author: 'Michael',
      role: 'CEO, Fixteria',
    },
  ];

  return (
    <section className='py-16 px-6 lg:px-8 bg-teal-700'>
      <div className='max-w-4xl mx-auto'>
        <h2 className='text-3xl font-bold text-white mb-12 text-center'>
          Hear It from Our Customers
        </h2>

        <div className='bg-white rounded-3xl p-8 lg:p-10 shadow-2xl'>
          <div className='flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-5'>
            <img
              src={`https://i.pravatar.cc/64?img=${currentIndex + 25}`}
              alt='Customer'
              className='w-16 h-16 rounded-full shadow-md flex-shrink-0'
            />
            <div className='flex-1'>
              <p className='text-gray-700 text-base mb-4 leading-relaxed'>
                {testimonials[currentIndex].text}
              </p>
              <p className='font-bold text-gray-900 text-sm'>
                {testimonials[currentIndex].author},{' '}
                <span className='font-normal text-gray-600'>
                  {testimonials[currentIndex].role}
                </span>
              </p>
            </div>
          </div>

          <div className='flex justify-center space-x-2 mt-6'>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={
                  'h-2 rounded-full transition-all ' +
                  (i === currentIndex ? 'bg-teal-600 w-6' : 'bg-gray-300 w-2')
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default TestimonialsSection;
