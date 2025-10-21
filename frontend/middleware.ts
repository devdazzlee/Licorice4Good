import { NextRequest, NextResponse } from "next/server";

// Only dashboard requires authentication - everything else is public
const ADMIN_ONLY_PATHS = ["/dashboard"];

// Helper to check if path matches any in a list
function matchesPath(path: string, patterns: string[]) {
  return patterns.some((pattern) => path.startsWith(pattern));
}

// JWT verification is handled by the backend API
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Get authentication token from cookies
  const rawToken =
    req.cookies.get("token")?.value ||
    req.cookies.get("auth_token")?.value ||
    req.cookies.get("jwt")?.value ||
    req.cookies.get("accessToken")?.value;
  
  // Check for presence of auth cookie - let client-side handle validation
  const hasAuthCookie = !!rawToken;
  
  // Clear expired cookies by checking if they're malformed
  if (rawToken && rawToken.length < 10) {
    // Token seems invalid, clear it
    const response = NextResponse.next();
    response.cookies.delete("token");
    return response;
  }

  // Only protect dashboard/admin routes - require authentication
  if (matchesPath(pathname, ADMIN_ONLY_PATHS)) {
    if (!hasAuthCookie) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // Allow all other requests (cart, checkout, orders, etc. are now public)
  return NextResponse.next();
}

// Apply middleware to all routes except static, _next, and api
export const config = {
  matcher: ["/((?!_next|favicon.ico|api|public).*)"],
};
