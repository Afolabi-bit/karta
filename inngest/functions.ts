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
    const { data } = event;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0].email_address,
        name: data.first_name + " " + data.last_name,
        image: data.image_url,
      },
    });
  },
);

export const syncUserUpdate = inngest.createFunction(
  {
    id: "sync-user-update",
    name: "Sync User Update",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: { id: data.id },
      data: {
        name: data.first_name + " " + data.last_name,
        image: data.image_url,
        email: data.email_addresses[0].email_address,
      },
    });
  },
);

export const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-delete",
    name: "Sync User Delete",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: { id: data.id },
    });
  },
);
