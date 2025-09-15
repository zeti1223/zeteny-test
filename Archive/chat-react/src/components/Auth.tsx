import React, { useState } from "react";
import {
  db,
  ref,
  push,
  set,
  get,
  query,
  orderByChild,
  equalTo,
} from "../firebase";
import { User } from "../types";
import { hashPassword } from "../utils";

type Props = { onLogin: (u: User) => void };

export default function Auth({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister() {
    setError("");
    setSuccess("");
    if (registerPassword !== registerPasswordConfirm) {
      setError("A jelszavak nem egyeznek!");
      return;
    }
    if (registerPassword.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie!");
      return;
    }
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setError("Érvénytelen email cím!");
      return;
    }

    try {
      const usersRef = ref(db, "chat/users");
      const q1 = query(
        usersRef,
        orderByChild("username"),
        equalTo(registerUsername),
      );
      const snap1 = await get(q1);
      if (snap1.exists()) {
        setError("A felhasználónév már foglalt!");
        return;
      }

      const q2 = query(usersRef, orderByChild("email"), equalTo(registerEmail));
      const snap2 = await get(q2);
      if (snap2.exists()) {
        setError("Az email cím már használatban van!");
        return;
      }

      const hashed = await hashPassword(registerPassword);
      const newRef = push(usersRef);
      await set(newRef, {
        username: registerUsername,
        email: registerEmail,
        password: hashed,
        createdAt: Date.now(),
      });
      const user = {
        id: newRef.key!,
        username: registerUsername,
        email: registerEmail,
      };
      setSuccess("Sikeres regisztráció!");
      onLogin(user);
    } catch (e) {
      setError("Hiba történt a regisztráció során.");
      console.error(e);
    }
  }

  async function handleLogin() {
    setError("");
    setSuccess("");
    try {
      const hashed = await hashPassword(loginPassword);
      const usersRef = ref(db, "chat/users");
      const q = query(usersRef, orderByChild("email"), equalTo(loginEmail));
      const snap = await get(q);
      if (!snap.exists()) {
        setError("Hibás email vagy jelszó!");
        return;
      }
      let userData = null;
      snap.forEach((child) => {
        const v = child.val();
        if (v.password === hashed) {
          userData = { id: child.key!, username: v.username, email: v.email };
        }
      });
      if (!userData) {
        setError("Hibás email vagy jelszó!");
        return;
      }
      onLogin(userData);
    } catch (e) {
      setError("Hiba történt a bejelentkezés során.");
      console.error(e);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <div
          className={`auth-tab ${mode === "login" ? "active" : ""}`}
          onClick={() => setMode("login")}
        >
          Bejelentkezés
        </div>
        <div
          className={`auth-tab ${mode === "register" ? "active" : ""}`}
          onClick={() => setMode("register")}
        >
          Regisztráció
        </div>
      </div>

      {mode === "login" ? (
        <div className="auth-form active" id="loginForm">
          <div className="form-group">
            <label>Email cím</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Add meg az email címed"
            />
          </div>
          <div className="form-group">
            <label>Jelszó</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Add meg a jelszavad"
            />
          </div>
          <button className="auth-btn" onClick={handleLogin}>
            Bejelentkezés
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : (
        <div className="auth-form active" id="registerForm">
          <div className="form-group">
            <label>Felhasználónév</label>
            <input
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              placeholder="Válassz felhasználónevet"
            />
          </div>
          <div className="form-group">
            <label>Email cím</label>
            <input
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="Add meg az email címed"
            />
          </div>
          <div className="form-group">
            <label>Jelszó</label>
            <input
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              placeholder="Válassz erős jelszót"
            />
          </div>
          <div className="form-group">
            <label>Jelszó megerősítése</label>
            <input
              type="password"
              value={registerPasswordConfirm}
              onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
              placeholder="Írd be újra a jelszót"
            />
          </div>
          <button className="auth-btn" onClick={handleRegister}>
            Regisztráció
          </button>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      )}
    </div>
  );
}
