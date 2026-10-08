import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig, authCookieOptions } from "@/lib/auth/config";
import { isAdmin } from "@/lib/auth/policy";
export async function middleware(request: NextRequest) {
  const config = authConfig();
  const protectedRoute = request.nextUrl.pathname.startsWith("/internal");
  const loginRedirect = (reason?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = reason ? `?reason=${reason}` : "";
    const redirect = NextResponse.redirect(url);
    for (const cookie of response.cookies.getAll())
      redirect.cookies.set(cookie);
    return redirect;
  };
  let response = NextResponse.next({ request });
  if (!config) return protectedRoute ? loginRedirect("setup") : response;
  const client = createServerClient(config.url, config.key, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        for (const { name, value } of values) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of values)
          response.cookies.set(name, value, options);
      },
    },
  });
  const { data, error } = await client.auth.getUser();
  if (protectedRoute) {
    if (error || !data.user) return loginRedirect();
    if (!isAdmin(data.user)) return loginRedirect("access");
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = { matcher: ["/internal/:path*", "/admin/login"] };
