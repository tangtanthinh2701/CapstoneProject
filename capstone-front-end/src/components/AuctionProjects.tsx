import ProjectCard from './ProjectCard';

export default function AuctionProjects() {
  return (
    <section className='px-10 py-16'>
      <h2 className='text-2xl font-bold mb-6'>Các dự án đang đấu giá</h2>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <ProjectCard
          image='https://lh3.googleusercontent.com/aida-public/AB6AXuDGxXFh-5bWeNWtL6SA69EZkEvz52hA67ion-Q4dn0uexK8AfjIldBMQP683Zj7cwy6HvEbatiAwXD-HjsQAPsH9pANS_1ZNE8sRskiXGv9wVY8y8yX6tcVM79EPBpKQu3wfs3AxTxCl3P0wPz0Yjdy90a0rIZEMBVQmSAl-YsYoVE7nCUHWzjcfyyKt22Sigw06la4qtjpkYuUdmqVqzWpa-8Sm5qXfRtF04pRI5cNiq0ULE0z2DfEawdwYBYD-4tV_HenYpLM9yWr'
          title='Dự án Oxy lỏng cho Khu công nghiệp A'
          price='800.000.000 VND'
          daysLeft='10 ngày'
        />
        <ProjectCard
          image='https://lh3.googleusercontent.com/aida-public/AB6AXuAA1h0Rz-GouAmOSViQoYbTzqRWcgDzYzLDioeupIMbFhs4b6zCXrHZAMD2Yh8ByzttIcIRz9QJCnkkevFEtfyloQ1Y24-69pLlght2VlXksFQaxEb4CwPM9zKEGmeEudTROTeCqZ7Fp7asMPW9QOaoVMmVpJfmKRVfqWzcWk7wjN_WnfKHL4mbO5ww8Bn5SfqsRclL0cEjY2OPoh-7y_1cUf_BpI8sqPI31dx_hG0G5yMFS51tjfhVj08nlGONqqYPSGUkOt4PTuFl'
          title='Hợp đồng cung cấp cho nhà máy thép B'
          price='1.200.000.000 VND'
          daysLeft='5 ngày'
        />
        <ProjectCard
          image='https://lh3.googleusercontent.com/aida-public/AB6AXuCZo810EQKJAK8SvlripyYkhMugSEQmBWwNLJQnqGHtqW9JhudgJ9ZYjIyRn9zD5eD6he2DZOyM8Giwj2mc2qsUR8js9xgHr-A-ZlAUN99tbxl6py-Ug-pRZXBch3A9ivdnAeRTXKRuUEHtzSVCrdE0zeG90ERnwdOWCoqnyhhPR0q91daGnmuPWGew0mXzIBZbAYVs_KWIYG5D6nwvXQwi18oStNCvn24Cy-cQXDbh9fsaohmL3AKZWQa2sa51Ho-nQdiQOA4AlQBR'
          title='Dự án năng lượng tái tạo C'
          price='650.000.000 VND'
          daysLeft='8 ngày'
        />
      </div>

      <button className='bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl text-black font-semibold'>
        Xem tất cả dự án
      </button>
    </section>
  );
}
