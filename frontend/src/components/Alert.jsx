import React from "react";

function Alert({ type = "info", children }) {
  const styles = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  };
  const role = type === "error" ? "alert" : "status";
  return (
    <div className={`border rounded px-3 py-2 text-sm ${styles[type]}`} role={role} aria-live="polite">
      {children}
    </div>
  );
}

export default Alert;


