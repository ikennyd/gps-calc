export const STORAGE_KEYS = {
  CALC_HISTORY: 'gps_calc_history',
  PLANNING_SCENARIOS: 'gps_planning_scenarios',
  CLIENTS: 'gps_clients',
  METRICS: 'gps_weekly_metrics',
  WINTER_SCENARIOS: 'gps_winter_scenarios',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Utilitário tipado para localStorage
export function getFromStorage<T>(key: StorageKey, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    return parsed as T;
  } catch (e) {
    console.error(`Erro ao carregar ${key}:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: StorageKey, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Erro ao salvar ${key}:`, e);
    return false;
  }
}

export function removeFromStorage(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Erro ao remover ${key}:`, e);
  }
}
