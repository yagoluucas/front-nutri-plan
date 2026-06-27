import Link from "next/link";
import { ArrowRight, Leaf, Users, Utensils } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background-page selection:bg-brand-100">
      {/* Header */}
      <header className="w-full border-b border-border-subtle bg-surface-default/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-action-primary p-2 rounded-lg">
              <Leaf className="text-white w-6 h-6" />
            </div>
            <span className="text-heading-h3 font-bold text-content-primary">Nutri Plan</span>
          </div>
          
          <nav>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 bg-action-primary h-11 px-6 text-button font-semibold text-action-primary-text hover:bg-action-primary-hover shadow-sm hover:shadow-md"
            >
              Fazer Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Subtle background decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 bg-gradient-to-b from-brand-100 to-transparent rounded-full blur-3xl -z-10" />
          
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-display md:text-5xl lg:text-6xl font-bold text-content-primary tracking-tight max-w-4xl mx-auto leading-tight">
              A evolução no acompanhamento <span className="text-action-primary">nutricional</span> dos seus pacientes.
            </h1>
            <p className="mt-6 text-body-large text-content-secondary max-w-2xl mx-auto">
              Simplifique a criação de planos alimentares, gerencie seus pacientes com facilidade e tenha acesso a um banco de alimentos completo. Feito por nutricionistas, para nutricionistas.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 bg-action-primary h-12 px-8 text-button font-bold text-action-primary-text hover:bg-action-primary-hover shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                Começar agora <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-background-subtle border-t border-border-subtle">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-heading-h2 font-bold text-content-primary">Tudo o que você precisa em um só lugar</h2>
              <p className="text-body-default text-content-secondary mt-2">Foque no que realmente importa: o resultado do seu paciente.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-surface-default p-8 rounded-2xl border border-border-default shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-brand-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Utensils className="w-7 h-7 text-action-primary" />
                </div>
                <h3 className="text-heading-h4 font-bold text-content-primary mb-3">Planos Inteligentes</h3>
                <p className="text-body-default text-content-secondary">
                  Monte planos alimentares de forma ágil com nossa interface intuitiva e cálculo automático de macronutrientes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-surface-default p-8 rounded-2xl border border-border-default shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-brand-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-action-primary" />
                </div>
                <h3 className="text-heading-h4 font-bold text-content-primary mb-3">Gestão de Pacientes</h3>
                <p className="text-body-default text-content-secondary">
                  Acompanhe a evolução de cada paciente, armazene históricos e mantenha o prontuário sempre organizado.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-surface-default p-8 rounded-2xl border border-border-default shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-brand-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Leaf className="w-7 h-7 text-action-primary" />
                </div>
                <h3 className="text-heading-h4 font-bold text-content-primary mb-3">Tabela de Alimentos</h3>
                <p className="text-body-default text-content-secondary">
                  Acesso rápido a uma base de dados rica em alimentos, com medidas caseiras e informações nutricionais confiáveis.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-surface-default py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-body-small text-content-muted">
          &copy; {new Date().getFullYear()} Nutri Plan. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}