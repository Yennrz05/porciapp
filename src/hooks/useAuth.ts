import { useState, useCallback } from 'react';
import type { Profile } from '@/types';
import { loadProfile, saveProfile, clearProfile, verificarClave } from '@/auth';

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());

  const desbloquear = useCallback((nombre: string, clave: string): boolean => {
    if (!verificarClave(clave)) return false;
    const next: Profile = { nombre: nombre.trim(), desbloqueado: true };
    saveProfile(next);
    setProfile(next);
    return true;
  }, []);

  const bloquear = useCallback(() => {
    clearProfile();
    setProfile(null);
  }, []);

  const cambiarNombre = useCallback((nombre: string) => {
    const next: Profile = { nombre: nombre.trim(), desbloqueado: true };
    saveProfile(next);
    setProfile(next);
  }, []);

  return {
    profile,
    desbloquear,
    bloquear,
    cambiarNombre,
  };
}

export type AuthHook = ReturnType<typeof useAuth>;
