import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Award, Calendar, FileText } from "lucide-react";

const StudentProfile = () => {
  const [student, setStudent] = useState<any>(null);
  const [weeklyReports, setWeeklyReports] = useState<any[]>([]);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!studentData) {
        // Check if admin
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
        if (roles?.[0]?.role === "admin") { navigate("/dashboard"); return; }
      }

      setStudent(studentData);

      if (studentData) {
        const { data: weekly } = await supabase
          .from("weekly_reports")
          .select("*")
          .eq("student_id", studentData.id)
          .order("pushed_at", { ascending: false });
        setWeeklyReports(weekly || []);

        const { data: daily } = await supabase
          .from("daily_reports")
          .select("*")
          .eq("student_id", studentData.id)
          .order("date", { ascending: false })
          .limit(30);
        setDailyReports(daily || []);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
    });
    init();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">Loading...</div></Layout>;

  if (!student) return <Layout><div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">Profile not found.</div></Layout>;

  const presentDays = dailyReports.filter((r) => r.attendance === "present").length;

  return (
    <Layout>
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-3xl font-bold">
              MY <span className="text-gold-gradient">PROFILE</span>
            </h1>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-border text-muted-foreground">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>

          {/* Profile Card */}
          <div className="bg-card-gradient border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
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

          {/* Attendance Summary */}
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
                    <p className="text-xs text-accent font-heading mb-2">
                      {r.week_start} — {r.week_end}
                    </p>
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
            <p className="text-muted-foreground text-sm">Achievements will appear here once added by your Sensei.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default StudentProfile;
