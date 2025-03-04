import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Choir",
  description: "Create your Choir account",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 