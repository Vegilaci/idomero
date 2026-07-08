import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./auth";
import "../assets/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const ok = login(password);

    if (!ok) {
      setError("Hibás admin jelszó.");
      return;
    }
    navigate("/");
    window.location.reload();
  }

  return (
    <div className="login-page">
      <section className="login-card">
        <div className="login-icon">
          <i className="pi pi-stopwatch" />
        </div>

        <h1>Admin belépés</h1>
        <p>Időmérés vezérlőfelület</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="admin-password">Admin jelszó</label>

          <div className={`login-input ${error ? "login-input-error" : ""}`}>
            <i className="pi pi-lock" />

            <input
              id="admin-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              type="password"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button">
            Belépés
          </button>
        </form>
      </section>
    </div>
  );
}
