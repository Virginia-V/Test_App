import { routing } from "@/i18n/routing";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)"
};
