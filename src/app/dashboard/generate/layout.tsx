import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Generator | Choir",
  description: "Generate high-quality content in your unique brand voice",
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 