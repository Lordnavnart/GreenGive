"use client";
import { useSearchParams, useRouter } from "next/navigation";

export default function CategoryChips({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const current = sp.get("cat") || "";

  function setCat(slug?: string) {
    const u = new URL(window.location.href);
    if (slug) u.searchParams.set("cat", slug);
    else u.searchParams.delete("cat");
    router.push(u.pathname + (u.search || ""));
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => setCat(undefined)}
        className={`px-3 py-1 rounded-full border text-sm ${
          !current ? "bg-rose-600 text-white border-rose-600" : "bg-white hover:bg-gray-50"
        }`}
      >
        Tất cả
      </button>
      {categories.map((c) => (
        <button
          key={c.slug}
          onClick={() => setCat(c.slug)}
          className={`px-3 py-1 rounded-full border text-sm ${
            current === c.slug
              ? "bg-rose-600 text-white border-rose-600"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
