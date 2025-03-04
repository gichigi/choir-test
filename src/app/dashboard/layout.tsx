import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Choir",
  description: "Manage your AI content generation with Choir",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 