import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";
import Alert from "../components/Alert.jsx";
import { toast } from "react-toastify";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const msg = validate();
    if (msg) {
      setError(msg);
      toast.error(msg);
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      const em = err?.response?.data?.message || "Login failed";
      setError(em);
      toast.error(em);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto card p-6">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert type="error">{error}</Alert>}
          <div className="relative">
            <input id="email" type="email" className="input peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label htmlFor="email" className="absolute left-3 -top-2.5 bg-white px-1 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-focus:-top-2.5 peer-focus:text-xs text-stone-600">Email</label>
          </div>
          <div className="relative">
            <input id="password" type="password" className="input peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <label htmlFor="password" className="absolute left-3 -top-2.5 bg-white px-1 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-focus:-top-2.5 peer-focus:text-xs text-stone-600">Password</label>
          </div>
          <button type="submit" disabled={loading} className="btn-primary gap-2 active:scale-[0.98] transition-transform">{loading ? (<><Spinner /><span>Signing in...</span></>) : "Login"}</button>
        </form>
        <p className="text-sm mt-3">No account? <Link className="underline" to="/register">Register</Link></p>
      </div>
    </div>
  );
}

export default Login;


