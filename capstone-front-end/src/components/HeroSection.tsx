export default function HeroSection() {
  return (
    <section className='relative w-full h-[450px] flex items-center justify-center text-center px-6'>
      <img
        src='https://lh3.googleusercontent.com/aida-public/AB6AXuBMe7J3BmlJi5gq1eQb7AAICU-q33FrbU9604dBo6wQgjIi3VrwdP_hqpKK_IvZGJAxDJknWZ5Q3G9utQTSNOavECT3cygt1rQAgYqFljriqlG81qjqpWqFZDzQqnunEAW9t8PiCnt5H8eAbiz74mny8UGOnoxwbep8L_ac33gs5fPIis0Vfo9KLzPgl-nepZAnOqUuth5S0q3aMw4SdD7lgIUsKECFWPF8Oz5OD1tCNkkEMqogoeqI34JRQJJt-ASKqOHGCJiUZ82U'
        className='absolute inset-0 w-full h-full object-cover opacity-30'
      />

      <div className='relative z-10'>
        <h1 className='text-4xl lg:text-5xl font-extrabold mb-4 max-w-3xl mx-auto'>
          Tối ưu chuỗi cung ứng Oxy công nghiệp bằng AI
        </h1>
        <p className='text-gray-300 max-w-2xl mx-auto mb-6'>
          Tham gia hệ thống đấu giá minh bạch, hiệu quả và bền vững để định hình
          tương lai ngành công nghiệp xanh.
        </p>

        <button className='bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold text-black'>
          Khám phá các dự án
        </button>
      </div>
    </section>
  );
}
