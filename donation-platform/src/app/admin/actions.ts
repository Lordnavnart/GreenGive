// src/app/admin/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

/** Thư mục đích để lưu ảnh upload (public => truy cập trực tiếp ở /uploads/...) */
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Chấp nhận tối đa ~5MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024;
/** MIME hợp lệ */
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/** Lưu file upload vào /public/uploads
 *  Trả về đường dẫn PUBLIC (ví dụ: /uploads/xxx.png) hoặc null nếu không có file
 *  Ném lỗi nếu file không hợp lệ
 */
async function saveUploadedImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Ảnh không hợp lệ. Chỉ chấp nhận JPEG/PNG/WebP/GIF.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ảnh quá lớn. Tối đa 5MB.");
  }

  // đảm bảo có thư mục
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // lấy đuôi file từ mime hoặc từ tên
  const extFromMime =
    file.type === "image/jpeg"
      ? ".jpg"
      : file.type === "image/png"
      ? ".png"
      : file.type === "image/webp"
      ? ".webp"
      : file.type === "image/gif"
      ? ".gif"
      : path.extname((file as any).name || "") || ".png";

  const filename = `${Date.now()}-${crypto.randomUUID()}${extFromMime}`;
  const destAbs = path.join(UPLOAD_DIR, filename);

  const buff = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(destAbs, buff);

  // đường dẫn public để gán vào <Image src="/uploads/filename">
  return `/uploads/${filename}`;
}

/** Tạo chiến dịch mới — đọc FormData từ form server action */
export async function createCampaign(formData: FormData) {
  // Lấy field text/number
  const title = String(formData.get("title") || "").trim();
  const goalRaw = String(formData.get("goal") || "").trim();
  const orgId = String(formData.get("orgId") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();

  // Lấy file (tên "coverFile" đúng với input trong page.tsx)
  const coverFile = formData.get("coverFile") as File | null;

  if (!title) throw new Error("Thiếu tiêu đề");
  const goal = Number(goalRaw);
  if (!Number.isFinite(goal) || goal <= 0) throw new Error("Mục tiêu không hợp lệ");
  if (!orgId) throw new Error("Thiếu tổ chức");
  if (!categoryId) throw new Error("Thiếu danh mục");

  // Lưu ảnh nếu có
  let cover: string | null = null;
  if (coverFile && coverFile.size > 0) {
    cover = await saveUploadedImage(coverFile);
  }

  // Tạo campaign
  await prisma.campaign.create({
    data: {
      title,
      goal, // nếu schema là Int/Decimal đều OK, dùng Number
      cover, // có thể là null
      status: "ACTIVE",
      org: { connect: { id: orgId } },
      category: { connect: { id: categoryId } },
    },
  });

  // Revalidate các trang liên quan
  revalidatePath("/admin");
  revalidatePath("/campaigns");
}

/** Xoá chiến dịch theo id (dùng ở bảng quản trị) */
export async function deleteCampaign(id: string) {
  if (!id) return;
  await prisma.campaign.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath("/campaigns");
}
