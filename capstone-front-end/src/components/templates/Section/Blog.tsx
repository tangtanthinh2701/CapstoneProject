const BlogSection = () => {
  const posts = [
    {
      image:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop',
      date: 'May 16, 2025',
      readTime: '1 min read',
      title: 'Introduction to product roadmaps',
    },
    {
      image:
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop',
      date: 'May 16, 2025',
      readTime: '2 min read',
      title: 'Our official WFH guide',
    },
    {
      image:
        'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop',
      date: 'May 16, 2025',
      readTime: '1 min read',
      title: 'How workday measures to performance',
    },
  ];

  return (
    <section className='py-16 px-6 lg:px-8 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <h2 className='text-3xl font-bold text-center text-gray-900 mb-12'>
          Access Our Learnings
        </h2>

        <div className='grid md:grid-cols-3 gap-8 mb-8'>
          {posts.map((post, i) => (
            <div
              key={i}
              className='bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow'
            >
              <img
                src={post.image}
                alt={post.title}
                className='w-full h-48 object-cover'
              />
              <div className='p-6'>
                <div className='flex items-center space-x-2 text-xs text-gray-600 mb-3'>
                  <span>Admin</span>
                  <span>•</span>
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className='text-lg font-bold text-gray-900'>
                  {post.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className='text-center'>
          <button className='bg-gray-900 text-green-400 px-8 py-3 rounded-full hover:bg-gray-800 transition-all shadow-md'>
            See All Resources
          </button>
        </div>
      </div>
    </section>
  );
};
export default BlogSection;
