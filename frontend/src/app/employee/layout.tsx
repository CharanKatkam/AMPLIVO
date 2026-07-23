import { EmployeeSidebar } from '@/components/employee/EmployeeSidebar';
import { PageTransition } from '@/components/PageTransition';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'employee']}>
      <div className="flex h-screen bg-[#F8FAFC]">
        <EmployeeSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <PageTransition>
            <div className="flex-1 h-full overflow-y-auto">
              {children}
            </div>
          </PageTransition>
        </div>
      </div>
    </ProtectedRoute>
  );
}
