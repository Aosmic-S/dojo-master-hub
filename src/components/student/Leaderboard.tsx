import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

const Leaderboard = ({ currentStudentId }: { currentStudentId: string }) => {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const sinceISO = since.toISOString().split("T")[0];

      const { data: students } = await supabase.from("students").select("id, full_name, belt_level, profile_photo_url, roll_no");
      const { data: reports } = await supabase.from("daily_reports").select("student_id, attendance").gte("date", sinceISO);

      const counts = new Map<string, number>();
      (reports || []).forEach((r: any) => {
        if (r.attendance === "present") counts.set(r.student_id, (counts.get(r.student_id) || 0) + 1);
      });

      const merged = (students || []).map(s => ({ ...s, present: counts.get(s.id) || 0 }))
        .sort((a, b) => b.present - a.present).slice(0, 10);
      setRows(merged);
    })();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="bg-card-gradient border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-accent" />
        <h3 className="font-heading text-lg font-semibold">30-Day Attendance Leaderboard</h3>
      </div>
      {rows.length === 0 ? <p className="text-muted-foreground text-sm">No data yet.</p> : (
        <div className="flex flex-col gap-1">
          {rows.map((r, i) => (
            <div key={r.id} className={`flex items-center gap-3 p-2 rounded-lg ${r.id === currentStudentId ? "bg-accent/15 border border-accent/40" : "hover:bg-secondary/50"}`}>
              <span className="w-7 text-center font-heading text-sm">{medals[i] || `#${i + 1}`}</span>
              <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xs">
                {r.profile_photo_url ? <img src={r.profile_photo_url} className="w-full h-full object-cover" alt="" /> : r.full_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.full_name} {r.id === currentStudentId && <span className="text-accent text-[10px]">(You)</span>}</p>
                <p className="text-[10px] text-muted-foreground">{r.belt_level}</p>
              </div>
              <span className="font-heading text-accent text-sm">{r.present} days</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Leaderboard;
