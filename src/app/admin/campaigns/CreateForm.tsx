"use client";

export default function CreateForm({
  orgs,
  categories,
}: {
  orgs: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget as any;

    // 1) nếu chọn file, upload trước để lấy URL
    let coverUrl = f.cover.value || "";
    const file: File | undefined = f.coverFile?.files?.[0];
    if (file) {
      const fd = new FormData();
      fd.append("file", file);

      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upJson = await up.json();
      if (!up.ok) {
        alert("Upload ảnh lỗi: " + (upJson?.error || up.status));
        return;
      }
      coverUrl = upJson.url; // /uploads/xxx.jpg
    }

    // 2) gọi API tạo campaign
    const data = {
      title: f.title.value,
      goal: Number(f.goal.value || 0),
      orgId: f.orgId.value,
      categoryId: f.categoryId.value,
      cover: coverUrl || null,
      description: f.description.value || null,
    };

    if (!data.title || !data.goal || !data.orgId || !data.categoryId) {
      alert("Vui lòng nhập đủ tiêu đề, mục tiêu, tổ chức, danh mục");
      return;
    }

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const txt = await res.text();
    if (!res.ok) {
      alert("Không tạo được: " + txt);
      return;
    }

    alert("✅ Đã tạo chiến dịch");
    (e.target as HTMLFormElement).reset();
    location.reload();
  }

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white border rounded p-4"
      onSubmit={handleSubmit}
    >
      <input name="title" placeholder="Tiêu đề" className="border rounded px-3 py-2 md:col-span-2" />
      <input name="goal" type="number" placeholder="Mục tiêu (VND)" className="border rounded px-3 py-2" />

      <select name="orgId" className="border rounded px-3 py-2">
        <option value="">— Tổ chức —</option>
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>

      <select name="categoryId" className="border rounded px-3 py-2">
        <option value="">— Danh mục —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* URL cover (tùy chọn) */}
      <input name="cover" placeholder="Ảnh cover (URL) — có thể bỏ trống" className="border rounded px-3 py-2 md:col-span-2" />

      {/* 👉 Upload từ thiết bị */}
      <input name="coverFile" type="file" accept="image/*" className="border rounded px-3 py-2 md:col-span-3" />

      <input name="description" placeholder="Mô tả ngắn" className="border rounded px-3 py-2 md:col-span-5" />

      <div className="md:col-span-5 text-right">
        <button className="px-4 py-2 bg-emerald-600 text-white rounded">Tạo chiến dịch</button>
      </div>
    </form>
  );
}
