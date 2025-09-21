"use client";

export default function EditForm({
  init,
  orgs,
  categories,
}: {
  init: { id: string; title: string; goal: number; description: string | null; cover: string | null; orgId: string; categoryId: string; status: string };
  orgs: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget as any;

    // upload file nếu có
    let cover = f.coverUrl.value || init.cover || "";
    const file: File | undefined = f.coverFile?.files?.[0];
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upJson = await up.json();
      if (!up.ok) { alert("Upload ảnh lỗi: " + (upJson?.error || up.status)); return; }
      cover = upJson.url; // /uploads/xxx.jpg
    }

    const payload = {
      title: f.title.value,
      goal: Number(f.goal.value || 0),
      description: f.description.value || null,
      orgId: f.orgId.value,
      categoryId: f.categoryId.value,
      cover: cover || null,
      status: f.status.value,
    };

    const res = await fetch(`/api/campaigns/${init.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) { alert("Cập nhật thất bại: " + (await res.text())); return; }
    alert("✅ Đã cập nhật"); location.reload();
  }

  async function handleDelete() {
    if (!confirm("Xoá vĩnh viễn chiến dịch này?")) return;
    const res = await fetch(`/api/campaigns/${init.id}`, { method: "DELETE" });
    if (!res.ok) { alert("Không xoá được: " + (await res.text())); return; }
    alert("Đã xoá"); location.href = "/admin/campaigns";
  }

  async function handleClose() {
    if (!confirm("Đóng chiến dịch này?")) return;
    const res = await fetch(`/api/campaigns/${init.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CLOSED" }),
    });
    if (!res.ok) { alert("Không đóng được"); return; }
    alert("Đã đóng chiến dịch"); location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white border rounded p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input name="title" defaultValue={init.title} placeholder="Tiêu đề" className="border rounded px-3 py-2" />
        <input name="goal" type="number" defaultValue={init.goal} placeholder="Mục tiêu (VND)" className="border rounded px-3 py-2" />
        <select name="orgId" defaultValue={init.orgId} className="border rounded px-3 py-2">
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <select name="categoryId" defaultValue={init.categoryId} className="border rounded px-3 py-2">
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <input name="coverUrl" defaultValue={init.cover || ""} placeholder="Ảnh cover (URL) (tùy chọn)" className="border rounded px-3 py-2 w-full" />
      <input name="coverFile" type="file" accept="image/*" className="border rounded px-3 py-2 w-full" />

      <textarea name="description" defaultValue={init.description || ""} placeholder="Mô tả ngắn" className="border rounded px-3 py-2 w-full" />

      <div className="flex gap-3 items-center">
        <select name="status" defaultValue={init.status} className="border rounded px-3 py-2">
          <option value="ACTIVE">ACTIVE</option>
          <option value="DRAFT">DRAFT</option>
          <option value="CLOSED">CLOSED</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

        <button className="px-4 py-2 bg-emerald-600 text-white rounded" type="submit">Lưu thay đổi</button>
        <button type="button" onClick={handleClose} className="px-3 py-2 border rounded">Đóng chiến dịch</button>
        <button type="button" onClick={handleDelete} className="px-3 py-2 border rounded text-red-600">Xoá</button>
      </div>
    </form>
  );
}
