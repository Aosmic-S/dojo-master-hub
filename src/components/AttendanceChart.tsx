import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity } from "lucide-react";

type Range = 7 | 14 | 30;

const AttendanceChart = () => {
  const [range, setRange] = useState<Range>(14);
  const [rows, setRows] = useState<{ date: string; present: number; absent: number }[]>([]);
  const [totals, setTotals] = useState({ present: 0, absent: 0 });

  useEffect(() => {
    const load = async () => {
      const start = new Date();
      start.setDate(start.getDate() - (range - 1));
      const startStr = start.toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_reports")
        .select("date, attendance")
        .gte("date", startStr)
        .order("date");

      const map = new Map<string, { present: number; absent: number }>();
      for (let i = 0; i < range; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        map.set(d.toISOString().split("T")[0], { present: 0, absent: 0 });
      }
      let p = 0;
      let a = 0;
      (data || []).forEach((r) => {
        const slot = map.get(r.date);
        if (!slot) return;
        if (r.attendance === "present") {
          slot.present += 1;
          p += 1;
        } else {
          slot.absent += 1;
          a += 1;
        }
      });
      setTotals({ present: p, absent: a });
      setRows(
        Array.from(map.entries()).map(([date, v]) => ({
          date: new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
          present: v.present,
          absent: v.absent,
        }))
      );
    };
    load();
  }, [range]);

  const rate = useMemo(() => {
    const t = totals.present + totals.absent;
    return t === 0 ? 0 : Math.round((totals.present / t) * 100);
  }, [totals]);

  return (
    <div className="bg-card-gradient border border-border rounded-xl p-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-accent/15 flex items-center justify-center">
            <Activity className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide">Attendance Analytics</h3>
            <p className="text-xs text-muted-foreground">
              {totals.present} present · {totals.absent} absent · <span className="text-accent font-semibold">{rate}%</span> attendance rate
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 bg-secondary/50 rounded-full p-1 border border-border">
          {([7, 14, 30] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-heading uppercase tracking-wide rounded-full transition-colors ${
                range === r ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
            <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="present" name="Present" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" name="Absent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;
