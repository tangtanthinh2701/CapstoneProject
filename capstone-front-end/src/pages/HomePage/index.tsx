import React from 'react';
import {
  Menu,
  X,
  CheckCircle,
  Calendar,
  Users,
  BarChart3,
  Clock,
  MessageSquare,
  TrendingUp,
  Shield,
} from 'lucide-react';

function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: 'Unite has transformed how our team collaborates. The intuitive interface and powerful features have made project management effortless.',
      author: 'Adam',
      role: 'Developer, Novatech',
    },
    {
      text: "The best team management platform we've used. It keeps everyone aligned and productive without the complexity.",
      author: 'Sarah',
      role: 'Product Manager, Brushed',
    },
    {
      text: "Our team's efficiency has increased by 40% since switching to Unite. Highly recommended!",
      author: 'Michael',
      role: 'CEO, Fixteria',
    },
  ];

  const benefits = [
    {
      icon: <MessageSquare className='w-8 h-8' />,
      title: 'Encourage Team Communication',
    },
    { icon: <Clock className='w-8 h-8' />, title: 'Helps Save Time & Money' },
    {
      icon: <Shield className='w-8 h-8' />,
      title: 'Makes Information Accessible',
    },
    {
      icon: <Users className='w-8 h-8' />,
      title: 'Keeps Everyone in The Loop',
    },
  ];

  const blogPosts = [
    {
      image:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop',
      date: 'May 16, 2023',
      readTime: '1 min read',
      title: 'Introduction to product roadmaps',
    },
    {
      image:
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop',
      date: 'May 16, 2023',
      readTime: '2 min read',
      title: 'Our official WFH guide',
    },
    {
      image:
        'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop',
      date: 'May 16, 2023',
      readTime: '1 min read',
      title: 'How workday measures to performance',
    },
  ];

  const partners = [
    'Brushed',
    'Fixteria',
    'TRUVISION',
    'Kyro Inst.',
    'NOVATECH',
  ];

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <header className='fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100'>
        <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-gradient-to-br from-teal-600 to-pink-400 rounded-lg'></div>
              <span className='text-xl font-bold text-gray-900'>Unite</span>
            </div>

            <div className='hidden md:flex items-center space-x-8'>
              <a
                href='#'
                className='text-gray-700 hover:text-teal-600 transition'
              >
                Product
              </a>
              <a
                href='#'
                className='text-gray-700 hover:text-teal-600 transition'
              >
                Solutions
              </a>
              <a
                href='#'
                className='text-gray-700 hover:text-teal-600 transition'
              >
                Pricing
              </a>
              <a
                href='#'
                className='text-gray-700 hover:text-teal-600 transition'
              >
                Resources
              </a>
            </div>

            <div className='hidden md:flex items-center space-x-4'>
              <button className='text-teal-600 hover:text-teal-700 transition'>
                Log In
              </button>
              <button className='bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition'>
                Try for Free
              </button>
            </div>

            <button
              className='md:hidden'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className='pt-24 pb-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='space-y-6'>
              <h1 className='text-5xl md:text-6xl font-bold text-teal-600 leading-tight'>
                All Your Team Needs in One Great Platform
              </h1>
              <p className='text-lg text-gray-700 leading-relaxed'>
                Follow your team's plans, track work progress, and discuss work
                all in one place. Let us manage your work flawlessly and be on
                top of everything your team is up to.
              </p>
              <div className='flex flex-wrap gap-4'>
                <button className='border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-full hover:bg-gray-900 hover:text-white transition'>
                  Watch Demo
                </button>
                <button className='bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition'>
                  Try for Free
                </button>
              </div>
            </div>

            <div className='relative'>
              <div className='bg-gradient-to-br from-pink-200 to-pink-100 rounded-3xl p-8 relative overflow-hidden'>
                <img
                  src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=500&fit=crop'
                  alt='Team collaboration'
                  className='rounded-2xl w-full object-cover'
                />
                <div className='absolute top-24 right-8 bg-white rounded-full px-4 py-2 shadow-lg flex items-center space-x-2'>
                  <CheckCircle className='w-5 h-5 text-teal-600' />
                  <span className='text-sm'>Mark task complete</span>
                </div>
                <div className='absolute top-44 right-8 bg-white rounded-full px-4 py-2 shadow-lg flex items-center space-x-2'>
                  <div className='w-6 h-6 bg-teal-600 rounded-full'></div>
                  <span className='text-sm'>Lou booked a meeting</span>
                </div>
                <div className='absolute bottom-24 right-8 bg-white rounded-full px-4 py-2 shadow-lg flex items-center space-x-2'>
                  <div className='w-6 h-6 bg-teal-600 rounded-full'></div>
                  <span className='text-sm'>Follow this project</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Timeline */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='space-y-8'>
              <div className='bg-blue-100 rounded-2xl p-4 flex items-center space-x-3'>
                <div className='w-10 h-10 bg-blue-300 rounded-full'></div>
                <span className='text-gray-700'>
                  Jane attached 1 file to the board
                </span>
              </div>
              <div className='bg-blue-100 rounded-2xl p-4 flex items-center space-x-3'>
                <div className='w-10 h-10 bg-teal-600 rounded-full'></div>
                <span className='text-gray-700'>Phil assigned a task</span>
              </div>
              <div className='bg-blue-100 rounded-2xl p-4 flex items-center space-x-3'>
                <div className='w-10 h-10 bg-gray-400 rounded-full'></div>
                <span className='text-gray-700'>Thomas booked a meeting</span>
              </div>
            </div>

            <div className='bg-white rounded-3xl p-8 shadow-lg'>
              <div className='grid grid-cols-8 gap-4 mb-8'>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <div key={num} className='text-center text-gray-600'>
                    {num}
                  </div>
                ))}
              </div>
              <div className='space-y-3'>
                <div className='h-8 bg-teal-200 rounded-full w-3/4'></div>
                <div className='h-8 bg-gray-200 rounded-full w-1/4'></div>
                <div className='h-8 bg-yellow-200 rounded-full w-full'></div>
                <div className='h-8 bg-teal-200 rounded-full w-1/2'></div>
                <div className='h-8 bg-pink-200 rounded-full w-2/3'></div>
                <div className='h-8 bg-teal-200 rounded-full w-1/3'></div>
                <div className='h-8 bg-yellow-200 rounded-full w-3/4'></div>
                <div className='h-8 bg-teal-200 rounded-full w-5/6'></div>
                <div className='h-8 bg-pink-200 rounded-full w-2/3'></div>
              </div>
              <div className='mt-8 flex justify-around'>
                <div className='text-center'>
                  <div className='w-24 h-24 border-8 border-gray-300 rounded-full mb-2'></div>
                  <span className='text-gray-600 font-semibold'>68%</span>
                </div>
                <div className='text-center'>
                  <div className='w-24 h-24 border-8 border-teal-600 rounded-full mb-2'></div>
                  <span className='text-gray-600 font-semibold'>46%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Network */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-blue-900'>
        <div className='max-w-7xl mx-auto text-center'>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-8'>
            Become a Better Team, Together.
          </h2>
          <p className='text-gray-300 max-w-3xl mx-auto mb-12'>
            Connect your team members, streamline communication, and achieve
            your goals together on one unified platform.
          </p>

          <div className='relative h-96 flex items-center justify-center'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center'>
                <div className='w-12 h-12 bg-gradient-to-br from-teal-600 to-pink-400 rounded-lg'></div>
              </div>
            </div>

            {[...Array(12)].map((_, i) => {
              const angle = i * 30 * (Math.PI / 180);
              const radius = 150;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const colors = ['bg-pink-300', 'bg-teal-600', 'bg-blue-400'];

              return (
                <div
                  key={i}
                  className={`absolute w-16 h-16 ${colors[i % 3]} rounded-full border-4 border-white shadow-lg`}
                  style={{
                    left: `calc(50% + ${x}px - 2rem)`,
                    top: `calc(50% + ${y}px - 2rem)`,
                  }}
                >
                  <img
                    src={`https://i.pravatar.cc/64?img=${i + 1}`}
                    alt={`Team member ${i + 1}`}
                    className='w-full h-full rounded-full object-cover'
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Calendar & Workflow */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-pink-50'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='bg-white rounded-3xl p-8 shadow-lg'>
              <div className='grid grid-cols-7 gap-2 mb-6'>
                {[1, 2, 3, 4].map((row) =>
                  [...Array(7)].map((_, col) => {
                    const day = row * 7 + col - 6;
                    const isHighlighted = [
                      1, 2, 6, 7, 12, 15, 16, 19, 21, 23, 26, 27, 29, 30, 31,
                    ].includes(day);
                    const colors = [
                      'border-yellow-400',
                      'border-blue-300',
                      'border-teal-600',
                      'border-pink-300',
                    ];

                    return day > 0 && day <= 31 ? (
                      <div
                        key={`${row}-${col}`}
                        className={`aspect-square rounded-full flex items-center justify-center text-sm ${
                          isHighlighted
                            ? `border-2 ${colors[Math.floor(Math.random() * colors.length)]}`
                            : 'text-gray-400'
                        }`}
                      >
                        {day}
                      </div>
                    ) : (
                      <div key={`${row}-${col}`}></div>
                    );
                  }),
                )}
              </div>

              <div className='space-y-2'>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                  <div className='h-2 bg-gray-200 rounded-full flex-1'></div>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 bg-blue-300 rounded-full'></div>
                  <div className='h-2 bg-gray-200 rounded-full flex-1'></div>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 bg-teal-600 rounded-full'></div>
                  <div className='h-2 bg-gray-200 rounded-full flex-1'></div>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 bg-pink-300 rounded-full'></div>
                  <div className='h-2 bg-gray-200 rounded-full flex-1 w-3/4'></div>
                </div>
              </div>

              <div className='mt-6 bg-gray-50 rounded-xl p-4 flex items-center space-x-3'>
                <div className='w-10 h-10 bg-gray-300 rounded-full'></div>
                <div>
                  <p className='text-sm text-gray-600'>
                    11:30 - Roadmap presentation by
                  </p>
                  <p className='text-sm font-semibold'>Rose and Bill</p>
                </div>
              </div>
            </div>

            <div className='space-y-6'>
              <h2 className='text-4xl font-bold text-gray-900'>
                Simple & Approachable Workflow
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                Organize your work with intuitive calendars, timelines, and task
                boards. Stay on top of deadlines and keep your team aligned with
                a workflow that just makes sense.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-white'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='space-y-6'>
              <h2 className='text-4xl font-bold text-white bg-teal-700 rounded-3xl p-12'>
                Integrates Easily with Industry-Leading Software
              </h2>
              <p className='text-gray-700 leading-relaxed bg-teal-700 text-white rounded-3xl p-12'>
                Connect Unite with your favorite tools and services. Seamlessly
                integrate with the software your team already uses to create a
                unified workspace.
              </p>
            </div>

            <div className='relative'>
              <div className='bg-white rounded-3xl p-8 shadow-lg space-y-4'>
                <div className='flex items-center space-x-3 p-3 border border-gray-200 rounded-xl'>
                  <div className='w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white'>
                    ☁
                  </div>
                  <div className='flex-1 h-2 bg-gray-200 rounded-full'></div>
                </div>
                <div className='flex items-center space-x-3 p-3 border border-gray-200 rounded-xl'>
                  <div className='w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white'>
                    ▣
                  </div>
                  <div className='flex-1 h-2 bg-gray-200 rounded-full'></div>
                </div>
                <div className='flex items-center space-x-3 p-3 bg-pink-100 border border-pink-300 rounded-xl'>
                  <div className='w-10 h-10 bg-pink-300 rounded-lg'></div>
                  <div className='flex-1 h-2 bg-pink-300 rounded-full'></div>
                </div>
                <div className='flex items-center space-x-3 p-3 bg-teal-100 border border-teal-300 rounded-xl'>
                  <div className='w-10 h-10 bg-teal-600 rounded-lg'></div>
                  <div className='flex-1 h-2 bg-teal-600 rounded-full'></div>
                </div>
                <div className='flex items-center space-x-3 p-3 bg-yellow-100 border border-yellow-300 rounded-xl'>
                  <div className='w-10 h-10 bg-yellow-400 rounded-lg'></div>
                  <div className='flex-1 h-2 bg-yellow-400 rounded-full'></div>
                </div>
                <div className='flex items-center space-x-3 p-3 bg-blue-100 border border-blue-300 rounded-xl'>
                  <div className='w-10 h-10 bg-blue-400 rounded-lg'></div>
                  <div className='flex-1 h-2 bg-blue-400 rounded-full'></div>
                </div>
              </div>

              <div className='absolute -bottom-8 -left-8 bg-white rounded-2xl p-4 shadow-lg'>
                <div className='w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white'>
                  b
                </div>
              </div>

              <div className='absolute top-0 -right-8'>
                <div className='bg-white rounded-xl p-3 shadow-lg mb-4'>
                  <div className='text-xs text-gray-600'>
                    Free Until Jan 2023
                  </div>
                </div>
                <div className='w-12 h-12 bg-blue-900 rounded-lg mb-4'></div>
                <div className='w-12 h-12 bg-gray-900 rounded-lg'></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reports */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='bg-white rounded-3xl p-8 shadow-lg'>
              <div className='flex items-center space-x-4 mb-6 overflow-x-auto pb-2'>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className='flex-shrink-0'>
                    <img
                      src={`https://i.pravatar.cc/40?img=${i + 10}`}
                      alt={`User ${i + 1}`}
                      className='w-10 h-10 rounded-full border-2 border-white shadow'
                    />
                  </div>
                ))}
              </div>

              <div className='space-y-4 mb-6'>
                <div className='flex items-center space-x-4'>
                  <div className='w-16 h-16 bg-gray-200 rounded-lg'></div>
                  <div className='flex-1 space-y-2'>
                    <div className='h-3 bg-gray-200 rounded-full w-3/4'></div>
                    <div className='h-2 bg-gray-100 rounded-full w-1/2'></div>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <div className='w-16 h-16 bg-gray-200 rounded-lg'></div>
                  <div className='flex-1 space-y-2'>
                    <div className='h-3 bg-gray-200 rounded-full w-3/4'></div>
                    <div className='h-2 bg-gray-100 rounded-full w-1/2'></div>
                  </div>
                </div>
              </div>

              <div className='flex justify-center items-center space-x-8 mb-6'>
                <div className='text-center'>
                  <div className='w-24 h-24 border-8 border-blue-300 rounded-full mb-2 relative'>
                    <div className='absolute inset-0 border-8 border-transparent border-t-blue-300 rounded-full transform rotate-45'></div>
                  </div>
                  <span className='text-sm text-gray-600 font-semibold'>
                    68%
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-6 gap-2'>
                {[40, 60, 80, 100, 70, 50].map((height, i) => (
                  <div key={i} className='flex flex-col items-center'>
                    <div
                      className={`w-full bg-blue-300 rounded-t`}
                      style={{ height: `${height}px` }}
                    ></div>
                    <span className='text-xs text-gray-400 mt-1'>
                      {20 * (i + 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='space-y-6'>
              <h2 className='text-4xl font-bold text-gray-900'>
                Easy-to-Read Reports
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                Get instant insights into your team's performance with
                beautiful, comprehensive reports. Track progress, identify
                bottlenecks, and make data-driven decisions.
              </p>
              <button className='bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition'>
                Try for Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-white'>
        <div className='max-w-7xl mx-auto text-center'>
          <h2 className='text-4xl font-bold text-gray-900 mb-12'>
            Trusted by the Greatest
          </h2>
          <div className='flex flex-wrap justify-center items-center gap-12'>
            {partners.map((partner, i) => (
              <div key={i} className='text-2xl font-bold text-gray-400'>
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-teal-700'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-4xl font-bold text-white mb-12'>
            Hear It from Our Customers
          </h2>

          <div className='bg-white rounded-3xl p-8 md:p-12 shadow-2xl'>
            <div className='flex items-center space-x-6 mb-6'>
              <img
                src={`https://i.pravatar.cc/80?img=${currentTestimonial + 20}`}
                alt='Customer'
                className='w-20 h-20 rounded-full'
              />
              <div className='flex-1 text-left'>
                <p className='text-gray-700 text-lg mb-4'>
                  "{testimonials[currentTestimonial].text}"
                </p>
                <p className='font-bold text-gray-900'>
                  {testimonials[currentTestimonial].author},{' '}
                  {testimonials[currentTestimonial].role}
                </p>
              </div>
            </div>

            <div className='flex justify-center space-x-2 mt-8'>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition ${
                    i === currentTestimonial ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-pink-50'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center text-gray-900 mb-12'>
            How Do We Make Your Team Life Easier?
          </h2>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className='bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition'
              >
                <div className='inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl mb-4'>
                  {benefit.icon}
                </div>
                <h3 className='text-xl font-bold text-teal-700'>
                  {benefit.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-white'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center text-gray-900 mb-12'>
            Access Our Learnings
          </h2>

          <div className='grid md:grid-cols-3 gap-8 mb-8'>
            {blogPosts.map((post, i) => (
              <div
                key={i}
                className='bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition'
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className='w-full h-48 object-cover'
                />
                <div className='p-6'>
                  <div className='flex items-center space-x-3 text-sm text-gray-600 mb-3'>
                    <span>Admin</span>
                    <span>•</span>
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900'>
                    {post.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className='text-center'>
            <button className='bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition'>
              See All Resources
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-pink-50'>
        <div className='max-w-7xl mx-auto text-center mb-8'>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-8'>
            With the Right Platform, Everything Is Possible
          </h2>
          <button className='bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition'>
            Try for Free
          </button>
        </div>

        <div className='max-w-7xl mx-auto grid md:grid-cols-2 gap-0 items-center'>
          <div className='bg-gradient-to-br from-pink-200 to-pink-100 p-12 flex items-center justify-center'>
            <img
              src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=400&fit=crop'
              alt='Happy team'
              className='rounded-2xl'
            />
          </div>

          <div className='bg-teal-700 text-white p-12 text-center space-y-6'>
            <h3 className='text-3xl font-bold'>Try Us Out</h3>
            <p className='text-teal-100'>No credit card needed</p>
            <button className='bg-white text-teal-700 px-8 py-3 rounded-full hover:bg-gray-100 transition font-semibold'>
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-4 gap-12 mb-12'>
            {/* Logo & Address */}
            <div className='space-y-6'>
              <div className='flex items-center space-x-2'>
                <div className='w-8 h-8 bg-gradient-to-br from-teal-600 to-pink-400 rounded-lg'></div>
                <span className='text-xl font-bold'>Unite</span>
              </div>
              <div className='text-gray-400'>
                <p>500 Terry Francine Street,</p>
                <p>San Francisco, CA 94158</p>
              </div>
              <nav className='space-y-2'>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Home
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Product
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Solutions
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Pricing
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Resources
                </a>
              </nav>
            </div>

            {/* Company */}
            <div className='space-y-4'>
              <h4 className='text-xl font-bold'>Company</h4>
              <nav className='space-y-2'>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Our Story
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Customers
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Careers
                </a>
              </nav>
            </div>

            {/* Download App */}
            <div className='space-y-4'>
              <h4 className='text-xl font-bold'>Download Our App</h4>
              <div className='space-y-3'>
                <a href='#' className='block'>
                  <div className='bg-white text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 transition'>
                    <span className='text-2xl'>🍎</span>
                    <div>
                      <p className='text-xs'>Download on the</p>
                      <p className='font-semibold'>App Store</p>
                    </div>
                  </div>
                </a>
                <a href='#' className='block'>
                  <div className='bg-white text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 transition'>
                    <span className='text-2xl'>▶</span>
                    <div>
                      <p className='text-xs'>GET IT ON</p>
                      <p className='font-semibold'>Google Play</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Get Started */}
            <div className='space-y-4'>
              <h4 className='text-xl font-bold'>Get Started</h4>
              <nav className='space-y-2'>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Contact Us
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Start a Free Trial
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Watch Demo
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  FAQ
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Accessibility
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Terms & Conditions
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Privacy Policy
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Shipping Policy
                </a>
                <a
                  href='#'
                  className='block text-gray-300 hover:text-white transition'
                >
                  Refund Policy
                </a>
              </nav>
            </div>
          </div>

          {/* Social Links */}
          <div className='flex justify-end space-x-6 mb-8'>
            <a href='#' className='text-gray-400 hover:text-white transition'>
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
              </svg>
            </a>
            <a href='#' className='text-gray-400 hover:text-white transition'>
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
              </svg>
            </a>
            <a href='#' className='text-gray-400 hover:text-white transition'>
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
              </svg>
            </a>
            <a href='#' className='text-gray-400 hover:text-white transition'>
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
              </svg>
            </a>
            <a href='#' className='text-gray-400 hover:text-white transition'>
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className='border-t border-gray-800 pt-8 text-center text-gray-400 text-sm'>
            © 2035 by Unite. Powered and secured by{' '}
            <a href='#' className='underline hover:text-white'>
              Wix
            </a>
          </div>
        </div>
      </footer>

      {/* Chat Button */}
      <button className='fixed bottom-8 right-8 w-16 h-16 bg-teal-600 text-white rounded-full shadow-2xl hover:bg-teal-700 transition flex items-center justify-center'>
        <MessageSquare className='w-6 h-6' />
      </button>
    </div>
  );
}

export default HomePage;

function useState<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void];
function useState(initialValue: any): [any, (value: any) => void] {
    // Delegate to React's built-in useState to preserve expected behavior.
    return (React as any).useState(initialValue);
}

