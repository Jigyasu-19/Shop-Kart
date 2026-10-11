import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginCustomer } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await loginCustomer({ email, password });
      navigate("/home", { replace: true });
    } catch {
      setError("Invalid Credentials");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">SHOPKART</p>
        <h1 id="login-title">Welcome back</h1>
        <p className="subtext">Log in to continue shopping.</p>
        {location.state?.message && (
          <p className="alert success" role="status">
            {location.state.message}
          </p>
        )}
        {error && (
          <p className="alert error" role="alert">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <label className="field" htmlFor="email">
            <span>Email</span>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="field" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Login"}
          </button>
        </form>
        <p className="form-footer">
          New to ShopKart? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
