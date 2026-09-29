import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Award, Calendar, FileText, Megaphone, FileDown, BookOpen, Target, Library, Trophy, MessageCircle, CalendarCheck, LayoutGrid, Activity } from "lucide-react";
import { generateWeeklyReportPDF } from "@/lib/weeklyReportPdf";
import { useAuthReady } from "@/hooks/useAuthReady";
import EventsCalendar from "@/components/EventsCalendar";
import TrainingJournal from "@/components/student/TrainingJournal";
import GoalsTracker from "@/components/student/GoalsTracker";
import BeltRoadmap from "@/components/student/BeltRoadmap";
import TechniqueLibrary from "@/components/student/TechniqueLibrary";
import AttendanceHeatmap from "@/components/student/AttendanceHeatmap";
import Leaderboard from "@/components/student/Leaderboard";
import MessageSensei from "@/components/student/MessageSensei";
import EventRsvp from "@/components/student/EventRsvp";
import BadgesShelf from "@/components/student/BadgesShelf";
import PhotoUpload from "@/components/student/PhotoUpload";
import StudentFees from "@/components/student/StudentFees";
import { Counter } from "@/components/Reveal";
import { Progress } from "@/components/ui/progress";

type Tab = "overview" | "journal" | "goals" | "roadmap" | "library" | "heatmap" | "leaderboard" | "messages" | "events" | "badges" | "fees";

