import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Choir",
  description: "Log in to your Choir account",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 