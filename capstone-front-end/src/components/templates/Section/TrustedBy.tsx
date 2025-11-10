const TrustedBySection = () => {
  const partners = [
    'Brushed',
    'Fixteria',
    'TRUVISION',
    'Kyro Inst.',
    'NOVATECH',
  ];

  return (
    <section className='py-16 px-6 lg:px-8 bg-white'>
      <div className='max-w-7xl mx-auto text-center'>
        <h2 className='text-3xl font-bold text-gray-900 mb-10'>
          Trusted by the Greatest
        </h2>
        <div className='flex flex-wrap justify-center items-center gap-8 lg:gap-12'>
          {partners.map((partner, i) => (
            <div
              key={i}
              className='text-xl lg:text-2xl font-bold text-gray-400'
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default TrustedBySection;
