import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const useAuth = () => {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          method: 'GET',
          credentials: 'include', 
        });

        if (res.ok) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          router.push('/login');
        }
      } catch (error) {
        console.error('Error al verificar la autenticación:', error);
        setAuthenticated(false);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  return { authenticated, loading };
};

export default useAuth;
