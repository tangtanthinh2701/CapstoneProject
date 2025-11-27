export default function Footer() {
  return (
    <footer className='px-10 py-16 bg-[#07150D] text-gray-300'>
      <div className='grid md:grid-cols-4 gap-10'>
        <div>
          <h3 className='text-lg font-bold mb-3 text-white'>OxyAI</h3>
          <p className='text-sm'>
            Nền tảng đấu giá oxy công nghiệp minh bạch và hiệu quả.
          </p>
        </div>

        <div>
          <h4 className='font-bold mb-2 text-white'>Liên kết nhanh</h4>
          <ul className='space-y-1 text-sm'>
            <li>Trang chủ</li>
            <li>Dự án</li>
            <li>Giới thiệu</li>
            <li>Hỗ trợ</li>
          </ul>
        </div>

        <div>
          <h4 className='font-bold mb-2 text-white'>Pháp lý</h4>
          <ul className='space-y-1 text-sm'>
            <li>Điều khoản dịch vụ</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </div>

        <div>
          <h4 className='font-bold mb-2 text-white'>Liên hệ</h4>
          <ul className='space-y-1 text-sm'>
            <li>123 Đường Nguyễn Lương Bằng, phường Liên Chiểu</li>
            <li>support@oxyai.com</li>
            <li>(+84) 123 456 789</li>
          </ul>
        </div>
      </div>

      <p className='text-center mt-10 text-gray-500 text-sm'>
        © 2025 OxyAI. Đã đăng ký bản quyền.
      </p>
    </footer>
  );
}
