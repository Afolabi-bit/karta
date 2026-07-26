import { clerkClient } from "@clerk/nextjs/server";

const authAdmin = async (userId: string | null | undefined): Promise<boolean> => {
  try {
    if (!userId) return false;

    const client = await clerkClient();

    const user = await client.users.getUser(userId);

    const adminEmails = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.split(",") : [];
    return adminEmails.includes(
      user.emailAddresses[0]?.emailAddress ?? ""
    );
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default authAdmin;
