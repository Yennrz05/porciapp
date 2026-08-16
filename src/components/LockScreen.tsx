import { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';

interface LockScreenProps {
  onUnlock: (nombre: string, clave: string) => boolean;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [nombre, setNombre] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Escribe tu nombre para continuar.');
      return;
    }
    const ok = onUnlock(nombre, clave);
    if (!ok) {
      setError('Clave de acceso incorrecta. Verifica e intenta de nuevo.');
    }
  };

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <div className="lock-card__logo">
          <Lock />
        </div>
        <h1 className="lock-card__title">Gestión Porcina</h1>
        <p className="lock-card__subtitle">
          Acceso protegido · Pedidos de alimento
        </p>

        <form className="lock-card__form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="lock-nombre">Tu nombre *</label>
            <input
              id="lock-nombre"
              type="text"
              placeholder="Juan Pérez"
              value={nombre}
              autoComplete="off"
              onChange={(e) => {
                setNombre(e.target.value);
                setError(null);
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lock-clave">Clave de acceso</label>
            <input
              id="lock-clave"
              type="password"
              placeholder="Tu clave"
              value={clave}
              onChange={(e) => {
                setClave(e.target.value);
                setError(null);
              }}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn--primary btn--lg btn--block">
            <LogIn />
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
