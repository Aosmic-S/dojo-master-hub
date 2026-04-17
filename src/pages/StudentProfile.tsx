import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Award, Calendar, FileText, Megaphone, FileDown } from "lucide-react";
import { generateWeeklyReportPDF } from "@/lib/weeklyReportPdf";

const StudentProfile = () => {
  const [student, setStudent] = useState<any>(null);
  const [weeklyReports, setWeeklyReports] = useState<any[]>([]);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
    });

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const { data: studentData } = await supabase.from("students").select("*").eq("user_id", session.user.id).maybeSingle();
      if (!studentData) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
        if (roles?.[0]?.role === "admin") { navigate("/dashboard"); return; }
      }
      setStudent(studentData);

      if (studentData) {
        const [weeklyRes, dailyRes, achRes, annRes] = await Promise.all([
          supabase.from("weekly_reports").select("*").eq("student_id", studentData.id).order("pushed_at", { ascending: false }),
          supabase.from("daily_reports").select("*").eq("student_id", studentData.id).order("date", { ascending: false }).limit(30),
          supabase.from("achievements").select("*").eq("student_id", studentData.id).order("date", { ascending: false }),
          supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(10),
        ]);
        setWeeklyReports(weeklyRes.data || []);
        setDailyReports(dailyRes.data || []);
        setAchievements(achRes.data || []);
        setAnnouncements(annRes.data || []);
      }
      setLoading(false);
    };
    init();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">Loading...</div></Layout>;
  if (!student) return <Layout><div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">Profile not found.</div></Layout>;

  const presentDays = dailyReports.filter((r) => r.attendance === "present").length;

  return (
    <Layout>
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-3xl font-bold">MY <span className="text-gold-gradient">PROFILE</span></h1>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-border text-muted-foreground">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>

          {/* Profile Card */}
          <div className="bg-card-gradient border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center">
                {student.profile_photo_url ? (
                  <img src={student.profile_photo_url} alt={student.full_name} className="w-full h-full object-cover" />
                ) : <User className="h-8 w-8 text-primary" />}
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold">{student.full_name}</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent font-medium">{student.belt_level} Belt</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Father's Name</p><p className="font-medium">{student.father_name || "—"}</p></div>
              <div><p className="text-muted-foreground text-xs">Date of Birth</p><p className="font-medium">{student.date_of_birth || "—"}</p></div>
              <div><p className="text-muted-foreground text-xs">Date of Joining</p><p className="font-medium">{student.date_of_joining || "—"}</p></div>
              <div><p className="text-muted-foreground text-xs">Weight</p><p className="font-medium">{student.weight_kg ? `${student.weight_kg} kg` : "—"}</p></div>
              <div><p className="text-muted-foreground text-xs">Contact</p><p className="font-medium">{student.contact_number || "—"}</p></div>
            </div>
          </div>

          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="bg-card-gradient border border-accent/30 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="h-5 w-5 text-accent" />
                <h3 className="font-heading text-lg font-semibold">Announcements</h3>
              </div>
              <div className="flex flex-col gap-3">
                {announcements.map((a) => (
                  <div key={a.id} className="bg-secondary rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-heading text-sm font-semibold">{a.title}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded">{a.target_batch}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance */}
          <div className="bg-card-gradient border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-accent" />
              <h3 className="font-heading text-lg font-semibold">Attendance (Last 30 entries)</h3>
            </div>
            <div className="flex gap-6">
              <div><span className="text-2xl font-heading font-bold text-accent">{presentDays}</span><span className="text-muted-foreground text-sm ml-1">Present</span></div>
              <div><span className="text-2xl font-heading font-bold text-primary">{dailyReports.length - presentDays}</span><span className="text-muted-foreground text-sm ml-1">Absent</span></div>
            </div>
          </div>

          {/* Weekly Reports */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-accent" />
              <h3 className="font-heading text-lg font-semibold">Weekly Reports</h3>
            </div>
            {weeklyReports.length === 0 ? (
              <p className="text-muted-foreground text-sm">No weekly reports yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {weeklyReports.map((r) => (
                  <div key={r.id} className="bg-card-gradient border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-xs text-accent font-heading">{r.week_start} — {r.week_end}</p>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-accent text-accent" onClick={async () => {
                        const { data: dailies } = await supabase.from("daily_reports").select("*")
                          .eq("student_id", student.id).gte("date", r.week_start).lte("date", r.week_end).order("date");
                        generateWeeklyReportPDF({ student, weekStart: r.week_start, weekEnd: r.week_end, summary: r.summary || "", dailyReports: dailies || [] });
                      }}>
                        <FileDown className="h-3 w-3 mr-1" /> PDF
                      </Button>
                    </div>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-body">{r.summary}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-accent" />
              <h3 className="font-heading text-lg font-semibold">Achievements</h3>
            </div>
            {achievements.length === 0 ? (
              <p className="text-muted-foreground text-sm">Achievements will appear here once added by your Sensei.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {achievements.map((a) => (
                  <div key={a.id} className="bg-card-gradient border border-border rounded-lg p-4">
                    <h4 className="font-heading text-sm font-semibold">{a.title}</h4>
                    <p className="text-muted-foreground text-xs">{a.description} {a.date && `• ${a.date}`}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default StudentProfile;
