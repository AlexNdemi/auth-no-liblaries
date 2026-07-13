import { NextResponse, type NextRequest } from "next/server"
import {
  getUserFromSession,
  updateUserSessionExpiration,
} from "./auth/core/session"

const privateRoutes = ["/private","/dashboard"]
const adminRoutes = ["/admin"]

export async function proxy(request: NextRequest) {
  const response = (await middlewareAuth(request)) ?? NextResponse.next()

  if (request.nextUrl.pathname.startsWith("/api/trpc")) {
    return NextResponse.next()
  }
  await updateUserSessionExpiration({
    set: (key, value, options) => {
      response.cookies.set({ ...options, name: key, value })
    },
    get: key => request.cookies.get(key),
  })

  return response
}

async function middlewareAuth(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if current path matches or starts with any private route
  const isPrivateRoute = privateRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
  
  if (isPrivateRoute) {
    const user = await getUserFromSession(request.cookies)
    if (user == null) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }
  }

  // Check if current path matches or starts with any admin route
  const isAdminRoute = adminRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))

  if (isAdminRoute) {
    const user = await getUserFromSession(request.cookies)
    if (user == null) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
}
