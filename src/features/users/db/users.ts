import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateUserCache } from "./cache";

export const insertUser = async (data: typeof UserTable.$inferInsert) => {
  const [newUser] = await db
    .insert(UserTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [UserTable.clerkUserId],
      set: data
    });

  if (newUser == null) throw new Error("Failed to create user");
  revalidateUserCache(String(newUser.id));

  return newUser;
};

export const updateUser = async (
  { clerkUserId }: { clerkUserId: string },
  data: Partial<typeof UserTable.$inferInsert>
) => {
  const [updatedUser] = await db
    .update(UserTable)
    .set(data)
    .where(eq(UserTable.clerkUserId, clerkUserId))
    .returning();

  if (updatedUser == null) throw new Error("Failed to update user");
  revalidateUserCache(String(updatedUser.id));

  return updatedUser;
};

export const deleteUser = async ({ clerkUserId }: { clerkUserId: string }) => {
  const [deletedUser] = await db
    .update(UserTable)
    .set({
      deletedAt: new Date(),
      email: "redacted@deleted.com",
      name: "Deleted User",
      clerkUserId: "deleted",
      imageUrl: null
    })
    .where(eq(UserTable.clerkUserId, clerkUserId))
    .returning();

  if (deletedUser == null) throw new Error("Failed to delete user");
  revalidateUserCache(String(deletedUser.id));

  return deletedUser;
};
