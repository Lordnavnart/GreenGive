"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Opt = { id: string; name: string; slug?: string };

export default function AdminCreateCampaign() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");     // url sau upload

  const [orgs, setOrgs] = useState<Opt[]>([]);
  const [cats, setCats] = useState<Opt[]>([]);
  const [orgId, setOrgId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // nạp dropdown
    (async () => {
      try {
        const [oRes, cRes] = await Promise.all([
          fetch("/api/orgs"),
          fetch("/api/categories"),
        ]);
        const [o, c] = await Promise.all([oRes.json(), cRes.json()]);
        setOrgs(o || []);
        setCats(c || []);
        if (o?.[0]?.id) setOrgId(o[0].id);
        if (c?.[0]?.id) setCategoryId(c[0].id);
      } catch (e) {
        // optional
      }
    })();
  }, []);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("file") as HTMLInputElement;
    if (!input?.files?.length) return;

    setUploading(true);
    setMsg(null);

    const fd = new FormData();
    fd.append("file", input.files[0]);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();

    if (res.ok && data.url) {
      setCover(data.url);
      setMsg("Đã upload ảnh bìa.");
    } else setMsg(data?.error || "Upload thất bại");

    setUploading(false);
  }

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title || !goal) {
      setMsg("Vui lòng nhập Tiêu đề và Mục tiêu.");
      return;
    }
    setCreating(true);
    setMsg(null);

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        goal: Number(goal),
        description,
        cover,
        orgId: orgId || undefined,
        categoryId: categoryId || undefined,
      }),
    });
    const data = await res.json();

    if (res.ok) {
      setMsg("✅ Tạo chiến dịch thành công");
      // làm mới danh sách dưới dashboard
      router.refresh();
      // chuyển sang chi tiết nếu muốn:
      // router.push(`/campaigns/${data.campaign.id}`);
      // hoặc reset form:
      setTitle(""); setGoal(""); setDescription(""); setCover("");
    } else {
      setMsg(data?.error || "Tạo chiến dịch thất bại");
    }
    setCreating(false);
  }

  return (
    <div className="rounded-xl border bg-white p-4 space-y-4">
      <h3 className="font-semibold">Tạo chiến dịch mới</h3>

      {/* Upload Ảnh */}
      <form onSubmit={onUpload} className="flex flex-wrap items-center gap-3">
        <input type="file" name="file" accept="image/*" className="border p-2 rounded" />
        <button
          type="submit"
          className="px-3 py-2 rounded bg-rose-600 text-white disabled:opacity-60"
          disabled={uploading}
        >
          {uploading ? "Đang upload..." : "Upload ảnh bìa"}
        </button>
        {cover && <span className="text-xs text-gray-500 break-all">URL: {cover}</span>}
      </form>
      {cover && (
        <img src={cover} alt="cover" className="w-full max-h-56 object-cover rounded border" />
      )}

      {/* Form tạo */}
      <form onSubmit={onCreate} className="grid gap-3">
        <input
          className="border p-2 rounded"
          placeholder="Tiêu đề *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          type="number" min={0}
          placeholder="Mục tiêu (đ) *"
          value={goal}
          onChange={(e) => setGoal(e.target.value ? Number(e.target.value) : "")}
        />
        <textarea
          className="border p-2 rounded"
          rows={3}
          placeholder="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            className="border p-2 rounded"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
          >
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select
            className="border p-2 rounded"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60"
            disabled={creating}
          >
            {creating ? "Đang tạo..." : "Tạo chiến dịch"}
          </button>

          {/* Link sang form nâng cao nếu cần */}
          <a
            href="/admin/campaigns/new"
            className="px-3 py-2 rounded border hover:bg-gray-50"
          >
            Mở form nâng cao
          </a>
        </div>

        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </div>
  );
}
