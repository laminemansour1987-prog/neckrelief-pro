import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Connexion — Aura AI" };

export default function LoginPage() {
  return (
    <div className="px-6 py-20">
      <h1 className="text-center text-3xl font-bold text-white">Connexion</h1>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
      <p className="mt-6 text-center text-sm text-white/50">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-medium text-aura-300 underline">
          Créer un compte gratuit
        </Link>
      </p>
    </div>
  );
}
