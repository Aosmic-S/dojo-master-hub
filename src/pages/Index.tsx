import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Award, Users, Shield, LayoutDashboard, User as UserIcon } from "lucide-react";
import Layout from "@/components/Layout";
import heroBg from "@/assets/hero-bg.webp";
import AffiliationsStrip from "@/components/AffiliationsStrip";
import Reveal, { Counter } from "@/components/Reveal";
import { useAuthReady } from "@/hooks/useAuthReady";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const { user } = useAuthReady();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setScrollY(window.scrollY)); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (!user) { setRole(null); return; }
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const r = roles?.[0]?.role || "student";
      setRole(r);
      if (r !== "admin") {
        const { data: s } = await supabase.from("students").select("full_name").eq("user_id", user.id).maybeSingle();
        setName(s?.full_name || "");
      }
    })();
  }, [user]);

  const isAdmin = role === "admin";

  return (
    <Layout>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="" fetchPriority="high" decoding="async"
          className="absolute inset-0 w-full h-[120%] object-cover will-change-transform"
          style={{ transform: `translate3d(0, ${scrollY * 0.4}px, 0) scale(1.05)` }} width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute -right-20 top-1/4 w-72 h-72 rounded-full bg-primary/20 blur-3xl float-slow pointer-events-none" />
        <div className="relative z-10 container mx-auto px-4 py-20" style={{ transform: `translateY(${scrollY * -0.15}px)`, opacity: Math.max(0, 1 - scrollY / 700) }}>
          {user && role ? (
            <>
              <p className="text-accent font-heading text-sm uppercase tracking-[0.3em] mb-4 animate-fade-in">
                {isAdmin ? "Sensei Console" : "Welcome back, Karateka"}
              </p>
              <h1 className="font-heading text-5xl sm:text-7xl font-bold leading-none mb-6 animate-fade-in">
                OSU, <span className="text-gold-gradient">{isAdmin ? "SENSEI" : (name.split(" ")[0] || "STUDENT").toUpperCase()}</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                {isAdmin ? "Manage students, reports, fees and events from your dashboard." : "Check your training, attendance, fees and announcements in your profile."}
              </p>
              <Link to={isAdmin ? "/dashboard" : "/student-profile"} className="animate-fade-in inline-block" style={{ animationDelay: "0.35s" }}>
                <Button size="lg" className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading text-lg px-8 hover-scale">
                  {isAdmin ? <LayoutDashboard className="mr-2 h-5 w-5" /> : <UserIcon className="mr-2 h-5 w-5" />}
                  {isAdmin ? "OPEN DASHBOARD" : "MY PROFILE"} <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-accent font-heading text-sm uppercase tracking-[0.3em] mb-4 animate-fade-in">
                Affiliated with Drona Martial Arts Academy
              </p>
              <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold leading-none mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
                RAJA JANAK<br />
                <span className="text-gold-gradient">ACADEMY</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                Forging discipline, strength & championship spirit through the art of Karate.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.45s" }}>
                <Link to="/contact">
                  <Button size="lg" className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading text-lg px-8 hover-scale">
                    JOIN NOW <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/what-we-offer">
                  <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-heading text-lg px-8 hover-scale">
                    EXPLORE PROGRAMS
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <Reveal><AffiliationsStrip /></Reveal>

      <section className="bg-secondary py-16 overflow-hidden">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: Users, label: "Students Trained", value: 50 },
            { icon: Award, label: "Championships Won", value: 10 },
            { icon: Shield, label: "Years of Excellence", value: 1 },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 150}>
              <div className="flex flex-col items-center gap-2 group">
                <s.icon className="h-8 w-8 text-accent transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" />
                <span className="font-heading text-4xl font-bold text-foreground"><Counter value={s.value} />+</span>
                <span className="text-muted-foreground text-sm">{s.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
