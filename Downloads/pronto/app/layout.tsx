import "./globals.css";
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Logo from "@/components/Logo";
import { CartLink, SignOut } from "@/components/Bits";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });
export const metadata: Metadata = { title: "PRONTO | توصيلك، أولويتنا" };
const HOME: Record<string, [string, string]> = {
  CUSTOMER: ["/orders", "طلباتي"], MERCHANT: ["/merchant", "لوحة المتجر"], COURIER: ["/courier", "لوحة المندوب"], ADMIN: ["/admin", "الإدارة"],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const u = (await getServerSession(authOptions))?.user as any;
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} bg-neutral-50 font-sans text-black`}>
        <header className="bg-black text-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/"><Logo /></Link>
            <div className="flex items-center gap-4 text-sm font-semibold">
              {u ? (<><Link href={HOME[u.role][0]}>{HOME[u.role][1]}</Link><SignOut /></>) : (<><Link href="/login">دخول</Link><Link href="/register" className="btn">حساب جديد</Link></>)}
              {(!u || u.role === "CUSTOMER") && <CartLink />}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
