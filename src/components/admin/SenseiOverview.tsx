import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Counter } from "@/components/Reveal";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, Activity, IndianRupee, MessageCircle, Calendar, Award, UserPlus, ArrowRight } from "lucide-react";

type Go = (tab: any) => void;

const iso = (d: Date) => d.toISOString().split("T")[0];

const SenseiOverview = ({ students, onNavigate }: { students: any[]; onNavigate: Go }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 29);
      const month = new Date().toISOString().slice(0, 7);
      const [r, f, m, e, a] = await Promise.all([
        supabase.from("daily_reports").select("student_id, date, attendance").gte("date", iso(since)),
        supabase.from("fee_payments").select("student_id, status, amount").eq("month", month),
        supabase.from("student_messages").select("id", { count: "exact", head: true }).eq("sender_role", "student").eq("is_read", false),
        supabase.from("academy_events").select("id, title, event_date, start_time").gte("event_date", iso(new Date())).order("event_date").limit(4),
        supabase.from("achievements").select("id, title, date, student_id, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      setReports(r.data || []);
      setFees(f.data || []);
      setUnread(m.count || 0);
      setEvents(e.data || []);
      setAchievements(a.data || []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const today = iso(new Date());
    const todays = reports.filter((r) => r.date === today);
    const present30 = reports.filter((r) => r.attendance === "present").length;
    const rate = reports.length ? Math.round((present30 / reports.length) * 100) : 0;
    const paid = fees.filter((f) => f.status === "paid");
    const collected = paid.reduce((s, f) => s + Number(f.amount || 0), 0);
    const paidIds = new Set(paid.map((f) => f.student_id));
    const pending = students.filter((s) => !paidIds.has(s.id)).length;
    const belts = new Map<string, number>();
    students.forEach((s) => belts.set(s.belt_level || "Unknown", (belts.get(s.belt_level || "Unknown") || 0) + 1));
    const monthStart = new Date().toISOString().slice(0, 7);
    const newThisMonth = students.filter((s) => (s.created_at || s.date_of_joining || "").startsWith(monthStart)).length;
    const counts = new Map<string, number>();
    reports.forEach((r) => r.attendance === "present" && counts.set(r.student_id, (counts.get(r.student_id) || 0) + 1));
    const top = students.map((s) => ({ ...s, present: counts.get(s.id) || 0 })).sort((a, b) => b.present - a.present).slice(0, 5);
    return {
      todayPresent: todays.filter((r) => r.attendance === "present").length,
      todayMarked: todays.length,
      rate, collected, paidCount: paid.length, pending,
      belts: Array.from(belts.entries()).sort((a, b) => b[1] - a[1]),
      newThisMonth, top,
    };
  }, [reports, fees, students]);

  const nameOf = (id: string) => students.find((s) => s.id === id)?.full_name || "Student";

  const kpis = [
    { label: "Total students", value: students.length, sub: `${stats.newThisMonth} new this month`, icon: Users, tab: "students" },
    { label: "Attendance · 30d", value: stats.rate, suffix: "%", sub: `Today ${stats.todayPresent}/${stats.todayMarked || 0} present`, icon: Activity, tab: "analytics" },
    { label: "Fees this month", value: stats.collected, prefix: "₹", sub: `${stats.paidCount} paid · ${stats.pending} pending`, icon: IndianRupee, tab: "fees" },
    { label: "Unread messages", value: unread, sub: unread ? "Needs reply" : "All caught up", icon: MessageCircle, tab: "messages" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <Button key={k.label} variant="ghost" onClick={() => onNavigate(k.tab)}
            className="panel h-auto flex-col items-stretch whitespace-normal p-4 sm:p-5 text-left group hover:border-accent/50 transition-colors min-w-0">
            <div className="flex items-center justify-between mb-3">
              <span className="eyebrow leading-tight line-clamp-2 pr-1">{k.label}</span>
              <k.icon className="h-4 w-4 text-accent shrink-0" />
            </div>
            <p className="font-heading text-3xl sm:text-4xl leading-none">
              {k.prefix}{loading ? "—" : <Counter value={k.value} />}{k.suffix}
            </p>
            <p className="text-xs text-muted-foreground mt-2 truncate">{k.sub}</p>
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="panel p-5 lg:col-span-2 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl">Belt distribution</h3>
            <span className="text-xs text-muted-foreground">{students.length} students</span>
          </div>
          {stats.belts.length === 0 ? <p className="text-sm text-muted-foreground">No students yet.</p> : (
            <div className="space-y-3">
              {stats.belts.map(([belt, n]) => (
                <div key={belt}>
                  <div className="flex justify-between text-sm mb-1"><span className="truncate">{belt}</span><span className="text-muted-foreground">{n}</span></div>
                  <Progress value={students.length ? (n / students.length) * 100 : 0} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel p-5 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl">Upcoming events</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("calendar")} className="text-xs text-accent flex items-center gap-1">Calendar <ArrowRight className="h-3 w-3" /></Button>
          </div>
          {events.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming events.</p> : (
            <ul className="space-y-3">
              {events.map((e) => {
                const d = new Date(e.event_date);
                return (
                  <li key={e.id} className="flex gap-3 items-center">
                    <div className="w-12 shrink-0 text-center rounded-md border border-border py-1">
                      <p className="text-[10px] uppercase text-accent">{d.toLocaleDateString("en-IN", { month: "short" })}</p>
                      <p className="font-heading text-xl leading-none">{d.getDate()}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{e.title}</p>
                      {e.start_time && <p className="text-xs text-muted-foreground">{e.start_time.slice(0, 5)}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel p-5 min-w-0">
          <h3 className="text-xl mb-4">Top attendance · 30 days</h3>
          {stats.top.length === 0 ? <p className="text-sm text-muted-foreground">No data yet.</p> : (
            <ul className="space-y-2">
              {stats.top.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3">
                  <span className="w-5 text-center font-heading text-accent">{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xs shrink-0">
                    {s.profile_photo_url ? <img src={s.profile_photo_url} alt="" className="w-full h-full object-cover" loading="lazy" /> : s.full_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{s.full_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{s.belt_level}</p>
                  </div>
                  <span className="text-sm font-heading">{s.present} days</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel p-5 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl">Recent achievements</h3>
            <Award className="h-4 w-4 text-accent" />
          </div>
          {achievements.length === 0 ? <p className="text-sm text-muted-foreground">No achievements recorded yet.</p> : (
            <ul className="space-y-3">
              {achievements.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <Award className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{nameOf(a.student_id)}{a.date ? ` · ${new Date(a.date).toLocaleDateString("en-IN")}` : ""}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: "Manage students", i: UserPlus, t: "students" },
          { l: "Attendance chart", i: Activity, t: "analytics" },
          { l: "Plan event", i: Calendar, t: "calendar" },
          { l: "Collect fees", i: IndianRupee, t: "fees" },
        ].map((q) => (
          <Button key={q.l} variant="ghost" onClick={() => onNavigate(q.t)} className="panel p-3 flex items-center justify-start gap-2 text-sm hover:border-accent/50 transition-colors min-h-[48px]">
            <q.i className="h-4 w-4 text-accent shrink-0" /> <span className="truncate">{q.l}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SenseiOverview;
