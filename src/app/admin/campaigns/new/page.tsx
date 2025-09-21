"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Opt = { id: string; name: string };

export default function NewCampaign() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Opt[]>([]);
  const [cats, setCats] = useState<Opt[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState<number | "">("");
  const [orgId, setOrgId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/orgs").then(r => r.json()).catch(() => ({ items: [] })),
      fetch("/api/categories").then(r => r.json()).catch(() => ({ items: [] })),
    ]).then(([o, c]) => {
      setOrgs(o.items ?? []);
      setCats(c.items ?? []);
      if (o.items?.[0]) setOrgId(o.items[0].id);
      if (c.items?.[0]) setCategoryId(c.items[0].id);
    });
  }, []);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !goal || !orgId || !categoryId) {
      alert("Vui lòng nhập đủ thông tin");
      return;
    }
    setLoading(true);
    try {
      let cover: string | null = null;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error("Upload ảnh thất bại");
        const { url } = await up.json();
        cover = url;
      }

      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          goal: Number(goal),
          cover,
          orgId,
          categoryId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      alert("✅ Tạo chiến dịch thành công!");
      router.push("/admin/campaigns");
    } catch (err: any) {
      alert(err?.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto px-6 py-12 space-y-6">
      <h1 className="text-2xl font-semibold">Tạo chiến dịch</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 grid gap-3 max-w-2xl">
        <input
          className="border rounded px-3 py-2"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="border rounded px-3 py-2"
          placeholder="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        <input
          type="number"
          className="border rounded px-3 py-2"
          placeholder="Mục tiêu (VND)"
          value={goal}
          onChange={(e) => setGoal(e.target.value === "" ? "" : Number(e.target.value))}
          required
        />

        <div className="space-y-2">
          <label className="block font-medium">Ảnh cover (tùy chọn)</label>
          <input type="file" accept="image/*" onChange={onPickFile} />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview"
                 className="mt-2 max-h-56 rounded border object-contain bg-slate-50" />
          )}
        </div>

        <select className="border rounded px-3 py-2" value={orgId} onChange={(e) => setOrgId(e.target.value)} required>
          {orgs.length === 0 && <option value="">-- Chọn tổ chức --</option>}
          {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>

        <select className="border rounded px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          {cats.length === 0 && <option value="">-- Chọn danh mục --</option>}
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
      </form>
    </main>
  );
}
