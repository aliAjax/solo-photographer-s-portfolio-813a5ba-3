import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const NAV = [
  { to: "/", label: "首页", end: true },
  { to: "/work", label: "作品集", end: false },
  { to: "/about", label: "关于", end: false },
  { to: "/contact", label: "联系", end: false },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // 路由切换后回到顶部，并收起移动菜单
  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <Link to="/" className="logo">
            凝视之地
          </Link>

          <button
            type="button"
            className="menu"
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden="true" />
          </button>

          <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="主导航">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <span>© 2026 独立摄影作品集</span>
          <span>《凝视》 · 《无人之境》 · 《高原牧歌》</span>
        </div>
      </footer>
    </>
  );
}
