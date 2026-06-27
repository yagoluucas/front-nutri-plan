import Image from "next/image";
import AuthFormsArea from "@/src/features/auth/components/AuthFormsArea";

export default function Login() {
    return (
        <main className="min-h-screen bg-background-page flex flex-col md:flex-row w-full overflow-hidden">
            {/* Left side - Image / Branding (Hidden on very small screens, visible on md and up) */}
            <div className="hidden md:flex flex-1 relative bg-brand-900 overflow-hidden items-center justify-center">
                <Image
                    src="/auth-bg.png"
                    alt="Nutriplan Premium Background"
                    fill
                    className="object-cover opacity-80"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-transparent" />
                
                <div className="relative z-10 p-12 text-center max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h2 className="text-display text-content-inverse mb-4">Nutriplan</h2>
                    <p className="text-body-large text-brand-50">
                        O software definitivo para nutricionistas.
                        Gerencie seus pacientes, crie planos alimentares e escale seu negócio com facilidade.
                    </p>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-y-auto">
                <AuthFormsArea />
            </div>
        </main>
    );
}