import React from "react";
import DietPlanForm from "@/src/features/diet-plan/components/DietPlanForm";
import LogoutButton from "@/src/features/auth/components/LogoutButton";
import { Leaf } from "lucide-react";

export default function PlanoAlimentarPage() {
    return (
        <div className="min-h-screen bg-background-page selection:bg-brand-100 flex flex-col">
            {/* Header */}
            <header className="w-full border-b border-border-subtle bg-surface-default/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-action-primary p-1.5 rounded-lg">
                            <Leaf className="text-white w-5 h-5" />
                        </div>
                        <span className="text-heading-h4 font-bold text-content-primary">Nutri Plan</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-body-small text-content-secondary hidden sm:inline-block">Modo Criação de Plano</span>
                        <div className="w-px h-6 bg-border-subtle hidden sm:block"></div>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full relative">
                <DietPlanForm />
            </main>
        </div>
    );
}
