import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./auth";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const ok = login(username, password);

    if (!ok) {
      setError("Hibás admin név vagy jelszó.");
      return;
    }

    navigate("/admin");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">⏱</div>

        <h1>Kerékpáros időmérés</h1>
        <p>Admin bejelentkezés</p>

        <form onSubmit={handleSubmit}>
          <label>Felhasználónév</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoFocus
          />

          <label>Jelszó</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
          />

          {error && <div className="login-error">{error}</div>}

          <button type="submit">Belépés</button>
        </form>
      </div>
    </div>
  );
}