// app/(main)/layout.tsx
import Sidebar from "@/components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen ">
      {/* Sidebar is fixed here */}
      <Sidebar />

      {/* The pages (Rooms, Dashboard, etc.) render here */}
      <main className="flex-1 overflow-y-auto p-5   border border-slate-100 ">
        {children}
      </main>
    </div>
  );
}