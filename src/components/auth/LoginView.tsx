import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

export function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">S</span>
          <h1 className="auth-title">Bienvenida de nuevo</h1>
          <p className="auth-subtitle">Accede a tu portal de salud</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <p className="auth-error">{error}</p>}

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="auth-input"
              type="email"
              placeholder="tucorreo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">
              Contraseña
            </label>
            <input
              id="login-password"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="auth-meta">
            <span />
            <Link to="/recuperar-password" className="auth-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Entrando…" : "Iniciar sesión"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Tienes una invitación?{" "}
          <Link to="/activar-cuenta" className="auth-link">
            Activa tu cuenta
          </Link>
        </p>

        <div className="auth-hint">
          Prueba con <code>admin@salud.com</code>, <code>paciente@salud.com</code>{" "}
          o <code>alumno@salud.com</code> · contraseña <code>123456</code>
        </div>
      </div>
    </div>
  );
}
