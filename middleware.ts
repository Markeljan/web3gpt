export { auth as middleware } from "@/auth"

export const config = {
  // also gnore opengraph-image.tsx
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
