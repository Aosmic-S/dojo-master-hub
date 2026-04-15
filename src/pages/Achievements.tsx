import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Star } from "lucide-react";

const iconMap: Record<string, any> = { trophy: Trophy, medal: Medal, star: Star };

const Achievements = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("academy_achievements").select("*").order("year", { ascending: false });
      setAchievements(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const years = [...new Set(achievements.map((a) => a.year))];
  const filtered = filter === "All" ? achievements : achievements.filter((a) => a.year === filter);

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-4">
            OUR <span className="text-gold-gradient">ACHIEVEMENTS</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
            A legacy of medals, champions, and martial arts excellence.
          </p>

          {!loading && years.length > 0 && (
            <div className="flex justify-center gap-2 mb-12 flex-wrap">
              {["All", ...years].map((y) => (
                <button key={y} onClick={() => setFilter(y)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === y ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {y}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground">No achievements yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((a) => {
                const Icon = iconMap[a.icon_type] || Trophy;
                return (
                  <div key={a.id} className="bg-card-gradient border border-border rounded-lg p-5 hover:border-accent/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="h-6 w-6 text-accent" />
                      <span className="text-xs text-muted-foreground font-heading">{a.year}</span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold mb-1">{a.title}</h3>
                    <p className="text-muted-foreground text-sm">{a.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Achievements;
