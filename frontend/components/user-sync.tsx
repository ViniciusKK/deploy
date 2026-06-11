'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { API_BASE } from '@/lib/api';

/**
 * Após o sign-in, registra/atualiza o usuário no banco via backend.
 */
export function UserSync() {
  const { isSignedIn, userId, getToken } = useAuth();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !userId || syncedFor.current === userId) return;
    syncedFor.current = userId;

    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        await fetch(`${API_BASE}/users/sync`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error('Falha ao sincronizar usuário com o backend', error);
        syncedFor.current = null;
      }
    })();
  }, [isSignedIn, userId, getToken]);

  return null;
}
