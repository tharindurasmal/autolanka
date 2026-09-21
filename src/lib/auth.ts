import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

const sanitizeUrl = (value: string | undefined) =>
  value?.trim().replace(/^['"]+|['"]+$/g, "") || undefined;

const appUrl = sanitizeUrl(process.env.BETTER_AUTH_URL) ?? sanitizeUrl(process.env.NEXT_PUBLIC_APP_URL);
if (appUrl) {
  process.env.BETTER_AUTH_URL = appUrl;
  process.env.NEXT_PUBLIC_APP_URL = appUrl;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,          // log them in right after registering
  },

  session: {
    expiresIn: 60 * 60 * 24,        // 1 day
  },

  user: {
    additionalFields: {
      phone: { type: "string", required: false, input: true },
      phoneVerified: { type: "boolean", required: false, input: false },
      role:  { type: "string", required: false, input: false },
    },
  },

  // Uncomment once you have Google OAuth credentials:
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  // },

  plugins: [nextCookies()],   // must be LAST in the array
});