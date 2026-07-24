import { Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

import StoreProvider from "@/app/StoreProvider";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
  title: "Karta. - Shop smarter",
  description: "Karta. - Shop smarter",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        <ClerkProvider>
          <StoreProvider>
            <Toaster />
            {children}
          </StoreProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
