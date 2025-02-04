
import { cookies } from 'next/headers';
import { StudentClasses } from '@/components/student-classes';
import PendingAssignments from '@/components/pending-assignments';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';

export default async function Dashboard() {
  // Access cookies using Next.js's cookies function
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value || null;

  return (
    <TooltipProvider>
      <div className="container mx-auto mt-10 px-4 py-8">
        <div className="flex flex-col md:flex-col gap-6">
          <div className="flex-1">
            {role !== null && (
              <StudentClasses userRole={role}/> )
              }
          </div>
          <div className="flex-1">
            {/* Show PendingAssignments only if role is NOT TEACHER */}
            {role !== "TEACHER" && <PendingAssignments />}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}