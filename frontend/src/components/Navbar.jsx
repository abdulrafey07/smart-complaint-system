import { Bot, ClipboardList, LayoutDashboard, LogOut, Menu, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/complaints/new", label: "Register", icon: PlusCircle },
  { to: "/complaints", label: "Complaints", icon: ClipboardList }
];

const NavItem = ({ item, onClick }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
          isActive ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        }`
      }
      end={item.to === "/"}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {item.label}
    </NavLink>
  );
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3 text-slate-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-white">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold sm:text-base">Smart Complaint</span>
              <span className="block text-xs font-medium text-slate-500">AI Management System</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((item) => (
              <NavItem item={item} key={item.to} />
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role?.replace("_", " ")}</p>
            </div>
            <button type="button" onClick={handleLogout} className="btn-secondary" aria-label="Logout">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </div>

          <button type="button" className="btn-secondary md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-2">
              {links.map((item) => (
                <NavItem item={item} key={item.to} onClick={() => setOpen(false)} />
              ))}
              <button type="button" onClick={handleLogout} className="btn-secondary justify-start">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Navbar;
