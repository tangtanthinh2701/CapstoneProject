interface Props {
  image: string;
  title: string;
  price: string;
  daysLeft: string;
}

export default function ProjectCard({ image, title, price, daysLeft }: Props) {
  return (
    <div className='bg-[#0E2219] rounded-xl p-4 shadow-md hover:shadow-xl transition'>
      <img src={image} className='w-full h-40 object-cover rounded-lg mb-3' />

      <h3 className='text-lg font-semibold mb-1'>{title}</h3>
      <p className='text-gray-400 text-sm'>Giá khởi điểm: {price}</p>
      <p className='text-gray-400 text-sm'>Còn lại: {daysLeft}</p>
    </div>
  );
}
