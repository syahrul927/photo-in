import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./server/auth";
import { LOGIN_ROUTE, PUBLIC_ROUTES, ROOT } from "./lib/routes";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const session = await auth();
  const isAuthenticated = !!session?.user;

  const isLoginRoute = nextUrl.pathname.startsWith(LOGIN_ROUTE);
  console.log("pathname", nextUrl.pathname);
  if (isAuthenticated && isLoginRoute) {
    return NextResponse.redirect(new URL(ROOT, request.url));
  }
  const isPublicRoute = PUBLIC_ROUTES.find((route) => {
    return nextUrl.pathname.startsWith(route);
  });
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  }
}

export const config = {
  matcher:
    "/((?!api|_next/static|_next/*.png|_next/*.jpg|logowhite.ico|logowhite.png|_next/image|images|manifest.json|sw.js).*)",
};
