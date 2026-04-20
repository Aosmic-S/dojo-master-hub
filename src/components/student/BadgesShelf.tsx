import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, Star, Flame, Shield, Trophy } from "lucide-react";

const ICONS: Record<string, any> = { award: Award, star: Star, flame: Flame, shield: Shield, trophy: Trophy };

const BadgesShelf = ({ studentId, attendance, achievementsCount }: { studentId: string; attendance: number; achievementsCount: number }) => {
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("student_badges").select("*").eq("student_id", studentId).order("awarded_at", { ascending: false });
      setBadges(data || []);
    })();
  }, [studentId]);

  // Auto-derived virtual badges
  const virtual = [
    attendance >= 10 && { name: "10+ Sessions", icon: "flame" },
    attendance >= 25 && { name: "Dedicated", icon: "shield" },
    achievementsCount >= 1 && { name: "First Achievement", icon: "star" },
    achievementsCount >= 5 && { name: "5x Achiever", icon: "trophy" },
  ].filter(Boolean) as { name: string; icon: string }[];

  const all = [...badges.map(b => ({ name: b.badge_name, icon: b.badge_icon })), ...virtual];

  return (
    <div className="bg-card-gradient border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <Award className="h-5 w-5 text-accent" />
        <h3 className="font-heading text-lg font-semibold">Badges</h3>
      </div>
      {all.length === 0 ? <p className="text-muted-foreground text-sm">Earn badges through attendance and achievements.</p> : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {all.map((b, i) => {
            const Icon = ICONS[b.icon] || Award;
            return (
              <div key={i} className="aspect-square bg-secondary rounded-lg flex flex-col items-center justify-center p-2 border border-accent/30">
                <Icon className="h-7 w-7 text-accent mb-1" />
                <p className="text-[10px] font-heading text-center">{b.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default BadgesShelf;
