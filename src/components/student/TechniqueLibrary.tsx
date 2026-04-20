import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Library, ExternalLink } from "lucide-react";

const DEFAULTS = [
  { name: "Choku-zuki", category: "Punch", description: "Straight punch from natural stance.", video_url: "https://www.youtube.com/results?search_query=karate+choku+zuki" },
  { name: "Mae-geri", category: "Kick", description: "Front snap kick — fundamental kicking technique.", video_url: "https://www.youtube.com/results?search_query=karate+mae+geri" },
  { name: "Mawashi-geri", category: "Kick", description: "Roundhouse kick using the ball of the foot.", video_url: "https://www.youtube.com/results?search_query=mawashi+geri" },
  { name: "Heian Shodan", category: "Kata", description: "First kata of the Heian series — 21 movements.", video_url: "https://www.youtube.com/results?search_query=heian+shodan" },
  { name: "Age-uke", category: "Block", description: "Rising block to defend against high attacks.", video_url: "https://www.youtube.com/results?search_query=age+uke" },
  { name: "Gyaku-zuki", category: "Punch", description: "Reverse punch — most powerful basic punch.", video_url: "https://www.youtube.com/results?search_query=gyaku+zuki" },
];

const TechniqueLibrary = () => {
  const [techniques, setTechniques] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("technique_library").select("*").order("name");
      setTechniques(data && data.length > 0 ? data : DEFAULTS);
    })();
  }, []);

  const cats = ["All", ...Array.from(new Set(techniques.map(t => t.category)))];
  const filtered = filter === "All" ? techniques : techniques.filter(t => t.category === filter);

  return (
    <div className="bg-card-gradient border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Library className="h-5 w-5 text-accent" />
        <h3 className="font-heading text-lg font-semibold">Technique Library</h3>
      </div>
      <div className="flex gap-2 flex-wrap mb-3">
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`text-xs px-3 py-1 rounded-full border ${filter === c ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {filtered.map((t, i) => (
          <div key={t.id || i} className="bg-secondary rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-heading text-sm font-semibold">{t.name}</p>
                <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded">{t.category}</span>
              </div>
              {t.video_url && (
                <a href={t.video_url} target="_blank" rel="noreferrer" className="text-accent"><ExternalLink className="h-4 w-4" /></a>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TechniqueLibrary;
