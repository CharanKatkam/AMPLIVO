import { SalesSidebar } from '@/components/sales/SalesSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/Toaster';

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'sales']}>
      <div className="flex h-screen overflow-hidden bg-[#F1F5F9]">
        <SalesSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
