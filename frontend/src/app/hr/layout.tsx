import { HRSidebar } from '@/components/hr/HRSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HR Portal | Amplivo',
};

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'hr']}>
      <div className="flex h-screen overflow-hidden bg-[#F1F5F9]">
        <HRSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
