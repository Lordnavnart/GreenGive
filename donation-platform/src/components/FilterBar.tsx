"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type Cat = { slug: string; name: string };

export default function FilterBar({
  categories,
  defaultQuery,
  defaultCategory,
  defaultSort,
}: {
  categories: Cat[];
  defaultQuery?: string;
  defaultCategory?: string;
  defaultSort?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(defaultQuery ?? "");
  const [cat, setCat] = useState(defaultCategory ?? "");
  const [sort, setSort] = useState(defaultSort ?? "new");

  // đồng bộ khi back/forward
  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
    setCat(searchParams.get("category") ?? "");
    setSort(searchParams.get("sort") ?? "new");
  }, [searchParams]);

  function apply() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat) params.set("category", cat);
    if (sort !== "new") params.set("sort", sort);
    router.push(`/campaigns${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function clearAll() {
    setQ("");
    setCat("");
    setSort("new");
    router.push("/campaigns");
  }

  return (
    <div className="bg-white border rounded-xl p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 flex flex-col sm:flex-row gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder="Tìm theo tiêu đề…"
          className="flex-1 h-9 px-3 rounded border outline-none focus:ring-2 focus:ring-rose-200"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="h-9 px-3 rounded border bg-white"
        >
          <option value="">Tất cả</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 px-3 rounded border bg-white"
        >
          <option value="new">Mới nhất</option>
          <option value="raised">Quyên góp nhiều</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={apply}
          className="px-3 h-9 rounded bg-rose-600 text-white hover:bg-rose-700"
        >
          Áp dụng
        </button>
        <button
          onClick={clearAll}
          className="px-3 h-9 rounded border hover:bg-gray-50"
        >
          Xoá lọc
        </button>
      </div>
    </div>
  );
}
