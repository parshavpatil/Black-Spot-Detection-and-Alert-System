import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-20 shadow-sm fade-in header backdrop-blur" style={{background: "var(--clr-surface)", borderBottom: "1px solid color-mix(in oklab, var(--clr-charcoal) 15%, white)"}}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/src/assets/sentinel-eye.png" alt="Blackspot logo" className="h-8 w-8" />
          <span className="font-bold text-lg" style={{color: "var(--clr-charcoal)"}}>Blackspot Detection and Alert System</span>
        </Link>
        <nav className="relative flex items-center gap-4">
          <NavLink to="/" end className={({ isActive }) => `relative px-1 py-1 transition-colors ${isActive ? "font-semibold" : ""}`} style={({ isActive }) => ({ color: isActive ? "var(--clr-primary)" : "var(--clr-charcoal)" })}>
            {({ isActive }) => (
              <span className="relative">
                Home
                {isActive && <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full" style={{background: "var(--clr-primary)"}} />}
              </span>
            )}
          </NavLink>
          <NavLink to="/report" className={({ isActive }) => `relative px-1 py-1 transition-colors ${isActive ? "font-semibold" : ""}`} style={({ isActive }) => ({ color: isActive ? "var(--clr-primary)" : "var(--clr-charcoal)" })}>
            {({ isActive }) => (
              <span className="relative">
                Report Accident
                {isActive && <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full" style={{background: "var(--clr-primary)"}} />}
              </span>
            )}
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => `relative px-1 py-1 transition-colors ${isActive ? "font-semibold" : ""}`} style={({ isActive }) => ({ color: isActive ? "var(--clr-primary)" : "var(--clr-charcoal)" })}>
            {({ isActive }) => (
              <span className="relative">
                Map
                {isActive && <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full" style={{background: "var(--clr-primary)"}} />}
              </span>
            )}
          </NavLink>
          <NavLink to="/statistics" className={({ isActive }) => `relative px-1 py-1 transition-colors ${isActive ? "font-semibold" : ""}`} style={({ isActive }) => ({ color: isActive ? "var(--clr-primary)" : "var(--clr-charcoal)" })}>
            {({ isActive }) => (
              <span className="relative">
                Statistics
                {isActive && <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full" style={{background: "var(--clr-primary)"}} />}
              </span>
            )}
          </NavLink>
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? "font-semibold" : ""} style={({ isActive }) => ({ color: isActive ? "var(--clr-primary)" : "var(--clr-charcoal)" })}>Login</NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? "font-semibold" : ""} style={({ isActive }) => ({ color: isActive ? "var(--clr-primary)" : "var(--clr-charcoal)" })}>Register</NavLink>
            </>
          ) : (
            <>
              <span className="text-sm" style={{color: "color-mix(in oklab, var(--clr-charcoal) 70%, white)"}}>{user?.name || user?.email || "Signed in"}</span>
              <button onClick={logout} style={{color: "var(--clr-charcoal)"}} className="hover:underline">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;


