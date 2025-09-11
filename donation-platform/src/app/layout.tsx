import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GreenGive",
  description: "Nền tảng quyên góp cộng đồng",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="bg-white shadow">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-green-600">🌱 GreenGive</h1>
            <nav className="space-x-6 text-sm font-medium">
              <a href="/" className="hover:text-green-600">Trang chủ</a>
              <a href="/about" className="hover:text-green-600">Về chúng tôi</a>
              <a href="/campaigns" className="hover:text-green-600">Chiến dịch</a>
              <a href="/login" className="px-3 py-1 rounded bg-green-600 text-white">Đăng nhập</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-white border-t mt-12">
          <div className="container mx-auto px-6 py-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} GreenGive. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
