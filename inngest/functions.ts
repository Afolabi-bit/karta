import { inngest } from "./client";
import { prisma } from "@/lib/db";

// Inngest fn to sync user data to DB
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-creation",
    name: "Sync User Creation",
    triggers: [{ event: "app/user.created" }],
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

export const syncUserUpdate = inngest.createFunction(
  {
    id: "sync-user-update",
    name: "Sync User Update",
    triggers: [{ event: "app/user.updated" }],
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

export const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-delete",
    name: "Sync User Delete",
    triggers: [{ event: "app/user.deleted" }],
  },
  async ({ event }) => {
    const user = event.data;

    await prisma.user.delete({
      where: { id: user.id },
    });
  },
);
