import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/Toaster';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['client']}>
      <div className="flex h-screen overflow-hidden bg-[#F1F5F9]">
        <PortalSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
