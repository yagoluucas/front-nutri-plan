import AppSidebar from "@/src/components/layout/AppSidebar";
import AuthenticatedQueryProvider from "@/src/components/providers/AuthenticatedQueryProvider";
import { SessionManager } from "@/src/features/auth/components/SessionManager";
import { ProfileProvider } from "@/src/features/profile/ProfileProvider";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AuthenticatedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-dvh overflow-hidden bg-background-page selection:bg-brand-100">
            <AuthenticatedQueryProvider>
                <ProfileProvider>
                    <SessionManager>
                        <div className="flex h-full min-h-0 flex-col md:flex-row">
                            <AppSidebar />
                            <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
                                {children}
                            </main>
                        </div>
                    </SessionManager>
                </ProfileProvider>
            </AuthenticatedQueryProvider>
        </div>
    );
}
