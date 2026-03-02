import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function MvpBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <ol className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`}>
          {item.href ? (
            <Link href={item.href} className="btn-link">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
