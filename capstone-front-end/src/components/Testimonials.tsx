export default function Testimonials() {
  const reviews = [
    {
      author: 'Trần Hùng',
      title: 'CEO, Công ty X',
      text: 'Hệ thống AI giúp chúng tôi tối ưu chi phí lên đến 20%. Quy trình đấu giá rất minh bạch.',
    },
    {
      author: 'Lê Mai',
      title: 'Quản lý, Nhà máy Y',
      text: 'Tìm kiếm nhà cung cấp trở nên nhanh và hiệu quả hơn. Nền tảng này là một bước ngoặt.',
    },
    {
      author: 'Hoàng Nam',
      title: 'Giám đốc, Tập đoàn Z',
      text: 'OxyAI đem lại giá trị thực sự với sự minh bạch và tốc độ giao dịch.',
    },
  ];

  return (
    <section className='px-10 py-16'>
      <h2 className='text-2xl font-bold text-center mb-2'>
        Khách hàng nói về chúng tôi
      </h2>
      <p className='text-gray-400 text-center mb-10 max-w-xl mx-auto'>
        Hiệu quả, minh bạch và đáng tin cậy. Đây là những gì khách hàng chia sẻ.
      </p>

      <div className='grid md:grid-cols-3 gap-6'>
        {reviews.map((r) => (
          <div key={r.author} className='bg-[#0E2219] p-6 rounded-xl shadow'>
            <p className='text-gray-300 mb-4'>"{r.text}"</p>
            <h4 className='font-semibold'>{r.author}</h4>
            <p className='text-green-400 text-sm'>{r.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
