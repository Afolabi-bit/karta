import AdminLayout from "@/components/admin/AdminLayout";
import { Show, SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "GoCart. - Admin",
  description: "GoCart. - Admin",
};

export default function RootAdminLayout({ children }) {
  return (
    <>
      <Show when="signed-in" asChild>
        <AdminLayout>{children}</AdminLayout>
      </Show>
      <Show when="signed-out" asChild>
        <div className="flex justify-center items-center min-h-screen">
          <SignIn routing="hash" fallbackRedirectUrl="/admin" />
        </div>
      </Show>
    </>
  );
}
