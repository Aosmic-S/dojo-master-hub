import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.webp";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/what-we-offer", label: "What We Offer" },
  { to: "/timings", label: "Timings & Fees" },
  { to: "/achievements", label: "Achievements" },
  { to: "/gallery", label: "Gallery" },
  { to: "/location", label: "Location" },
  { to: "/contact", label: "Contact" },
];

type Account = { to: string; label: string; admin: boolean } | null;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<Account>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const resolve = async (uid?: string) => {
      if (!uid) return setAccount(null);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      const admin = !!roles?.some((r) => r.role === "admin");
      setAccount(admin ? { to: "/dashboard", label: "Dashboard", admin } : { to: "/student-profile", label: "My Profile", admin });
    };
    supabase.auth.getSession().then(({ data }) => resolve(data.session?.user.id));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") setAccount(null);
      else if (session?.user && (event === "SIGNED_IN")) setTimeout(() => resolve(session.user.id), 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const logout = async () => {
    await supabase.auth.signOut();
    setAccount(null);
    navigate("/");
  };

  const AccountIcon = account?.admin ? LayoutDashboard : User;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16 gap-3">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <img src={logo} alt="Raja Janak Academy" className="h-10 w-10 shrink-0" />
          <span className="font-heading text-lg text-gold-gradient hidden sm:block truncate">RAJA JANAK ACADEMY</span>
        </Link>

        <div className="hidden xl:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className={`px-3 py-2 text-sm font-medium transition-colors rounded ${location.pathname === l.to ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {account ? (
            <>
              <Link to={account.to} className="hidden sm:block">
                <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  <AccountIcon className="h-4 w-4 mr-1" /> {account.label}
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={logout} className="hidden sm:inline-flex text-muted-foreground">
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <Link to="/login" className="hidden sm:block">
              <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <LogIn className="h-4 w-4 mr-1" /> Login
              </Button>
            </Link>
          )}
          <button aria-label="Menu" className="xl:hidden h-11 w-11 flex items-center justify-center rounded-md text-foreground hover:bg-secondary" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="xl:hidden fixed inset-0 top-16 bg-background/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="xl:hidden absolute right-0 top-16 w-full sm:w-80 max-h-[calc(100vh-4rem)] overflow-y-auto bg-background border-l border-b border-border shadow-2xl animate-fade-in">
            {account ? (
              <div className="p-4 border-b border-border grid grid-cols-2 gap-2">
                <Link to={account.to}>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90"><AccountIcon className="h-4 w-4 mr-1" /> {account.label}</Button>
                </Link>
                <Button variant="outline" onClick={logout} className="w-full"><LogOut className="h-4 w-4 mr-1" /> Logout</Button>
              </div>
            ) : (
              <div className="p-4 border-b border-border">
                <Link to="/login"><Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90"><LogIn className="h-4 w-4 mr-1" /> Login</Button></Link>
              </div>
            )}
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to}
                className={`block px-6 py-4 text-sm font-medium border-b border-border/50 transition-colors ${location.pathname === l.to ? "text-accent bg-secondary" : "text-muted-foreground hover:text-foreground"}`}>
                {l.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
