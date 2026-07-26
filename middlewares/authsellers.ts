import prisma from "@/lib/db";

const authSeller = async (userId: string | null | undefined): Promise<string | false> => {
  try {
    if (!userId) return false;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: true,
      },
    });

    if (user?.store) {
      if (user.store.status === "approved") return user.store.id;
      else return false;
    }

    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default authSeller;
