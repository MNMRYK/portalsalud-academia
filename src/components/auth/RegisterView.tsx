import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

export function RegisterView() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">S</span>
          <h1 className="auth-title">Crea tu cuenta</h1>
          <p className="auth-subtitle">Únete al portal de salud</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <p className="auth-error">{error}</p>}

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">
              Nombre completo
            </label>
            <input
              id="reg-name"
              className="auth-input"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
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
            <label className="auth-label" htmlFor="reg-password">
              Contraseña
            </label>
            <input
              id="reg-password"
              className="auth-input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">
              Repetir contraseña
            </label>
            <input
              id="reg-confirm"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="auth-link">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
