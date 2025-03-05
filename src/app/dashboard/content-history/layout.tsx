import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content History | Choir",
  description: "View and manage your previously generated content",
};

export default function ContentHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 