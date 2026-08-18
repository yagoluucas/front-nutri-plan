import type { Metadata } from "next";
import Link from "next/link";
import ConfirmEmail from "@/src/features/auth/components/ConfirmEmail";

export const metadata: Metadata = {
    title: "Confirmar e-mail",
    description: "Confirme seu e-mail para concluir o cadastro no Nutri Plan.",
};

export default function ConfirmEmailPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background-subtle p-6">
            <section className="w-full max-w-lg rounded-lg border border-border-default bg-surface-default p-6 shadow-md sm:p-10">
                <Link
                    href="/"
                    className="mb-8 block text-center text-heading-h3 font-bold text-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                >
                    Nutri Plan
                </Link>
                <ConfirmEmail />
            </section>
        </main>
    );
}
