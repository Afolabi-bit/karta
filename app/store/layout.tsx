import StoreLayout from "@/components/store/StoreLayout";
import { Show, SignIn } from "@clerk/nextjs";
import React from "react";

export const metadata = {
  title: "Karta. - Store Dashboard",
  description: "Karta. - Store Dashboard",
};

export default function RootAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">
        <StoreLayout>{children}</StoreLayout>
      </Show>
      <Show when="signed-out">
        <div className="min-h-screen flex justify-center items-center">
          <SignIn fallbackRedirectUrl={"/store"} />
        </div>
      </Show>
    </>
  );
}
