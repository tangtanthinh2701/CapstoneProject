interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav className='text-sm text-gray-400 mb-4 flex items-center gap-1'>
      {items.map((item, idx) => (
        <span key={idx} className='flex items-center gap-1'>
          {idx > 0 && <span>/</span>}
          {item.href ? (
            <a href={item.href} className='hover:underline'>
              {item.label}
            </a>
          ) : (
            <span className='text-white font-medium'>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
