import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    const isLoginPage = pathname === "/admin/login"
    const isAdminRoute = pathname.startsWith("/admin")
    
    // Allow access to login page without authentication
    if (isLoginPage) {
      return NextResponse.next()
    }
    
    // Protect other admin routes
    if (isAdminRoute && !token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        const isLoginPage = pathname === "/admin/login"
        const isAdminRoute = pathname.startsWith("/admin")
        
        // Allow login page without token
        if (isLoginPage) {
          return true
        }
        
        // Require token for other admin routes
        if (isAdminRoute) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"],
}

