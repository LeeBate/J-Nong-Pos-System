import type { Metadata } from "next";
import { ModalProvider } from "@/contexts/ModalContext";
import Modal from "@/components/modal";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";

export const metadata: Metadata = {
  title: "POS - JNong",
  description: "ระบบการขายของเจ๊หน่อง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ModalProvider>
            {children}
            <Modal />
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
