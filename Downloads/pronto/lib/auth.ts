import { NextAuthOptions, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { db } from "./db";

// Email + password, or phone + OTP (dev OTP from env; swap in an SMS provider for production).
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { identifier: {}, secret: {} },
      async authorize(c) {
        const id = c?.identifier?.trim(), secret = c?.secret;
        if (!id || !secret) return null;
        const byEmail = id.includes("@");
        const u = await db.user.findUnique({ where: byEmail ? { email: id.toLowerCase() } : { phone: id } });
        if (!u) return null;
        const ok = byEmail ? !!u.password && (await bcrypt.compare(secret, u.password)) : secret === (process.env.DEV_OTP ?? "123456");
        return ok ? ({ id: u.id, name: u.name, role: u.role } as any) : null;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => { if (user) { token.id = user.id; token.role = (user as any).role; } return token; },
    session: ({ session, token }) => { (session.user as any).id = token.id; (session.user as any).role = token.role; return session; },
  },
};

export async function me() {
  const s = await getServerSession(authOptions);
  const id = (s?.user as any)?.id as string | undefined;
  return id ? db.user.findUnique({ where: { id } }) : null;
}
// Role is always checked against the database, never only the JWT.
export async function requireRole(role: Role) {
  const u = await me();
  if (!u) redirect("/login");
  if (u.role !== role) redirect("/");
  if (!u.approved) redirect("/pending");
  return u;
}
