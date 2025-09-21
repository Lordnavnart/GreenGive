"use client";

import Link from "next/link";
import { useState } from "react";

export default function ActionsCell({ id }: { id: string }) {
  const [busy, setBusy] = useState<"close" | "delete" | null>(null);

  async function handleClose() {
    if (!confirm("Đóng chiến dịch này?")) return;
    try {
      setBusy("close");
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      if (!res.ok) throw new Error(await res.text());
      location.reload();
    } catch (e: any) {
      alert("Lỗi đóng chiến dịch: " + e.message);
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Xoá vĩnh viễn chiến dịch này?")) return;
    try {
      setBusy("delete");
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      location.reload();
    } catch (e: any) {
      alert("Lỗi xoá chiến dịch: " + e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-x-2">
      <Link href={`/campaigns/${id}`} className="px-2 py-1 border rounded text-blue-600">
        Xem
      </Link>
      <Link href={`/admin/campaigns/${id}`} className="px-2 py-1 border rounded text-green-600">
        Sửa
      </Link>
      <button
        onClick={handleClose}
        disabled={busy !== null}
        className="px-2 py-1 border rounded text-yellow-600 disabled:opacity-60"
      >
        {busy === "close" ? "Đang đóng..." : "Đóng"}
      </button>
      <button
        onClick={handleDelete}
        disabled={busy !== null}
        className="px-2 py-1 border rounded text-red-600 disabled:opacity-60"
      >
        {busy === "delete" ? "Đang xoá..." : "Xoá"}
      </button>
    </div>
  );
}
