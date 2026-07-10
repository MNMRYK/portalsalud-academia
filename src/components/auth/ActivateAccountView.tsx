import { useState } from "react";
import { Link } from "@tanstack/react-router";
import "./auth.css";

/**
 * Vista de ACTIVAR CUENTA (solo maquetación UI).
 *
 * El usuario llega desde un enlace con token, por lo que el email ya
 * viene resuelto: aquí únicamente define su nueva contraseña.
 *
 * NOTA: Esta vista es solo la interfaz. La lógica de validación del token
 * y guardado de contraseña se conecta en el entorno del proyecto.
 */
export function ActivateAccountView() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sin lógica: la conexión (token + guardado) la implementa el proyecto.
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">S</span>
          <h1 className="auth-title">Activa tu cuenta</h1>
          <p className="auth-subtitle">Crea una contraseña para empezar</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="activate-password">
              Nueva contraseña
            </label>
            <input
              id="activate-password"
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
            <label className="auth-label" htmlFor="activate-confirm">
              Confirmar contraseña
            </label>
            <input
              id="activate-confirm"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button className="auth-button" type="submit">
            Activar cuenta
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
