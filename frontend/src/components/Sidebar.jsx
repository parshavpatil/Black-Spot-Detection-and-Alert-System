import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 border-r h-full hidden lg:block">
      <div className="p-4">
        <h2 className="font-semibold mb-3">Admin</h2>
        <nav className="flex flex-col gap-2">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "font-semibold" : "text-gray-700 hover:text-black"}>Dashboard</NavLink>
          <NavLink to="/admin/blackspots" className={({ isActive }) => isActive ? "font-semibold" : "text-gray-700 hover:text-black"}>Manage Blackspots</NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? "font-semibold" : "text-gray-700 hover:text-black"}>Users</NavLink>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;


