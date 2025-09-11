import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = process.env.AUTH_SECRET!;
const getKey = () => new TextEncoder().encode(SECRET);

async function readSession(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey());
    return payload as any; // { sub, email, role }
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const session = await readSession(req);

  // chặn /profile, /me/*
  if (url.pathname === "/profile" || url.pathname.startsWith("/me")) {
    if (!session) {
      url.pathname = "/auth/login";
      url.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // chặn /admin (chỉ admin)
  if (url.pathname.startsWith("/admin")) {
    if (!session || session.role !== "ADMIN") {
      url.pathname = "/auth/login";
      url.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/me/:path*", "/admin/:path*"],
};
