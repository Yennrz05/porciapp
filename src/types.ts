export interface FaseConsumo {
  id: string;
  nombre: string;
  semanaInicio: number;
  semanaFin: number;
  consumoDiarioKg: number; // kg por animal por día
}

export interface Lote {
  id: string;
  nombre: string;
  numAnimales: number;
  semanaIngreso: number; // semana del año en que ingresó
  inventarioKg: number; // kg de alimento en inventario
  notas: string;
  fechaCreacion: string;
}

export interface Config {
  pesoPorBache: number; // kg por bache (default 2700)
}

export interface AppData {
  lotes: Lote[];
  fases: FaseConsumo[];
  config: Config;
  version: string;
}

export interface Profile {
  nombre: string;
  desbloqueado: boolean;
}

export type View = 'dashboard' | 'lotes' | 'fases' | 'datos' | 'config';

export interface LoteCalculado extends Lote {
  semanaActual: number; // semana actual del año (automática)
  edadSemanas: number; // semana actual - semana de ingreso
  faseId: string;
  faseNombre: string;
  consumoDiarioKg: number; // kg por animal por día según fase
  consumoSemanalKg: number; // consumo diario x 7 x animales
  requerimientoSemanalKg: number; // proyección semanal (equivale a consumoSemanalKg)
  deficitKg: number; // requerimiento semanal - inventario
  bachesAPedir: number; // déficit / peso por bache
  estado: 'ok' | 'warning' | 'danger';
}
