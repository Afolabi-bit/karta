import { inngest } from "./client";
import { prisma } from "@/lib/db";

// Inngest fn to sync user data to DB
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-creation",
    name: "Sync User Creation",
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
    const user = event.data;

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email_addresses?.[0]?.email_address ?? "",
        name: ((user.first_name ?? "") + " " + (user.last_name ?? "")).trim(),
        image: user.image_url ?? "",
      },
    });
  },
);

// Inngest fn to update user data in DB

export const syncUserUpdate = inngest.createFunction(
  {
    id: "sync-user-update",
    name: "Sync User Update",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    const user = event.data;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: ((user.first_name ?? "") + " " + (user.last_name ?? "")).trim(),
        image: user.image_url ?? "",
        email: user.email_addresses?.[0]?.email_address ?? "",
      },
    });
  },
);

// Inngest fn to delete user data from DB
export const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-delete",
    name: "Sync User Delete",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const user = event.data;

    await prisma.user.delete({
      where: { id: user.id },
    });
  },
);

// Inngest fn to delete coupon from DB

export const deleteCouponOnExpiry = inngest.createFunction(
  {
    id: "delete-coupon-on-expiry",
    name: "Delete Coupon On Expiry",
    triggers: [{ event: "app/coupon.expired" }],
  },
  async ({ event, step }) => {
    const { data } = event;

    const expiryDate = new Date(data.expires_at);

    await step.sleepUntil("wait-for-expiry", expiryDate);
    await step.run("delete-coupon-from-database", async () => {
      await prisma.coupon.delete({
        where: { code: data.code },
      });
    });

    return { success: true };
  },
);
