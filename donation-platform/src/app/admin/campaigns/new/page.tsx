"use client";

import { useState } from "react";

function VND(n: number) {
  try { return Number(n).toLocaleString("vi-VN") + "đ"; } catch { return String(n); }
}

export default function NewCampaignPage() {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");       // url ảnh sau upload
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem("file") as HTMLInputElement);
    if (!input?.files?.length) return;

    setUploading(true);
    setMsg(null);

    const formData = new FormData();
    formData.append("file", input.files[0]);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok && data.url) {
      setCover(data.url);
      setMsg("Upload ảnh thành công!");
    } else {
      setMsg(data?.error || "Upload thất bại");
    }

    setUploading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title || !goal) {
      setMsg("Vui lòng nhập tiêu đề và mục tiêu.");
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
        cover,            // url ảnh đã upload (nếu có)
        // orgId, categoryId: có thể truyền thêm nếu muốn chọn từ UI
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMsg("✅ Tạo chiến dịch thành công!");
      // chuyển sang trang chi tiết:
      window.location.href = `/campaigns/${data.campaign.id}`;
    } else {
      setMsg(data?.error || "Tạo chiến dịch thất bại");
    }

    setCreating(false);
  }

  return (
    <main className="container mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Tạo chiến dịch mới</h1>

      {/* 1) Upload ảnh bìa */}
      <section className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="font-medium">Ảnh bìa</h2>
        <form onSubmit={handleUpload} className="flex items-center gap-3">
          <input type="file" name="file" accept="image/*" className="border p-2 rounded" />
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 rounded bg-rose-600 text-white disabled:opacity-60"
          >
            {uploading ? "Đang upload..." : "Upload ảnh"}
          </button>
        </form>

        {cover && (
          <div className="mt-3">
            <p className="text-sm text-gray-600">Xem trước:</p>
            {/* Dùng <img> để khỏi cấu hình next/image */}
            <img src={cover} alt="Cover" className="mt-2 w-full max-h-64 object-cover rounded border" />
            <p className="text-xs text-gray-500 mt-1">URL: {cover}</p>
          </div>
        )}
      </section>

      {/* 2) Form thông tin campaign */}
      <section className="rounded-xl border bg-white p-4 space-y-4">
        <h2 className="font-medium">Thông tin chiến dịch</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Tiêu đề</label>
            <input
              className="w-full border rounded p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Cứu trợ miền Trung"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Mục tiêu (VND)</label>
            <input
              className="w-full border rounded p-2"
              type="number"
              min={0}
              value={goal}
              onChange={(e) => setGoal(e.target.value ? Number(e.target.value) : "")}
              placeholder="100000000"
            />
            {!!goal && <p className="text-xs text-gray-500 mt-1">= {VND(Number(goal))}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Mô tả</label>
            <textarea
              className="w-full border rounded p-2"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nội dung kêu gọi, hoàn cảnh..."
            />
          </div>

          {/* Có thể bổ sung dropdown chọn org/category ở đây sau */}
          {/* <select ...> org </select>  <select ...> category </select> */}

          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60"
          >
            {creating ? "Đang tạo..." : "Tạo chiến dịch"}
          </button>
        </form>

        {msg && <p className="text-sm mt-2">{msg}</p>}
      </section>
    </main>
  );
}
