import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  (req) => {
    const r = req.nextauth.token?.role, p = req.nextUrl.pathname;
    const need = p.startsWith("/merchant") ? "MERCHANT" : p.startsWith("/courier") ? "COURIER" : p.startsWith("/admin") ? "ADMIN" : null;
    if (need && r !== need) return NextResponse.redirect(new URL("/", req.url));
  },
  { callbacks: { authorized: ({ token }) => !!token }, pages: { signIn: "/login" } }
);
export const config = { matcher: ["/merchant/:path*", "/courier/:path*", "/admin/:path*", "/orders/:path*", "/checkout"] };
