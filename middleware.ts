export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.(?:png|json|jpg|jpeg|gif|svg|ico|css|js)$).*)"]
}
