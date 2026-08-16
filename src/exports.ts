export const LAST_BACKUP_KEY = 'porciapp_last_backup_v1';

/** Fecha ISO del último respaldo JSON descargado, o null si nunca se hizo. */
export function getLastBackup(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY);
}

/** Registra el momento actual como fecha del último respaldo JSON. */
export function setLastBackup(): void {
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}
