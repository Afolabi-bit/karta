import prisma from "@/lib/db";

const authSeller = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: true,
      },
    });

    console.log(user);

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
