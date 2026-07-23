import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex h-screen overflow-hidden bg-[#F1F5F9]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
