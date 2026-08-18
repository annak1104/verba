import {redirectIfOnboarded} from "@/features/onboarding/services/onboarding-service";
import {OnboardingForm} from "@/features/onboarding/components/onboarding-form";

export default async function OnboardingPage() {
  await redirectIfOnboarded();

  return (
    <main className="safe-px grid min-h-screen place-items-center py-[max(1rem,env(safe-area-inset-top))]">
      <div className="w-full max-w-xl">
        <OnboardingForm />
      </div>
    </main>
  );
}
