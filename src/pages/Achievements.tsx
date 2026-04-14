import { useState } from "react";
import Layout from "@/components/Layout";
import { Trophy, Medal, Star } from "lucide-react";

const achievements = [
  { year: "2024", title: "State Karate Championship — Gold", desc: "3 gold medals in Kata and Kumite categories", icon: Trophy },
  { year: "2024", title: "National Invitational — Silver", desc: "Runner-up in Junior Kata division", icon: Medal },
  { year: "2023", title: "Inter-District Championship", desc: "5 medals — 2 Gold, 2 Silver, 1 Bronze", icon: Trophy },
  { year: "2023", title: "Best Academy Award", desc: "Recognized as top performing academy in the region", icon: Star },
  { year: "2022", title: "State Level — 4 Golds", desc: "Dominated Kumite in all weight categories", icon: Trophy },
  { year: "2022", title: "National Camp Selection", desc: "3 students selected for national training camp", icon: Star },
  { year: "2021", title: "District Championship Sweep", desc: "Won overall championship trophy", icon: Trophy },
  { year: "2021", title: "Youth Games — Bronze", desc: "First medal at Youth National Games", icon: Medal },
];

const years = [...new Set(achievements.map((a) => a.year))];

const Achievements = () => {
  const [filter, setFilter] = useState("All");

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

          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {["All", ...years].map((y) => (
              <button
                key={y}
                onClick={() => setFilter(y)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === y
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((a, i) => (
              <div key={i} className="bg-card-gradient border border-border rounded-lg p-5 hover:border-accent/50 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <a.icon className="h-6 w-6 text-accent" />
                  <span className="text-xs text-muted-foreground font-heading">{a.year}</span>
                </div>
                <h3 className="font-heading text-lg font-semibold mb-1">{a.title}</h3>
                <p className="text-muted-foreground text-sm">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Achievements;
