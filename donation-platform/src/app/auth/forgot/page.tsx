"use client";
import { useState } from "react";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);

  async function submit() {
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ email }),
    }).then(r => r.json());
    setLink(res.resetLink || null);
  }

  return (
    <main className="container mx-auto px-6 py-12 max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Quên mật khẩu</h1>
      <input className="border rounded h-10 px-3 w-full"
        placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <button onClick={submit} className="px-4 h-10 rounded bg-rose-600 text-white">Gửi liên kết</button>
      {link && <p className="text-sm">Link reset (dev): <a className="text-rose-600 underline" href={link}>{link}</a></p>}
    </main>
  );
}
