import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getUserSubscription() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true, stripeCustomerId: true },
  });

  return user;
}

export async function isSubscribed(): Promise<boolean> {
  const user = await getUserSubscription();
  return user?.subscriptionStatus === "active";
}

export async function getRecordCount(userId: string): Promise<number> {
  return prisma.record.count({ where: { userId } });
}