const StudentProfile = () => {
  const [student, setStudent] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [weeklyReports, setWeeklyReports] = useState<any[]>([]);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const navigate = useNavigate();
  const { user, isReady } = useAuthReady();

  useEffect(() => {
    if (!isReady) return;
    if (!user) { navigate("/login"); return; }
    let cancelled = false;
    (async () => {
      const { data: studentData } = await supabase.from("students").select("*").eq("user_id", user.id).maybeSingle();
      if (cancelled) return;
      if (!studentData) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        if (roles?.[0]?.role === "admin") { navigate("/dashboard"); return; }
      }
      setStudent(studentData);
      setPhotoUrl(studentData?.profile_photo_url || "");
      if (studentData) {
        const [weeklyRes, dailyRes, achRes, annRes] = await Promise.all([
          supabase.from("weekly_reports").select("*").eq("student_id", studentData.id).order("pushed_at", { ascending: false }),
          supabase.from("daily_reports").select("*").eq("student_id", studentData.id).order("date", { ascending: false }).limit(30),
          supabase.from("achievements").select("*").eq("student_id", studentData.id).order("date", { ascending: false }),
          supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(10),
        ]);
        if (cancelled) return;
        setWeeklyReports(weeklyRes.data || []);
        setDailyReports(dailyRes.data || []);
        setAchievements(achRes.data || []);
        setAnnouncements(annRes.data || []);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isReady, user, navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">Loading...</div></Layout>;
  if (!student) return <Layout><div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">Profile not found.</div></Layout>;

  const presentDays = dailyReports.filter((r) => r.attendance === "present").length;

  const attPct = dailyReports.length ? Math.round((presentDays / dailyReports.length) * 100) : 0;
  let streak = 0;
  for (const r of dailyReports) { if (r.attendance === "present") streak++; else break; }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "journal", label: "Journal", icon: BookOpen },
    { key: "goals", label: "Goals", icon: Target },
    { key: "roadmap", label: "Belt Path", icon: Award },
    { key: "library", label: "Techniques", icon: Library },
    { key: "heatmap", label: "Attendance", icon: Activity },
    { key: "leaderboard", label: "Leaderboard", icon: Trophy },
    { key: "events", label: "Events", icon: CalendarCheck },
    { key: "messages", label: "Messages", icon: MessageCircle },
    { key: "badges", label: "Badges", icon: Award },
    { key: "fees", label: "Fees", icon: FileText },
  ];

  return (
    <Layout>
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading text-3xl font-bold">MY <span className="text-gold-gradient">PROFILE</span></h1>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-border text-muted-foreground">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>

          {/* Profile Card */}
          <div className="bg-card-gradient border border-border rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center ring-2 ring-accent/40">
                {photoUrl ? (
                  <img src={photoUrl} alt={student.full_name} className="w-full h-full object-cover" />
                ) : <User className="h-10 w-10 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-accent font-heading uppercase tracking-wider">Roll No: {student.roll_no || "—"}</p>
                <h2 className="font-heading text-2xl font-bold truncate">{student.full_name}</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent font-medium">{student.belt_level} Belt</span>
                <div className="mt-2"><PhotoUpload studentId={student.id} currentUrl={photoUrl} onUpdate={setPhotoUrl} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm pt-4 border-t border-border">
              <div><p className="text-muted-foreground text-xs">Father's Name</p><p className="font-medium">{student.father_name || "—"}</p></div>
              <div><p className="text-muted-foreground text-xs">Date of Birth</p><p className="font-medium">{student.date_of_birth || "—"}</p></div>
              <div><p className="text-muted-foreground text-xs">Date of Joining</p><p className="font-medium">{student.date_of_joining || "—"}</p></div>
              <div><p className="text-muted-foreground text-xs">Weight</p><p className="font-medium">{student.weight_kg ? `${student.weight_kg} kg` : "—"}</p></div>
              <div><p className="text-muted-foreground text-xs">Contact</p><p className="font-medium">{student.contact_number || "—"}</p></div>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:flex lg:flex-wrap gap-2 mb-6">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2 px-2 lg:px-4 py-2.5 min-h-[56px] lg:min-h-[40px] rounded-lg text-[11px] sm:text-xs lg:text-sm font-heading uppercase tracking-wide text-center leading-tight transition-all border ${
                  tab === t.key ? "bg-accent text-accent-foreground border-accent shadow-[0_0_16px_-6px_hsl(var(--accent))]" : "bg-secondary/40 text-muted-foreground hover:text-foreground border-border"
                }`}>
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="flex flex-col gap-6">
              {announcements.length > 0 && (
                <div className="bg-card-gradient border border-accent/30 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3"><Megaphone className="h-5 w-5 text-accent" /><h3 className="font-heading text-lg font-semibold">Announcements</h3></div>
                  <div className="flex flex-col gap-2">
                    {announcements.slice(0, 3).map((a) => (
                      <div key={a.id} className="bg-secondary rounded-lg p-3">
                        <h4 className="font-heading text-sm font-semibold">{a.title}</h4>
                        <p className="text-muted-foreground text-sm">{a.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { l: "Belt", v: null, t: student.belt_level },
                  { l: "Attendance (30d)", v: presentDays, s: `/${dailyReports.length}` },
                  { l: "Current streak", v: streak, s: " days" },
                  { l: "Achievements", v: achievements.length },
                ].map((m) => (
                  <div key={m.l} className="panel p-4">
                    <p className="eyebrow mb-1">{m.l}</p>
                    <p className="font-heading text-4xl leading-none">{m.v === null ? m.t : <><Counter value={m.v as number} /><span className="text-lg text-muted-foreground">{m.s}</span></>}</p>
                  </div>
                ))}
              </div>
              <div className="panel p-4">
                <div className="flex justify-between mb-2"><p className="eyebrow">Attendance rate</p><p className="text-sm text-accent font-semibold">{attPct}%</p></div>
                <Progress value={attPct} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3"><FileText className="h-5 w-5 text-accent" /><h3 className="font-heading text-lg font-semibold">Weekly Reports</h3></div>
                {weeklyReports.length === 0 ? <p className="text-muted-foreground text-sm">No reports yet.</p> : (
                  <div className="flex flex-col gap-2">
                    {weeklyReports.map((r) => (
                      <div key={r.id} className="bg-card-gradient border border-border rounded-lg p-3 flex justify-between items-center">
                        <p className="text-xs text-accent font-heading">{r.week_start} → {r.week_end}</p>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-accent text-accent" onClick={async () => {
                          const { data: dailies } = await supabase.from("daily_reports").select("*")
                            .eq("student_id", student.id).gte("date", r.week_start).lte("date", r.week_end).order("date");
                          generateWeeklyReportPDF({ student, weekStart: r.week_start, weekEnd: r.week_end, summary: r.summary || "", dailyReports: dailies || [] });
                        }}><FileDown className="h-3 w-3 mr-1" /> PDF</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3"><Award className="h-5 w-5 text-accent" /><h3 className="font-heading text-lg font-semibold">Achievements</h3></div>
                {achievements.length === 0 ? <p className="text-muted-foreground text-sm">No achievements yet.</p> : (
                  <div className="flex flex-col gap-2">
                    {achievements.map((a) => (
                      <div key={a.id} className="unlock bg-card-gradient border border-border rounded-lg p-3">
                        <h4 className="font-heading text-sm font-semibold">{a.title}</h4>
                        <p className="text-muted-foreground text-xs">{a.description} {a.date && `• ${a.date}`}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "journal" && <TrainingJournal studentId={student.id} />}
          {tab === "goals" && <GoalsTracker studentId={student.id} />}
          {tab === "roadmap" && <BeltRoadmap currentBelt={student.belt_level} />}
          {tab === "library" && <TechniqueLibrary />}
          {tab === "heatmap" && <AttendanceHeatmap studentId={student.id} />}
          {tab === "leaderboard" && <Leaderboard currentStudentId={student.id} />}
          {tab === "events" && (
            <div className="flex flex-col gap-6">
              <EventRsvp studentId={student.id} />
              <EventsCalendar canManage={false} />
            </div>
          )}
          {tab === "messages" && <MessageSensei studentId={student.id} />}
          {tab === "fees" && <StudentFees studentId={student.id} />}
          {tab === "badges" && <BadgesShelf studentId={student.id} attendance={presentDays} achievementsCount={achievements.length} />}
        </div>
      </section>
    </Layout>
  );
};

export default StudentProfile;
