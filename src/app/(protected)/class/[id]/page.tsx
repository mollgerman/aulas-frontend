
import { cookies } from 'next/headers';
import ClassPage from './ClassPage.client';

export default async function Dashboard() {
  // Access cookies using Next.js's cookies function
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value || null;

  
  return (
    <>
      {role !== null && <ClassPage userRole={role as string} />}
    </>
  );
}