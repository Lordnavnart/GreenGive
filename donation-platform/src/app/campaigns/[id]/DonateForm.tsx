"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { campaignId: string };

const QUICK = [20000, 50000, 100000, 200000]; // 20k, 50k, 100k, 200k

export default function DonateForm({ campaignId }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(50000);
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!amount || amount < 1000) {
      alert("Số tiền tối thiểu là 1.000đ");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          amount,
          anonymous,
          message: message.trim() || null,
          method: "MANUAL", // sau này đổi thành 'MOMO', 'VNPAY', ...
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Lỗi ${res.status}`);
      }

      // OK
      alert("Cảm ơn bạn đã ủng hộ ❤️");
      setMessage("");
      setAnonymous(false);
      // làm mới dữ liệu server (danh sách ủng hộ, tổng tiền)
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Nút số tiền nhanh */}
      <div className="flex flex-wrap gap-2">
        {QUICK.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAmount(v)}
            className={`px-3 py-1.5 rounded border text-sm ${
              amount === v
                ? "bg-rose-600 text-white border-rose-600"
                : "hover:bg-gray-50"
            }`}
          >
            {v.toLocaleString("vi-VN")}đ
          </button>
        ))}
      </div>

      {/* Ô nhập tiền */}
      <input
        type="number"
        min={1000}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full h-9 px-3 rounded border outline-none focus:ring-2 focus:ring-rose-200"
        placeholder="Nhập số tiền (đ)"
      />

      {/* Lời nhắn */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 rounded border outline-none focus:ring-2 focus:ring-rose-200 text-sm"
        placeholder="Lời nhắn (không bắt buộc)"
      />

      {/* Ẩn danh */}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        Ủng hộ ẩn danh
      </label>

      {/* Nút submit */}
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="w-full h-9 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
      >
        {loading ? "Đang xử lý..." : "Ủng hộ ngay"}
      </button>
    </div>
  );
}
