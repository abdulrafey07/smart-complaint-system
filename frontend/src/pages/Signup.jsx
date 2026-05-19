import { Bot, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../utils/formatters.js";

const Signup = () => {
  const { signup, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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
      await signup(form);
      navigate("/", { replace: true });
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
            <p className="text-sm text-slate-500">Register and manage civic complaints</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="panel p-6">
          <h2 className="text-2xl font-bold text-slate-950">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">Sign up to file complaints and receive AI-assisted routing updates.</p>

          {error ? <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="form-label">Full name</span>
              <span className="relative mt-1 block">
                <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  className="form-input pl-10"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </span>
            </label>

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
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </span>
            </label>
          </div>

          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign Up"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-900">
              Login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Signup;
