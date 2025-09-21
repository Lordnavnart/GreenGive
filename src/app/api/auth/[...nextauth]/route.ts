import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email || "").toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await compare(String(creds?.password || ""), user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? "", role: user.role };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) { if (user) { token.role = (user as any).role; token.sub = (user as any).id; } return token as any; },
    async session({ session, token }) { (session as any).user.id = token.sub; (session as any).user.role = token.role; return session; },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
