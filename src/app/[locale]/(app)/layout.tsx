import {AppShell} from "@/components/layout/app-shell";
import {requireCompletedOnboarding} from "@/features/onboarding/services/onboarding-service";

export default async function AppLayout({children}: Readonly<{children: React.ReactNode}>) {
  await requireCompletedOnboarding();

  return <AppShell>{children}</AppShell>;
}
