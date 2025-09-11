"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (d?.ok) { setUser(d.user); setName(d.user.name || ""); }
    });
  }, []);

  async function saveProfile() {
    setMsg("");
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ name }),
    }).then(r => r.json());
    setMsg(res.ok ? "Đã lưu" : res.error || "Lỗi");
  }

  async function changePassword() {
    setMsg("");
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    }).then(r => r.json());
    setMsg(res.ok ? "Đã đổi mật khẩu" : res.error || "Lỗi");
    setCurrent(""); setNew("");
  }

  if (!user) return <main className="container mx-auto px-6 py-12">Đang tải…</main>;

  return (
    <main className="container mx-auto px-6 py-12 space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Hồ sơ cá nhân</h1>

      <div className="space-y-2">
        <div className="text-sm text-gray-600">Email: {user.email}</div>
        <input className="border rounded h-10 px-3 w-full"
          placeholder="Tên hiển thị" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={saveProfile} className="px-4 h-10 rounded bg-rose-600 text-white">Lưu</button>
      </div>

      <div className="space-y-2">
        <h2 className="font-medium">Đổi mật khẩu</h2>
        <input className="border rounded h-10 px-3 w-full" type="password"
          placeholder="Mật khẩu hiện tại" value={currentPassword} onChange={e=>setCurrent(e.target.value)} />
        <input className="border rounded h-10 px-3 w-full" type="password"
          placeholder="Mật khẩu mới" value={newPassword} onChange={e=>setNew(e.target.value)} />
        <button onClick={changePassword} className="px-4 h-10 rounded bg-rose-600 text-white">Đổi mật khẩu</button>
      </div>

      {msg && <p className="text-sm">{msg}</p>}
      <form action="/api/auth/logout" method="post">
        <button className="px-3 py-2 border rounded">Đăng xuất</button>
      </form>
    </main>
  );
}
