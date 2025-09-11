"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName]   = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit() {
    setErr(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ email, name, password })
    }).then(r => r.json());

    if (!res.ok) { setErr(res.error || "Lỗi"); return; }
    router.push("/auth/login");
  }

  return (
    <main className="container mx-auto px-6 py-12 max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Đăng ký</h1>
      <input className="border rounded h-10 px-3 w-full"
        placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border rounded h-10 px-3 w-full"
        placeholder="Tên (không bắt buộc)" value={name} onChange={e=>setName(e.target.value)} />
      <input className="border rounded h-10 px-3 w-full" type="password"
        placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)} />
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <button onClick={submit} className="px-4 h-10 rounded bg-rose-600 text-white">Tạo tài khoản</button>
    </main>
  );
}
