import type { Lote, FaseConsumo, Config, LoteCalculado, AppData } from '@/types';

export const STORAGE_KEY = 'porciapp_data_v1';
export const APP_VERSION = '1.1.0';

// Sin fases predeterminadas: la persona crea las suyas en "Consumo".
// Las fases creadas se guardan junto a los lotes y config en el respaldo JSON.
export const DEFAULT_FASES: FaseConsumo[] = [];

export const DEFAULT_CONFIG: Config = {
  pesoPorBache: 2700,
};

export function getDefaultData(): AppData {
  return {
    lotes: [],
    fases: DEFAULT_FASES,
    config: DEFAULT_CONFIG,
    version: APP_VERSION,
  };
}

/**
 * Semana del año (1-53) según el estándar ISO: las semanas van de lunes a
 * domingo y la semana 1 es la que contiene el primer jueves del año.
 */
export function getWeekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // lunes = 1 ... domingo = 7
  const day = d.getUTCDay() || 7;
  // Jueves de la semana actual
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Semana actual del año (se calcula sola, sin introducirla en el formulario). */
export function getCurrentWeek(): number {
  return getWeekOfYear(new Date());
}

/**
 * Rango de fechas (lun-dom) que abarca una semana del año, siguiendo el
 * mismo criterio ISO que getWeekOfYear.
 */
export function getSemanaRango(semana: number, anio = new Date().getFullYear()) {
  // El 4 de enero siempre está en la semana 1; a partir de él hallamos su lunes.
  const enero4 = new Date(anio, 0, 4);
  const day = enero4.getDay() || 7; // lunes = 1 ... domingo = 7
  const inicio = new Date(anio, 0, 4 - day + 1);
  inicio.setDate(inicio.getDate() + (semana - 1) * 7);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return { inicio: fmt(inicio), fin: fmt(fin) };
}

/**
 * Determina la fase de consumo según la edad del lote (en semanas de vida).
 * La fase se asigna automáticamente: no se elige a mano para evitar errores.
 * Solo se asigna si la edad cae dentro del rango [semanaInicio, semanaFin] de
 * alguna fase; si no coincide con ninguna, el lote queda "Sin fase".
 */
export function faseParaEdad(
  edadSemanas: number,
  fases: FaseConsumo[]
): FaseConsumo | undefined {
  if (fases.length === 0) return undefined;
  const edad = Math.max(1, edadSemanas);
  return fases.find((f) => edad >= f.semanaInicio && edad <= f.semanaFin);
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw) as AppData;
    return {
      lotes: parsed.lotes ?? [],
      fases: parsed.fases ?? [],
      config: { ...DEFAULT_CONFIG, ...parsed.config },
      version: APP_VERSION,
    };
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function calcularLote(
  lote: Lote,
  fases: FaseConsumo[],
  config: Config
): LoteCalculado {
  const semanaActual = getCurrentWeek();
  // Edad del lote = semana actual del año - semana de llegada
  const edadSemanas = Math.max(0, semanaActual - lote.semanaIngreso);

  const fase = faseParaEdad(edadSemanas, fases);
  const faseNombre = fase?.nombre ?? 'Sin fase';
  const consumoDiarioKg = fase?.consumoDiarioKg ?? 0;

  // Proyección semanal = consumo diario x 7 x número de animales
  const consumoSemanalKg = consumoDiarioKg * 7 * lote.numAnimales;
  const requerimientoSemanalKg = consumoSemanalKg;

  // Déficit = requerimiento semanal - inventario actual en almacén
  const deficitKg = requerimientoSemanalKg - lote.inventarioKg;

  // Baches = déficit / peso por bache (redondeado hacia arriba)
  const bachesAPedir =
    deficitKg > 0 && config.pesoPorBache > 0
      ? Math.ceil(deficitKg / config.pesoPorBache)
      : 0;

  let estado: 'ok' | 'warning' | 'danger' = 'ok';
  if (deficitKg > 0) {
    estado = bachesAPedir >= 2 ? 'danger' : 'warning';
  }

  return {
    ...lote,
    semanaActual,
    edadSemanas,
    faseId: fase?.id ?? '',
    faseNombre,
    consumoDiarioKg,
    consumoSemanalKg,
    requerimientoSemanalKg,
    deficitKg,
    bachesAPedir,
    estado,
  };
}

export function calcularTodos(
  lotes: Lote[],
  fases: FaseConsumo[],
  config: Config
): LoteCalculado[] {
  return lotes.map((l) => calcularLote(l, fases, config));
}

export function formatNumber(n: number, decimals = 0): string {
  if (!isFinite(n)) return '0';
  return n.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatKg(n: number): string {
  return formatNumber(n, 0) + ' kg';
}

/** Devuelve "1 lote" o "2 lotes" según el número (singular/plural). */
export function plural(n: number, singular: string, pluralWord: string): string {
  return `${n} ${n === 1 ? singular : pluralWord}`;
}

/** Texto descriptivo del estado de inventario del lote. */
export function estadoDescripcion(estado: 'ok' | 'warning' | 'danger', bachesAPedir = 0): string {
  if (estado === 'ok') return 'Inventario suficiente';
  if (estado === 'warning') return 'Falta 1 bache por pedir';
  return `Faltan ${bachesAPedir} baches por pedir`;
}
