import {SignIn} from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-background/60 shadow-sm ring-1 ring-border">
          <Image
            alt="Verba logo"
            className="size-full object-contain"
            height={40}
            priority
            src="/brand/verba-logo.png"
            width={40}
          />
        </span>
        <span className="text-xl font-bold">Verba</span>
      </div>
      <SignIn />
    </main>
  );
}
