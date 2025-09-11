// src/components/Pagination.tsx
import Link from "next/link";

function buildHref(baseParams: Record<string, any>, page: number) {
  const params = new URLSearchParams();
  if (baseParams.q) params.set("q", baseParams.q);
  if (baseParams.category) params.set("category", baseParams.category);
  if (baseParams.sort && baseParams.sort !== "new") params.set("sort", baseParams.sort);
  if (page > 1) params.set("page", String(page)); // trang 1 thì bỏ cho gọn URL
  const qs = params.toString();
  return `/campaigns${qs ? `?${qs}` : ""}`;
}

export default function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: { q?: string; category?: string; sort?: string };
}) {
  if (totalPages <= 1) return null;

  // Hiển thị "cửa sổ" 5 trang quanh trang hiện tại
  const window = 2;
  const start = Math.max(1, page - window);
  const end = Math.min(totalPages, page + window);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <nav className="flex items-center justify-center gap-2 mt-6">
      {/* Prev */}
      <Link
        aria-disabled={page <= 1}
        className={`px-3 h-9 rounded border ${
          page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
        }`}
        href={buildHref(params, Math.max(1, page - 1))}
      >
        Trang trước
      </Link>

      {/* Page numbers */}
      {start > 1 && (
        <>
          <Link className="px-3 h-9 rounded border hover:bg-gray-50" href={buildHref(params, 1)}>
            1
          </Link>
          {start > 2 && <span className="px-2">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          aria-current={p === page ? "page" : undefined}
          className={`px-3 h-9 rounded border ${
            p === page ? "bg-rose-600 text-white border-rose-600" : "hover:bg-gray-50"
          }`}
          href={buildHref(params, p)}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2">…</span>}
          <Link className="px-3 h-9 rounded border hover:bg-gray-50" href={buildHref(params, totalPages)}>
            {totalPages}
          </Link>
        </>
      )}

      {/* Next */}
      <Link
        aria-disabled={page >= totalPages}
        className={`px-3 h-9 rounded border ${
          page >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
        }`}
        href={buildHref(params, Math.min(totalPages, page + 1))}
      >
        Trang sau
      </Link>
    </nav>
  );
}

