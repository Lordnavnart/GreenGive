"use client";

import { useState } from "react";

export default function UploadPage() {
  const [url, setUrl] = useState("");

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fileInput = e.currentTarget.file as HTMLInputElement;

    if (!fileInput?.files?.length) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUrl(data.url); // hiển thị ảnh sau khi upload
  }

  return (
    <main className="p-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold">Upload ảnh</h1>
      <form onSubmit={handleUpload} className="space-y-3">
        <input type="file" name="file" className="border p-2" />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Upload
        </button>
      </form>

      {url && (
        <div>
          <p>Ảnh đã upload:</p>
          <img src={url} alt="Uploaded" className="mt-2 border rounded" />
        </div>
      )}
    </main>
  );
}
