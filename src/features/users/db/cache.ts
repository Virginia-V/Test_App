"use server";

import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export const getUserGlobalTag = async () => {
  return getGlobalTag("users");
};

export const getUserIdTag = async (id: string) => {
  return getIdTag("users", id);
};

export const revalidateUserCache = async (id: string) => {
  revalidateTag(await getUserGlobalTag());
  revalidateTag(await getUserIdTag(id));
};
