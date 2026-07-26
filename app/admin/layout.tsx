import AdminLayout from "@/components/admin/AdminLayout";
import { Show, SignIn } from "@clerk/nextjs";
import React from "react";

export const metadata = {
  title: "Karta. - Admin",
  description: "Karta. - Admin",
};

export default function RootAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">
        <AdminLayout>{children}</AdminLayout>
      </Show>
      <Show when="signed-out">
        <div className="flex justify-center items-center min-h-screen">
          <SignIn routing="hash" fallbackRedirectUrl="/admin" />
        </div>
      </Show>
    </>
  );
}
