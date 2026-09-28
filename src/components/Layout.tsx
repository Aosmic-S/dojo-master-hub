import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, LayoutDashboard, Clock, Image } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { supabase } from "@/integrations/supabase/client";

const BottomBar = () => {
  const { pathname } = useLocation();
  const [account, setAccount] = useState<{ to: string; label: string; icon: any } | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) return setAccount({ to: "/login", label: "Login", icon: User });
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      setAccount(roles?.some((r) => r.role === "admin")
        ? { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
        : { to: "/profile", label: "Profile", icon: User });
    });
  }, []);
  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/timings", label: "Timings", icon: Clock },
    { to: "/gallery", label: "Gallery", icon: Image },
    ...(account ? [account] : []),
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((i) => {
          const active = pathname === i.to;
          return (
            <Link key={i.to} to={i.to} className={`flex flex-col items-center gap-1 py-2.5 min-h-[56px] text-[11px] transition-colors ${active ? "text-accent" : "text-muted-foreground"}`}>
              <i.icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
              {i.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main key={pathname} className="flex-1 pt-16 pb-16 md:pb-0 animate-fade-in">{children}</main>
      <div className="pb-16 md:pb-0"><Footer /></div>
      <BottomBar />
    </div>
  );
};

export default Layout;
