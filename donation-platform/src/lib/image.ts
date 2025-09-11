// src/lib/image.ts
const FALLBACK =
  "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=60";

// Chấp nhận ảnh từ Unsplash/Imgur/Cloudinary/S3... bạn có thể thêm host tại đây
const ALLOWED_HOSTS = [
  "images.unsplash.com",
  "res.cloudinary.com",
  "i.imgur.com",
  "cdn.discordapp.com",
];

export function safeCover(input?: string | null): string {
  if (!input) return FALLBACK;
  try {
    const u = new URL(input);
    if (ALLOWED_HOSTS.includes(u.hostname)) return input;
    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}
