"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState(false);

  async function submit() {
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ token, password }),
    }).then(r => r.json());

    if (res.ok) { setOk(true); setTimeout(()=>router.push("/auth/login"), 1000); }
  }

  return (
    <main className="container mx-auto px-6 py-12 max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Đặt lại mật khẩu</h1>
      <input className="border rounded h-10 px-3 w-full" type="password"
        placeholder="Mật khẩu mới" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={submit} className="px-4 h-10 rounded bg-rose-600 text-white">Cập nhật</button>
      {ok && <p className="text-green-600 text-sm">Đã đổi mật khẩu!</p>}
    </main>
  );
}
