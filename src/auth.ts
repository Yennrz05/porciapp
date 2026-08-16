import type { Profile } from '@/types';
export const ACCESS_KEY = 'porcigestion2026';

const PROFILE_KEY = 'porciapp_profile_v1';

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Profile;
    if (typeof parsed.nombre !== 'string' || typeof parsed.desbloqueado !== 'boolean') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage no disponible: se ignora
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    // localStorage no disponible: se ignora
  }
}

export function verificarClave(clave: string): boolean {
  return clave.trim() === ACCESS_KEY;
}
