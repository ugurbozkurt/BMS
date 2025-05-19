import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'ANAHTAR';

// Korumalı rotalar
const protectedRoutes = ["/", "/orders", "/customers", "/inventory"];
// Kimlik doğrulama gerektirmeyen rotalar
const publicRoutes = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname, origin } = request.nextUrl;

  // Public route kontrolü
  if (publicRoutes.includes(pathname)) {
    // Eğer kullanıcı giriş yapmışsa ve login/register sayfalarına erişmeye çalışıyorsa
    if (token) {
      try {
        // Login sayfası için özel durum
        if (pathname === '/login' && request.method === 'POST') {
          return NextResponse.next();
        }
        
        jwt.verify(token, JWT_SECRET);
        // Token geçerliyse ana sayfaya yönlendir
        return NextResponse.redirect(new URL("/", origin));
      } catch {
        // Token geçersizse cookie'yi temizle
        const response = NextResponse.next();
        response.cookies.delete("token");
        return response;
      }
    }
    return NextResponse.next();
  }
console.log("Token:", token, "Pathname:", pathname);
  // Korumalı route kontrolü
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      // Token yoksa login sayfasına yönlendir
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }

    try {
      // Token'ı doğrula
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Token geçersizse login sayfasına yönlendir
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }
  
  console.log("Middleware - token:", request.cookies.get("token")?.value, "path:", request.nextUrl.pathname);

  return NextResponse.next();
}

// Middleware'in çalışacağı rotaları belirt
export const config = {
  matcher: [
    /*
      Match all request paths except for the ones starting with:
      - api (API routes)
      - _next/static (static files)
      - _next/image (image optimization files)
      - favicon.ico (favicon file)
    */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};