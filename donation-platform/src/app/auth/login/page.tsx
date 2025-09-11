"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  async function submit() {
    setErr(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json());

    if (!res.ok) { setErr(res.error || "Lỗi"); return; }
    router.push(next);
  }

  return (
    <main className="container mx-auto px-6 py-12 max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Đăng nhập</h1>
      <input className="border rounded h-10 px-3 w-full"
        placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border rounded h-10 px-3 w-full" type="password"
        placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)} />
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <div className="flex gap-3">
        <button onClick={submit} className="px-4 h-10 rounded bg-rose-600 text-white">Đăng nhập</button>
        <a href="/auth/forgot" className="text-sm text-rose-600 hover:underline">Quên mật khẩu?</a>
      </div>
    </main>
  );
}
