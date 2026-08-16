import type { KeyboardEvent } from 'react';
import {
  PiggyBank,
  Wheat,
  Package,
  TrendingUp,
  ClipboardList,
  CalendarDays,
  Truck,
} from 'lucide-react';
import type { AppData, View } from '@/types';
import {
  calcularTodos,
  formatNumber,
  formatKg,
  getCurrentWeek,
  getSemanaRango,
  plural,
  estadoDescripcion,
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
  const lotesDanger = lotesCalc.filter((l) => l.estado === 'danger');
  const conPedido = lotesCalc.filter((l) => l.bachesAPedir > 0);

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
        <div className="order-card">
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
          <div className="order-card__list">
            {conPedido.length === 0 ? (
              <div className="order-card__empty">
                Inventario suficiente para todos los lotes. No hay baches que pedir.
              </div>
            ) : (
              conPedido.map((l) => (
                <div key={l.id} className="order-card__item">
                  <div>
                    <strong>{l.nombre}</strong>
                    <span>
                      {l.faseNombre} · {l.edadSemanas} sem · {formatNumber(l.numAnimales)} animales
                    </span>
                  </div>
                  <div>
                    <span className="order-card__kg">{formatNumber(l.deficitKg)} kg</span>
                    <strong>{plural(l.bachesAPedir, 'bache', 'baches')}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card dash-alerts">
          <div className="card__header">
            <span className="card__title">Alertas de Inventario</span>
            <span className="badge badge--neutral">
              {plural(lotesAlerta.length, 'alerta', 'alertas')} ·{' '}
              {plural(lotesDanger.length, 'crítica', 'críticas')}
            </span>
          </div>
          <div className="card__body">
            {lotesAlerta.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">
                  <ClipboardList />
                </div>
                <div className="empty-state__title">Sin alertas</div>
                <div className="empty-state__text">
                  Todos los lotes tienen inventario suficiente para la semana.
                </div>
              </div>
            ) : (
              <>
                <div className="table-wrap desktop-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Lote</th>
                        <th>Fase</th>
                        <th>Requer.</th>
                        <th>Inv.</th>
                        <th>Baches</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lotesAlerta.map((l) => (
                        <tr
                          key={l.id}
                          className={l.estado === 'danger' ? 'row--danger' : 'row--warning'}
                        >
                          <td className="font-bold">{l.nombre}</td>
                          <td>{l.faseNombre}</td>
                          <td>{formatKg(l.requerimientoSemanalKg)}</td>
                          <td>{formatKg(l.inventarioKg)}</td>
                          <td className="font-bold">{l.bachesAPedir}</td>
                          <td>
                            <span
                              className={`badge ${
                                l.estado === 'danger' ? 'badge--danger' : 'badge--warning'
                              }`}
                            >
                              {estadoDescripcion(l.estado, l.bachesAPedir)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-cards">
                  {lotesAlerta.map((l) => (
                    <div
                      key={l.id}
                      className={`lote-card ${
                        l.estado === 'danger' ? 'lote-card--danger' : 'lote-card--warning'
                      }`}
                    >
                      <div className="lote-card__header">
                        <div>
                          <div className="lote-card__name">{l.nombre}</div>
                          <div className="lote-card__meta">
                            {l.faseNombre} · {l.edadSemanas} sem ·{' '}
                            {formatNumber(l.numAnimales)} animales
                          </div>
                        </div>
                        <span
                          className={`badge ${
                            l.estado === 'danger' ? 'badge--danger' : 'badge--warning'
                          }`}
                        >
                          {estadoDescripcion(l.estado, l.bachesAPedir)}
                        </span>
                      </div>
                      <div className="lote-card__body">
                        <div className="lote-card__field">
                          <div className="lote-card__field-label">Requer. semanal</div>
                          <div className="lote-card__field-value">
                            {formatKg(l.requerimientoSemanalKg)}
                          </div>
                        </div>
                        <div className="lote-card__field">
                          <div className="lote-card__field-label">Inventario</div>
                          <div className="lote-card__field-value">{formatKg(l.inventarioKg)}</div>
                        </div>
                        <div className="lote-card__field">
                          <div className="lote-card__field-label">Faltante</div>
                          <div className="lote-card__field-value text-danger">
                            {formatNumber(l.deficitKg)} kg
                          </div>
                        </div>
                        <div className="lote-card__field">
                          <div className="lote-card__field-label">Baches</div>
                          <div className="lote-card__field-value">{l.bachesAPedir}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
