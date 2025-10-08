import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const navItems = [
  { to: "/", label: "Home", roles: ["Guest", "User", "Staff", "Admin"] },
  { to: "/report", label: "Report Issue", roles: ["User"] },
  {
    to: "/dashboard/citizen",
    label: "My Dashboard",
    roles: ["User"],
  },
  {
    to: "/dashboard/staff",
    label: "Staff Desk",
    roles: ["Staff", "Admin"],
  },
  {
    to: "/dashboard/admin",
    label: "Admin Control",
    roles: ["Admin"],
  },
  {
    to: "/transparency",
    label: "Transparency",
    roles: ["Guest", "User", "Staff", "Admin"],
  },
];

const Layout = () => {
  const { user, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role ?? "Guest";

  const [lastScrollY, setLastScrollY] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScrollY && current > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastScrollY(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 text-[15px] md:text-[17px] leading-relaxed">
      <header
        className={`sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur transition-transform duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex w-full items-center justify-between px-8 py-4">
          <Link to="/" className="text-2xl font-semibold tracking-tight text-teal-300 md:text-3xl">
            Caravan Chronicle
          </Link>
          <nav className="hidden gap-8 text-base font-semibold md:flex">
            {filteredNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `transition-colors hover:text-teal-300 ${
                    isActive || location.pathname.startsWith(item.to)
                      ? "text-teal-300"
                      : "text-slate-300"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-sm md:text-base">
            {user ? (
              <>
                <span className="hidden text-slate-400 md:inline">
                  {user.fullName} · {user.role}
                </span>
                <div className="hidden items-center gap-3 md:flex">
                  {role === "User" && (
                    <button
                      onClick={() => navigate("/dashboard/citizen")}
                      className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-teal-400 hover:text-teal-300"
                    >
                      My Tickets
                    </button>
                  )}
                  {(role === "Staff" || role === "Admin") && (
                    <button
                      onClick={() =>
                        navigate(role === "Staff" ? "/dashboard/staff" : "/dashboard/admin")
                      }
                      className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-teal-400 hover:text-teal-300"
                    >
                      {role === "Admin" ? "Admin Console" : "Staff Desk"}
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/transparency")}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-teal-400 hover:text-teal-300"
                  >
                    Transparency
                  </button>
                </div>
                <button
                  onClick={logout}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-teal-400 hover:text-teal-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-teal-400 hover:text-teal-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-teal-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-teal-400"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex w-full flex-col gap-6 px-6 py-8 lg:flex-row">
        <aside className="hidden w-full max-w-xs flex-shrink-0 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 lg:block">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Navigation
          </h2>
          <ul className="space-y-2 text-sm md:text-base">
            {filteredNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 transition-colors ${
                      isActive || location.pathname.startsWith(item.to)
                        ? "bg-teal-500/10 text-teal-300"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-teal-200"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
