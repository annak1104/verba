import {eq} from "drizzle-orm";
import {db} from "@/db/client";
import {users} from "@/db/schema";

export type UpsertUserInput = {
  clerkUserId: string;
  email?: string;
};

export class UserRepository {
  async upsert(input: UpsertUserInput) {
    const [row] = await db
      .insert(users)
      .values({
        clerkUserId: input.clerkUserId,
        email: input.email
      })
      .onConflictDoUpdate({
        target: users.clerkUserId,
        set: {
          ...(input.email ? {email: input.email} : {}),
          updatedAt: new Date()
        }
      })
      .returning();

    if (!row) {
      throw new Error("Failed to upsert user.");
    }

    return row;
  }

  async getByClerkUserId(clerkUserId: string) {
    return db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId)
    });
  }
}
