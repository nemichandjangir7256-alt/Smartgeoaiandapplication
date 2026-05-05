import { Link, useLocation } from "react-router-dom";
import { MapPin } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/map", label: "Map Analysis" },
  { to: "/results", label: "Results" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg shadow-surface">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <MapPin className="w-4 h-4 text-accent-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">SmartGeo</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                location.pathname === link.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
