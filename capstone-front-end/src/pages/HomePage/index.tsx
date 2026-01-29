import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// MOCK TESTIMONIALS
const TESTIMONIALS = [
  {
    name: 'Nguyễn Thanh Tùng',
    role: 'CEO, GreenEarth Corp',
    content: 'Nền tảng tuyệt vời giúp doanh nghiệp của chúng tôi dễ dàng tiếp cận và mua tín chỉ carbon. Quy trình minh bạch và nhanh chóng.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop'
  },
  {
    name: 'Trần Thị Mai',
    role: 'Quản lý dự án, Rừng Xanh NGO',
    content: 'Việc theo dõi sự phát triển của cây trồng qua vệ tinh và AI thực sự ấn tượng. Nó giúp chúng tôi tiết kiệm rất nhiều chi phí giám sát.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop'
  },
  {
    name: 'Lê Văn Nam',
    role: 'Nhà đầu tư cá nhân',
    content: 'Tôi đã đầu tư vào 3 dự án trên CarbonCredit và rất hài lòng với lợi nhuận cũng như ý nghĩa môi trường mà nó mang lại.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop'
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [projects] = useState<any[]>([]);

  // ... (giữ nguyên phần useEffect)

  return (
    <div className="min-h-screen bg-[#050F09] text-white font-sans selection:bg-green-500 selection:text-white">
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 bg-[#050F09]/80 backdrop-blur-md border-b border-[#1E3A2B]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="material-icons text-white text-sm">forest</span>
            </div>
            <span className="font-bold text-xl">Carbon<span className="text-green-500">Credit</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-green-400 transition">Tính năng</a>
            <a href="#projects" className="hover:text-green-400 transition">Dự án</a>
            <a href="#testimonials" className="hover:text-green-400 transition">Đánh giá</a>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-full transition shadow-lg shadow-green-500/20"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-full transition shadow-lg"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2.5 border border-green-500/30 text-green-400 font-medium rounded-full hover:bg-green-500/10 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition shadow-lg"
                >
                  Đăng ký ngay
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      < section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex items-center justify-center overflow-hidden" >
        {/* Animated Background */}
        < div className="absolute inset-0 select-none pointer-events-none" >
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000"></div>
          <img
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07150D] via-transparent to-[#07150D]"></div>
        </div >

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 round-full bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Nền tảng Tín chỉ Carbon số 1 Việt Nam
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
            Kiến tạo tương lai <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Xanh & Bền Vững</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Kết nối doanh nghiệp và các dự án rừng. Minh bạch hóa giao dịch tín chỉ carbon thông qua công nghệ hiện đại và AI.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate(isAuthenticated ? '/projects' : '/signup')}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-2xl transition shadow-xl shadow-green-500/20 flex items-center justify-center gap-2 transform hover:-translate-y-1"
            >
              <span className="material-icons">rocket_launch</span>
              Khám phá ngay
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="px-8 py-4 bg-[#0E2219] hover:bg-[#13271F] border border-[#1E3A2B] text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
            >
              <span className="material-icons text-gray-400">play_circle</span>
              Xem demo
            </button>
          </div>
        </div>
      </section >

      {/* STATS */}
      < section className="py-10 border-y border-[#1E3A2B] bg-[#0E2219]/30" >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Dự án đã triển khai', value: '150+', color: 'text-green-400' },
            { label: 'Tấn CO₂ hấp thụ', value: '2.5M', color: 'text-blue-400' },
            { label: 'Đối tác doanh nghiệp', value: '500+', color: 'text-purple-400' },
            { label: 'Giá trị giao dịch', value: '$12M', color: 'text-yellow-400' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className={`text-4xl font-black mb-2 ${stat.color}`}>{stat.value}</p>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section >

      {/* FEATURES / BENEFITS */}
      < section id="features" className="py-24 px-6 relative" >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            Giải pháp <span className="text-green-500">toàn diện</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'verified_user',
                title: 'Minh Bạch Tuyệt Đối',
                desc: 'Mọi giao dịch và số liệu tăng trưởng của cây đều được ghi nhận và không thể thay đổi.',
                color: 'bg-blue-500'
              },
              {
                icon: 'topic',
                title: 'Quản Lý Thông Minh',
                desc: 'Hệ thống AI tự động phân tích sức khỏe cây trồng và dự báo sản lượng tín chỉ carbon chính xác.',
                color: 'bg-purple-500'
              },
              {
                icon: 'currency_exchange',
                title: 'Giao Dịch Dễ Dàng',
                desc: 'Sàn giao dịch tập trung giúp việc mua bán tín chỉ diễn ra nhanh chóng, an toàn và thuận tiện.',
                color: 'bg-green-500'
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-[#0E2219] border border-[#1E3A2B] hover:border-green-500/30 transition hover:shadow-2xl hover:shadow-green-900/10">
                <div className={`w-14 h-14 ${feature.color}/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
                  <span className={`material-icons text-2xl ${feature.color.replace('bg-', 'text-')}`}>{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* FEATURED PROJECTS */}
      < section id="projects" className="py-24 px-6 bg-[#0E2219]/20" >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-green-500 font-bold tracking-wider uppercase text-sm">Dự án tiêu biểu</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Dự án đang mở bán</h2>
            </div>
            <Link to="/projects" className="hidden md:flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold transition">
              Xem tất cả <span className="material-icons">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <div
                key={i}
                className="group bg-[#0E2219] border border-[#1E3A2B] rounded-3xl overflow-hidden hover:border-green-500/50 transition duration-300 cursor-pointer flex flex-col"
                onClick={() => navigate(isAuthenticated ? `/projects/${project.id}` : '/login')}
              >
                {/* Image */}
                <div className="h-64 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E2219] to-transparent z-10"></div>
                  <img
                    src={project.imageUrl || `https://source.unsplash.com/random/800x600?forest,nature&sig=${i}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    alt={project.name}
                  />
                  <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 uppercase tracking-wide">
                    {project.status === 'UPCOMING' ? 'Sắp mở bán' : 'Đang hoạt động'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="text-xs font-mono text-green-500 mb-2">{project.code}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-green-400 transition">{project.name}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                    {project.description || 'Dự án này đang góp phần quan trọng vào việc bảo vệ môi trường và tạo ra tín chỉ carbon.'}
                  </p>

                  <div className="pt-6 border-t border-[#1E3A2B] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="material-icons text-base text-gray-500">location_on</span>
                      {project.location || 'Việt Nam'}
                    </div>
                    {project.target && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Mục tiêu</p>
                        <p className="font-bold text-green-400">{project.target}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link to="/projects" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold transition">
              Xem tất cả dự án <span className="material-icons">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section >

      {/* TESTIMONIALS SECTION */}
      < section id="testimonials" className="py-24 px-6 bg-[#0E2219]/20" >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-green-500 font-bold tracking-wider uppercase text-sm">Đánh giá</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">Khách hàng nói gì về chúng tôi?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((item, i) => (
              <div key={i} className="bg-[#0E2219] border border-[#1E3A2B] p-8 rounded-3xl relative">
                <div className="absolute -top-4 left-8 text-6xl text-green-500/20 font-serif">"</div>
                <p className="text-gray-300 mb-8 relative z-10 leading-relaxed italic">
                  {item.content}
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-500/30"
                  />
                  <div>
                    <h4 className="font-bold text-white">{item.name}</h4>
                    <p className="text-xs text-green-400">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* CTA SECTION */}
      < section className="py-24 px-6" >
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-green-600 to-emerald-800 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

          <h2 className="relative z-10 text-3xl md:text-5xl font-bold mb-6">Bạn đã sẵn sàng để thay đổi?</h2>
          <p className="relative z-10 text-green-50 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Gia nhập cộng đồng hơn 10,000+ cá nhân và doanh nghiệp đang chung tay vì một Việt Nam xanh hơn.
          </p>

          <button
            onClick={() => navigate('/signup')}
            className="relative z-10 px-10 py-4 bg-white text-green-800 font-bold text-lg rounded-xl hover:bg-gray-100 transition shadow-xl inline-flex items-center gap-2"
          >
            Đăng ký tài khoản miễn phí
            <span className="material-icons">east</span>
          </button>
        </div>
      </section >

      {/* FOOTER */}
      < footer className="bg-[#050F09] border-t border-[#1E3A2B] pt-20 pb-10 px-6" >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="material-icons text-white text-sm">forest</span>
              </div>
              <span className="font-bold text-xl">Carbon<span className="text-green-500">Credit</span></span>
            </Link>
            <p className="text-gray-400 max-w-md leading-relaxed">
              Nền tảng tiên phong trong việc số hóa và giao dịch tín chỉ carbon tại Việt Nam. Chúng tôi cam kết mang lại sự minh bạch và hiệu quả cao nhất.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6">Liên kết</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-green-400 transition">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Dự án</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Tin tức</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Tuyển dụng</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Pháp lý</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-green-400 transition">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Báo cáo minh bạch</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-[#1E3A2B] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 Carbon Credit System. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-[#0E2219] flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-white transition">
              <span className="material-icons text-sm">facebook</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#0E2219] flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-white transition">
              <span className="material-icons text-sm">email</span>
            </a>
          </div>
        </div>
      </footer >
    </div >
  );
}
