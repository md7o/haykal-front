import { RecoveryPasswordProvider } from "@/lib/context/RecoveryPasswordContext";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <RecoveryPasswordProvider>{children}</RecoveryPasswordProvider>;
}
