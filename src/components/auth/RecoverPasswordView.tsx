import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

export function RecoverPasswordView() {
  const { recoverPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await recoverPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el correo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">S</span>
          <h1 className="auth-title">Recuperar contraseña</h1>
          <p className="auth-subtitle">
            Te enviaremos un enlace para restablecerla
          </p>
        </div>

        {sent ? (
          <>
            <p className="auth-success">
              Si existe una cuenta con <strong>{email}</strong>, recibirás un
              correo con las instrucciones para restablecer tu contraseña.
            </p>
            <p className="auth-footer">
              <Link to="/login" className="auth-link">
                Volver a iniciar sesión
              </Link>
            </p>
          </>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {error && <p className="auth-error">{error}</p>}

              <div className="auth-field">
                <label className="auth-label" htmlFor="rec-email">
                  Email
                </label>
                <input
                  id="rec-email"
                  className="auth-input"
                  type="email"
                  placeholder="tucorreo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? "Enviando…" : "Enviar enlace"}
              </button>
            </form>

            <p className="auth-footer">
              <Link to="/login" className="auth-link">
                Volver a iniciar sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
