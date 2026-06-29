import AppSidebar from "@/src/components/layout/AppSidebar";
import { LocalStoreProvider } from "@/src/features/local-store/LocalStoreProvider";

export default function AuthenticatedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-dvh overflow-hidden bg-background-page selection:bg-brand-100">
            <LocalStoreProvider>
                <div className="flex h-full min-h-0">
                    <AppSidebar />
                    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
                </div>
            </LocalStoreProvider>
        </div>
    );
}
