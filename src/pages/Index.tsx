import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Award, Users, Shield } from "lucide-react";
import Layout from "@/components/Layout";
import heroBg from "@/assets/hero-bg.jpg";
import AffiliationsStrip from "@/components/AffiliationsStrip";

const Index = () => (
  <Layout>
    {/* Hero */}
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="relative z-10 container mx-auto px-4 py-20">
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
            <Button size="lg" className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading text-lg px-8">
              JOIN NOW <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/what-we-offer">
            <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-heading text-lg px-8">
              EXPLORE PROGRAMS
            </Button>
          </Link>
        </div>

        <p className="mt-12 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0.6s" }}>
          Recognised by world & national karate bodies — see our affiliations below.
        </p>
      </div>
    </section>

    <AffiliationsStrip />

    {/* Stats */}
    <section className="bg-secondary py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {[
          { icon: Users, label: "Students Trained", value: "500+" },
          { icon: Award, label: "Championships Won", value: "120+" },
          { icon: Shield, label: "Years of Excellence", value: "10+" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-2">
            <s.icon className="h-8 w-8 text-accent" />
            <span className="font-heading text-4xl font-bold text-foreground">{s.value}</span>
            <span className="text-muted-foreground text-sm">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  </Layout>
);

export default Index;
