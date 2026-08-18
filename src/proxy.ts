import {clerkMiddleware} from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import {routing} from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutePattern =
  /^\/(?:(?:en|uk)\/)?(?:today|learn|review|words|decks|stats|settings|onboarding)(?:\/|$)/;

export default clerkMiddleware(async (auth, request) => {
  if (protectedRoutePattern.test(request.nextUrl.pathname)) {
    await auth.protect();
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)"
  ]
};
