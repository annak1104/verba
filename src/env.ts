import "server-only";

import { z } from "zod";

const rawNodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = rawNodeEnv === "production";

const booleanEnvSchema = z
  .preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
    z.enum(["true", "false"]).catch("false")
  )
  .transform((value) => value === "true");

const optionalEnvString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().url(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
      .string()
      .min(1)
      .default("pk_test_placeholder"),
    CLERK_SECRET_KEY: z.string().min(1).default("sk_test_placeholder"),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z
      .string()
      .default("/onboarding"),
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z
      .string()
      .default("/onboarding"),
    AI_ENABLED: booleanEnvSchema.default(false),
    AI_PROVIDER: z.string().trim().default("openrouter"),
    OPENROUTER_API_KEY: optionalEnvString,
    OPENROUTER_MODEL: z.string().trim().min(1).default("dots-studio/dots-3-note-preview:free"),
  })
  .superRefine((value, ctx) => {
    if (!isProduction) {
      return;
    }

    if (value.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "pk_test_placeholder") {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
        message: "Set a real Clerk publishable key in production.",
      });
    }

    if (value.CLERK_SECRET_KEY === "sk_test_placeholder") {
      ctx.addIssue({
        code: "custom",
        path: ["CLERK_SECRET_KEY"],
        message: "Set a real Clerk secret key in production.",
      });
    }
  });

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
  AI_ENABLED: process.env.AI_ENABLED,
  AI_PROVIDER: process.env.AI_PROVIDER,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
});

export type Env = typeof env;
