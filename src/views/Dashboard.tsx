import type { KeyboardEvent } from 'react';
import {
  PiggyBank,
  Wheat,
  Package,
  TrendingUp,
  CalendarDays,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import type { AppData, View } from '@/types';
import {
  calcularTodos,
  formatNumber,
  formatKg,
  getCurrentWeek,
  getSemanaRango,
  plural,
} from '@/utils';

export function Dashboard({
  data,
  onNavigate,
}: {
  data: AppData;
  onNavigate: (view: View) => void;
}) {
  const semanaActual = getCurrentWeek();
  const rango = getSemanaRango(semanaActual);
  const lotesCalc = calcularTodos(data.lotes, data.fases, data.config);

  const totalAnimales = data.lotes.reduce((s, l) => s + l.numAnimales, 0);
  const totalInventario = data.lotes.reduce((s, l) => s + l.inventarioKg, 0);
  const totalRequerimiento = lotesCalc.reduce((s, l) => s + l.requerimientoSemanalKg, 0);
  const totalDeficit = lotesCalc.reduce((s, l) => s + Math.max(0, l.deficitKg), 0);
  const totalBaches = lotesCalc.reduce((s, l) => s + l.bachesAPedir, 0);

  const lotesAlerta = lotesCalc.filter((l) => l.estado !== 'ok');
  const conPedido = lotesCalc.filter((l) => l.bachesAPedir > 0);

  const alertas1 = lotesAlerta.filter((l) => l.bachesAPedir === 1).length;
  const alertas2 = lotesAlerta.filter((l) => l.bachesAPedir === 2).length;
  const alertas3 = lotesAlerta.filter((l) => l.bachesAPedir >= 3).length;

  const goLotes = () => onNavigate('lotes');
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goLotes();
    }
  };

  return (
    <div>
      <div className="dash-hero">
        <div className="dash-hero__row">
          <div className="dash-hero__week">
            <div className="dash-hero__icon">
              <CalendarDays />
            </div>
            <div>
              <div className="dash-hero__week-title">
                Semana {semanaActual} · {new Date().getFullYear()}
              </div>
              <div className="dash-hero__week-range">
                {rango.inicio} — {rango.fin} · La edad de cada lote se calcula con esta semana
              </div>
            </div>
          </div>
          <div className="dash-hero__baches">
            <strong>{totalBaches}</strong>
            <span>baches esta semana</span>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div
          className="stat-card stat-card--primary"
          role="button"
          tabIndex={0}
          onClick={goLotes}
          onKeyDown={keyHandler}
        >
          <div className="stat-card__icon stat-card__icon--primary">
            <PiggyBank />
          </div>
          <div className="stat-card__label">Lotes Activos</div>
          <div className="stat-card__value">{data.lotes.length}</div>
          <div className="stat-card__sub">{formatNumber(totalAnimales)} animales</div>
        </div>

        <div className="stat-card stat-card--info">
          <div className="stat-card__icon stat-card__icon--info">
            <Package />
          </div>
          <div className="stat-card__label">Inventario en Almacén</div>
          <div className="stat-card__value">{formatNumber(totalInventario)}</div>
          <div className="stat-card__sub">kg en almacén</div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-card__icon stat-card__icon--success">
            <TrendingUp />
          </div>
          <div className="stat-card__label">Requerimiento Semanal</div>
          <div className="stat-card__value">{formatNumber(totalRequerimiento)}</div>
          <div className="stat-card__sub">kg estimados / semana</div>
        </div>

        <div className="stat-card stat-card--accent">
          <div className="stat-card__icon stat-card__icon--accent">
            <Wheat />
          </div>
          <div className="stat-card__label">Faltante Total</div>
          <div className="stat-card__value">{formatNumber(totalDeficit)}</div>
          <div className="stat-card__sub">
            {plural(totalBaches, 'bache', 'baches')} de {formatKg(data.config.pesoPorBache)}
          </div>
        </div>
      </div>

      <div className="dash-cols">
        <div
          className="order-card"
          role="button"
          tabIndex={0}
          onClick={goLotes}
          onKeyDown={keyHandler}
        >
          <div className="order-card__header">
            <div className="order-card__icon">
              <Truck />
            </div>
            <div>
              <div className="order-card__title">Orden de Pedido Semanal</div>
            </div>
          </div>
          <div className="order-card__result">
            <div className="order-card__value">{totalBaches}</div>
            <div className="order-card__label">
              baches de {formatKg(data.config.pesoPorBache)} ={' '}
              {formatNumber(totalBaches * data.config.pesoPorBache)} kg
            </div>
          </div>
          <div className="order-card__summary">
            {conPedido.length === 0 ? (
              <span className="text-success">Inventario suficiente. No hay baches que pedir.</span>
            ) : (
              <span>{plural(conPedido.length, 'lote necesita', 'lotes necesitan')} alimento esta semana</span>
            )}
          </div>
        </div>

        <div
          className="card dash-alerts"
          role="button"
          tabIndex={0}
          onClick={goLotes}
          onKeyDown={keyHandler}
        >
          <div className="card__header">
            <span className="card__title">Alertas de Inventario</span>
            <span className="badge badge--neutral">
              {plural(lotesAlerta.length, 'alerta', 'alertas')}
            </span>
          </div>
          <div className="card__body">
            {lotesAlerta.length === 0 ? (
              <div className="empty-state dash-alerts__empty">
                <div className="empty-state__icon">
                  <AlertTriangle />
                </div>
                <div className="empty-state__title">Sin alertas</div>
                <div className="empty-state__text">
                  Todos los lotes tienen inventario suficiente.
                </div>
              </div>
            ) : (
              <div className="dash-alert-summary">
                {alertas1 > 0 && (
                  <div className="dash-alert-summary__row dash-alert-summary__row--warning">
                    <AlertTriangle />
                    <span className="dash-alert-summary__count">{alertas1}</span>
                    <span>{plural(alertas1, 'lote necesita', 'lotes necesitan')} 1 bache</span>
                  </div>
                )}
                {alertas2 > 0 && (
                  <div className="dash-alert-summary__row dash-alert-summary__row--warning">
                    <AlertTriangle />
                    <span className="dash-alert-summary__count">{alertas2}</span>
                    <span>{plural(alertas2, 'lote necesita', 'lotes necesitan')} 2 baches</span>
                  </div>
                )}
                {alertas3 > 0 && (
                  <div className="dash-alert-summary__row dash-alert-summary__row--danger">
                    <AlertTriangle />
                    <span className="dash-alert-summary__count">{alertas3}</span>
                    <span>{plural(alertas3, 'lote necesita', 'lotes necesitan')} 3+ baches</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
