import {
  ClockIcon,
  MessageSquareIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';

const BenefitsSection = () => {
  const benefits = [
    { icon: MessageSquareIcon, title: 'Encourage Team Communication' },
    { icon: ClockIcon, title: 'Helps Save Time & Money' },
    { icon: ShieldIcon, title: 'Makes Information Accessible' },
    { icon: UsersIcon, title: 'Keeps Everyone in The Loop' },
  ];

  return (
    <section className='py-16 px-6 lg:px-8 bg-pink-50'>
      <div className='max-w-7xl mx-auto'>
        <h2 className='text-3xl font-bold text-center text-gray-900 mb-12'>
          How Do We Make Your Team Life Easier?
        </h2>

        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div
                key={i}
                className='bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all'
              >
                <div className='inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl mb-4'>
                  <Icon className='w-7 h-7' />
                </div>
                <h3 className='text-base font-bold text-teal-700'>
                  {benefit.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default BenefitsSection;
