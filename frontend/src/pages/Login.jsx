import { Bot, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../utils/formatters.js";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-700 text-white">
            <Bot className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Smart Complaint</h1>
            <p className="text-sm text-slate-500">AI-Based Complaint Management</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="panel p-6">
          <h2 className="text-2xl font-bold text-slate-950">Login</h2>
          <p className="mt-2 text-sm text-slate-600">Access your dashboard, register complaints, and track progress.</p>

          {error ? <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="form-label">Email</span>
              <span className="relative mt-1 block">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  className="form-input pl-10"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="form-label">Password</span>
              <span className="relative mt-1 block">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  className="form-input pl-10"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </span>
            </label>
          </div>

          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            New user?{" "}
            <Link to="/signup" className="font-semibold text-teal-700 hover:text-teal-900">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Login;
