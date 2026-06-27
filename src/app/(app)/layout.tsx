import AppSidebar from "@/src/components/layout/AppSidebar";

export default function AuthenticatedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-background-page selection:bg-brand-100">
            <div className="flex min-h-screen">
                <AppSidebar />
                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}
