"use client";

import { useState } from "react";

export default function DonateForm({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(false);

async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget as any;

  const data = {
    campaignId,
    amount: Number(form.amount.value || 0),
    name: form.name.value || null,
    message: form.message.value || null,
    isAnonymous: !!form.isAnonymous.checked,
    method: "MANUAL",
  };

  if (!data.amount || data.amount <= 0) {
    alert("❌ Vui lòng nhập số tiền hợp lệ");
    return;
  }

  setLoading(true);
  try {
    // ---- POST /api/donations
    const res = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // ✅ Parse JSON an toàn (tránh 'Unexpected end of JSON input')
    let payload: any = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      try {
        payload = await res.json();
      } catch {
        payload = null; // body rỗng
      }
    } else {
      // nếu server trả text/html khi lỗi
      const text = await res.text().catch(() => "");
      if (text) payload = { error: text };
    }

    if (!res.ok) {
      throw new Error(payload?.error || `Tạo donation thất bại (HTTP ${res.status})`);
    }

    // ---- Đồng bộ tiến độ
    const up = await fetch(`/api/campaigns/${campaignId}/progress`, { method: "POST" });
    if (!up.ok) {
      const t = await up.text().catch(() => "");
      console.warn("Progress sync warning:", t);
    }

    alert("✅ Đã ghi nhận quyên góp!");
    location.reload();
  } catch (err: any) {
    alert(err?.message || "Có lỗi xảy ra khi quyên góp");
  } finally {
    setLoading(false);
  }
}


  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="text"
        name="name"
        placeholder="Tên của bạn"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        type="number"
        name="amount"
        placeholder="Số tiền (VND)"
        className="w-full border px-3 py-2 rounded"
      />
      <textarea
        name="message"
        placeholder="Lời nhắn (tùy chọn)"
        className="w-full border px-3 py-2 rounded"
      />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="isAnonymous" /> Ẩn danh
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-2 rounded disabled:opacity-60"
      >
        {loading ? "Đang xử lý..." : "Quyên góp"}
      </button>
    </form>
  );
}
