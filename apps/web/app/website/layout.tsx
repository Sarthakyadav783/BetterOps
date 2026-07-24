import AuthGuard from "@/components/AuthGuard";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
