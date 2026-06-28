import { NextRequest, NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE_NAME, DEFAULT_AUTH_REDIRECT, LOGIN_ROUTE } from "@/src/features/auth/constants";

// Rotas que requerem autenticação (grupo (app))
const PROTECTED_PREFIXES = ["/pacientes", "/dashboard", "/meu-perfil", "/plano"];

// Rotas que não devem ser acessadas se já estiver logado
const AUTH_ONLY_ROUTES = [LOGIN_ROUTE];

function isProtected(pathname: string) {
    return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthOnly(pathname: string) {
    return AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;

    // Usuário autenticado tentando acessar página de login → redireciona para home
    if (token && isAuthOnly(pathname)) {
        return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, request.url));
    }

    // Usuário não autenticado tentando acessar rota protegida → redireciona para login
    if (!token && isProtected(pathname)) {
        const loginUrl = new URL(LOGIN_ROUTE, request.url);
        loginUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Aplica o middleware em todas as rotas exceto:
         * - _next/static (arquivos estáticos)
         * - _next/image (otimização de imagens)
         * - favicon.ico
         * - Arquivos públicos com extensão (ex: .png, .svg)
         * - Rotas de API internas (/api/*)
         */
        "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
