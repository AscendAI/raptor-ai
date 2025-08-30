import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/server/db";
import { headers } from "next/headers";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: process.env.AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_ROOT_URL!,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
		cookieCache: {
			enabled: true, // Enable caching session in cookie (default: `false`)	
			maxAge: 600 // 10 minutes
		}
  }
});

export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
