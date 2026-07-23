import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Créer un compte — Aura AI" };

export default function SignupPage() {
  return (
    <div className="px-6 py-20">
      <h1 className="text-center text-3xl font-bold text-white">Créer un compte</h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-sm text-white/50">
        Gratuit, sans carte bancaire. Passez à Plus ou Pro quand vous voulez.
      </p>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
      <p className="mt-6 text-center text-sm text-white/50">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-aura-300 underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
