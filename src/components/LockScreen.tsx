import { useState } from 'react';
import { Lock, LogIn, Eye, EyeOff } from 'lucide-react';

interface LockScreenProps {
  onUnlock: (nombre: string, clave: string) => boolean;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [nombre, setNombre] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
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
              placeholder="Nombre"
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
            <div className="password-field">
              <input
                id="lock-clave"
                type={verClave ? 'text' : 'password'}
                placeholder="Clave"
                value={clave}
                onChange={(e) => {
                  setClave(e.target.value);
                  setError(null);
                }}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={verClave ? 'Ocultar clave' : 'Mostrar clave'}
                title={verClave ? 'Ocultar clave' : 'Mostrar clave'}
                onClick={() => setVerClave((v) => !v)}
              >
                {verClave ? <EyeOff /> : <Eye />}
              </button>
            </div>
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
