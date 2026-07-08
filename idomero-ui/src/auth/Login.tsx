import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./auth";
import "../assets/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const ok = login(password);

    if (!ok) {
      setError("Hibás admin jelszó.");
      return;
    }

    navigate("/");
  }

  return (
    <div className="login-page">
      <div className="login-bg-stopwatch" />
      <div className="login-bg-track" />
      <div className="login-bg-dots login-bg-dots-left" />
      <div className="login-bg-dots login-bg-dots-right" />

      <section className="login-card">
        <div className="login-card-glow" />

        <div className="login-main-icon">
          <i className="pi pi-stopwatch" />
        </div>

        <h1>Kerékpáros időmérés</h1>
        <p className="login-subtitle">Race Control</p>

        <div className="login-divider">
          <span />
        </div>

        <div className="login-admin-title">
          <i className="pi pi-lock" />
          <span>Admin belépés</span>
        </div>

        <p className="login-admin-desc">Csak adminok számára</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="admin-password">Admin jelszó</label>

          <div className={`login-input-wrap ${error ? "login-input-error" : ""}`}>
            <i className="pi pi-lock login-input-icon" />

            <input
              id="admin-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoFocus
            />

            <button
              type="button"
              className="login-eye-button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="Jelszó láthatóság váltása"
            >
              <i className={showPassword ? "pi pi-eye-slash" : "pi pi-eye"} />
            </button>
          </div>

          {error && (
            <div className="login-error-message">
              <i className="pi pi-exclamation-triangle" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="login-submit">
            <span>Belépés</span>
            <i className="pi pi-arrow-right" />
          </button>
        </form>

        <div className="login-footer">
          <span>
            <i className="pi pi-shield" />
            Helyi admin mód
          </span>

          <span className="login-footer-dot" />

          <span>Időmérés vezérlés</span>
        </div>
      </section>
    </div>
  );
}