import * as XLSX from 'xlsx';
import type { AppData } from '@/types';
import { calcularTodos, getCurrentWeek, estadoDescripcion } from '@/utils';

export const LAST_BACKUP_KEY = 'porciapp_last_backup_v1';

/** Fecha ISO del último respaldo JSON descargado, o null si nunca se hizo. */
export function getLastBackup(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY);
}

/** Registra el momento actual como fecha del último respaldo JSON. */
export function setLastBackup(): void {
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}

/**
 * Descarga un Excel con 4 hojas: Resumen, Pedido Semanal, Lotes y Fases de
 * consumo. Cada hoja incluye anchos de columna y filas de totales.
 */
export function exportarExcel(data: AppData): void {
  const lotesCalc = calcularTodos(data.lotes, data.fases, data.config);
  const round = (n: number) => Math.round(n * 100) / 100;

  const totalAnimales = data.lotes.reduce((s, l) => s + l.numAnimales, 0);
  const totalInventario = round(data.lotes.reduce((s, l) => s + l.inventarioKg, 0));
  const totalRequerimiento = round(
    lotesCalc.reduce((s, l) => s + l.requerimientoSemanalKg, 0)
  );
  const totalDeficit = round(
    lotesCalc.reduce((s, l) => s + Math.max(0, l.deficitKg), 0)
  );
  const totalBaches = lotesCalc.reduce((s, l) => s + l.bachesAPedir, 0);
  const pesoPorBache = data.config.pesoPorBache;

  const wb = XLSX.utils.book_new();

  // ---- Hoja 1: Resumen ----
  const resumenSheet = XLSX.utils.json_to_sheet([
    { Indicador: 'Aplicación', Valor: 'Gestión Porcina · Pedidos de Alimento' },
    { Indicador: 'Semana del Año', Valor: getCurrentWeek() },
    { Indicador: 'Fecha de Exportación', Valor: new Date().toLocaleString('es-ES') },
    { Indicador: 'Lotes Activos', Valor: data.lotes.length },
    { Indicador: 'Total de Animales', Valor: totalAnimales },
    { Indicador: 'Inventario Total (kg)', Valor: totalInventario },
    { Indicador: 'Requerimiento Semanal (kg)', Valor: totalRequerimiento },
    { Indicador: 'Faltante Total (kg)', Valor: totalDeficit },
    { Indicador: 'Peso por Bache (kg)', Valor: pesoPorBache },
    { Indicador: 'Baches a Pedir', Valor: totalBaches },
    { Indicador: 'Peso Total a Pedir (kg)', Valor: totalBaches * pesoPorBache },
  ]);
  resumenSheet['!cols'] = [{ wch: 30 }, { wch: 36 }];
  XLSX.utils.book_append_sheet(wb, resumenSheet, 'Resumen');

  // ---- Hoja 2: Pedido Semanal ----
  const pedidosRows: Record<string, string | number>[] = lotesCalc
    .filter((l) => l.bachesAPedir > 0)
    .sort((a, b) => b.bachesAPedir - a.bachesAPedir)
    .map((l) => ({
      Lote: l.nombre,
      Fase: l.faseNombre,
      'Edad (semanas)': l.edadSemanas,
      'Requerimiento Semanal (kg)': round(l.requerimientoSemanalKg),
      'Inventario (kg)': round(l.inventarioKg),
      'Faltante (kg)': round(l.deficitKg),
      'Peso por Bache (kg)': pesoPorBache,
      'Baches a Pedir': l.bachesAPedir,
      'Kg a Pedir': l.bachesAPedir * pesoPorBache,
    }));
  if (pedidosRows.length) {
    pedidosRows.push({
      Lote: 'TOTAL',
      Fase: '',
      'Edad (semanas)': '',
      'Requerimiento Semanal (kg)': totalRequerimiento,
      'Inventario (kg)': totalInventario,
      'Faltante (kg)': totalDeficit,
      'Peso por Bache (kg)': '',
      'Baches a Pedir': totalBaches,
      'Kg a Pedir': totalBaches * pesoPorBache,
    });
  }
  const pedidoSheet = XLSX.utils.json_to_sheet(pedidosRows);
  pedidoSheet['!cols'] = [
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, pedidoSheet, 'Pedido Semanal');

  // ---- Hoja 3: Lotes ----
  const lotesRows: Record<string, string | number>[] = lotesCalc.map((l) => ({
    Lote: l.nombre,
    Animales: l.numAnimales,
    Fase: l.faseNombre,
    'Edad (semanas)': l.edadSemanas,
    'Consumo Diario (kg/animal)': round(l.consumoDiarioKg),
    'Consumo Semanal (kg)': round(l.consumoSemanalKg),
    'Inventario (kg)': round(l.inventarioKg),
    'Faltante (kg)': round(l.deficitKg),
    'Baches a Pedir': l.bachesAPedir,
    Estado: estadoDescripcion(l.estado, l.bachesAPedir),
    Notas: l.notas,
  }));
  if (lotesRows.length) {
    lotesRows.push({
      Lote: 'TOTAL',
      Animales: totalAnimales,
      Fase: '',
      'Edad (semanas)': '',
      'Consumo Diario (kg/animal)': '',
      'Consumo Semanal (kg)': totalRequerimiento,
      'Inventario (kg)': totalInventario,
      'Faltante (kg)': totalDeficit,
      'Baches a Pedir': totalBaches,
      Estado: '',
      Notas: '',
    });
  }
  const lotesSheet = XLSX.utils.json_to_sheet(lotesRows);
  lotesSheet['!cols'] = [
    { wch: 22 },
    { wch: 10 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, lotesSheet, 'Lotes');

  // ---- Hoja 4: Fases ----
  const fasesSheet = XLSX.utils.json_to_sheet(
    data.fases.map((f) => ({
      Fase: f.nombre,
      'Semana Inicio': f.semanaInicio,
      'Semana Fin': f.semanaFin,
      'Consumo Diario (kg/animal)': f.consumoDiarioKg,
      'Consumo Semanal (kg/animal)': round(f.consumoDiarioKg * 7),
    }))
  );
  fasesSheet['!cols'] = [
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, fasesSheet, 'Fases');

  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `porciapp-pedido-${getCurrentWeek()}-${fecha}.xlsx`);
}
