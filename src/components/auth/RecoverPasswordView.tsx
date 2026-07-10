import { useState } from "react";
import { Link } from "@tanstack/react-router";
import "./auth.css";

/**
 * Vista de RECUPERAR CONTRASEÑA (solo maquetación UI).
 *
 * Un único campo de email y un botón para enviar el enlace de recuperación.
 *
 * NOTA: Esta vista es solo la interfaz. El envío real del correo se conecta
 * en el entorno del proyecto.
 */
export function RecoverPasswordView() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sin lógica: el envío del enlace lo implementa el proyecto.
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

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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

          <button className="auth-button" type="submit">
            Enviar enlace de recuperación
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login" className="auth-link">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
