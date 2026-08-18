import {auth} from "@clerk/nextjs/server";

export async function requireAuthUserId() {
  const {userId} = await auth.protect();
  return userId;
}

export async function syncInternalUser(userId: string, email?: string) {
  const {UserRepository} = await import("@/features/auth/repositories/user-repository");

  return new UserRepository().upsert({
    clerkUserId: userId,
    ...(email ? {email} : {})
  });
}
