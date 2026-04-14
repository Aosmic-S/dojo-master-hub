import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LogOut, Plus, Search, Users, Award, BarChart3, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const BELT_LEVELS = [
  "White", "Yellow", "Orange", "Green", "Blue", "Purple", "Brown 3rd Kyu",
  "Brown 2nd Kyu", "Brown 1st Kyu", "Black 1st Dan", "Black 2nd Dan", "Black 3rd Dan"
];

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({
    full_name: "", belt_level: "White", date_of_birth: "", date_of_joining: "",
    father_name: "", weight_kg: "", contact_number: "", email: "", password: "student123"
  });
  const [dailyReport, setDailyReport] = useState({
    attendance: "present", performance: "", skills_practiced: "", remarks: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setUser(session.user);

      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const userRole = roles?.[0]?.role || "student";
      setRole(userRole);

      if (userRole === "admin") {
        const { data } = await supabase.from("students").select("*").order("full_name");
        setStudents(data || []);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
      else setUser(session.user);
    });
    init();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: newStudent.email, password: newStudent.password,
      });
      if (authErr) throw authErr;

      const { error: insertErr } = await supabase.from("students").insert({
        user_id: authData.user!.id,
        full_name: newStudent.full_name,
        belt_level: newStudent.belt_level,
        date_of_birth: newStudent.date_of_birth || null,
        date_of_joining: newStudent.date_of_joining || new Date().toISOString().split("T")[0],
        father_name: newStudent.father_name,
        weight_kg: newStudent.weight_kg ? parseFloat(newStudent.weight_kg) : null,
        contact_number: newStudent.contact_number,
      });
      if (insertErr) throw insertErr;

      // Add student role
      await supabase.from("user_roles").insert({ user_id: authData.user!.id, role: "student" });

      toast.success("Student added!");
      setShowAddStudent(false);
      setNewStudent({ full_name: "", belt_level: "White", date_of_birth: "", date_of_joining: "", father_name: "", weight_kg: "", contact_number: "", email: "", password: "student123" });
      const { data } = await supabase.from("students").select("*").order("full_name");
      setStudents(data || []);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDailyReport = async (studentId: string) => {
    const { error } = await supabase.from("daily_reports").insert({
      student_id: studentId,
      date: new Date().toISOString().split("T")[0],
      attendance: dailyReport.attendance,
      performance: dailyReport.performance,
      skills_practiced: dailyReport.skills_practiced,
      remarks: dailyReport.remarks,
      sensei_id: user!.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Report saved!");
    setShowDailyReport(null);
    setDailyReport({ attendance: "present", performance: "", skills_practiced: "", remarks: "" });
  };

  const generateWeeklyReport = async (studentId: string) => {
    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekEnd.getDate() - 7);

    const { data: reports } = await supabase.from("daily_reports")
      .select("*")
      .eq("student_id", studentId)
      .gte("date", weekStart.toISOString().split("T")[0])
      .lte("date", weekEnd.toISOString().split("T")[0]);

    if (!reports?.length) { toast.error("No daily reports for this week."); return; }

    const present = reports.filter((r) => r.attendance === "present").length;
    const summary = `Attendance: ${present}/${reports.length} days present.\n\nPerformance Notes:\n${reports.map((r) => `${r.date}: ${r.performance || "N/A"}`).join("\n")}\n\nSkills: ${[...new Set(reports.flatMap((r) => (r.skills_practiced || "").split(",").map((s: string) => s.trim()).filter(Boolean)))].join(", ") || "N/A"}\n\nRemarks: ${reports.map((r) => r.remarks).filter(Boolean).join("; ") || "No remarks."}`;

    const { error } = await supabase.from("weekly_reports").insert({
      student_id: studentId,
      week_start: weekStart.toISOString().split("T")[0],
      week_end: weekEnd.toISOString().split("T")[0],
      summary,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Weekly report generated & pushed!");
  };

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">Loading...</div></Layout>;

  if (role === "student") {
    navigate("/student-profile");
    return null;
  }

  const filteredStudents = students.filter((s) =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.belt_level.toLowerCase().includes(search.toLowerCase())
  );

  const beltDistribution = BELT_LEVELS.map((b) => ({
    belt: b, count: students.filter((s) => s.belt_level === b).length
  })).filter((b) => b.count > 0);

  return (
    <Layout>
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-3xl font-bold">
              ADMIN <span className="text-gold-gradient">DASHBOARD</span>
            </h1>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-border text-muted-foreground">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card-gradient border border-border rounded-lg p-5 flex items-center gap-4">
              <Users className="h-8 w-8 text-accent" />
              <div><p className="text-muted-foreground text-xs">Total Students</p><p className="font-heading text-2xl font-bold">{students.length}</p></div>
            </div>
            <div className="bg-card-gradient border border-border rounded-lg p-5 flex items-center gap-4">
              <Award className="h-8 w-8 text-primary" />
              <div><p className="text-muted-foreground text-xs">Belt Levels</p><p className="font-heading text-2xl font-bold">{beltDistribution.length}</p></div>
            </div>
            <div className="bg-card-gradient border border-border rounded-lg p-5 flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-accent" />
              <div><p className="text-muted-foreground text-xs">Belt Distribution</p>
                <div className="flex gap-1 flex-wrap mt-1">
                  {beltDistribution.slice(0, 4).map((b) => (
                    <span key={b.belt} className="text-[10px] px-1.5 py-0.5 bg-secondary rounded">{b.belt}: {b.count}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Button onClick={() => setShowAddStudent(true)} className="bg-accent text-accent-foreground font-heading hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-1" /> Add Student
            </Button>
          </div>

          {/* Add Student Modal */}
          {showAddStudent && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-heading text-xl font-bold text-gold-gradient">Add New Student</h2>
                  <button onClick={() => setShowAddStudent(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
                </div>
                <form onSubmit={handleAddStudent} className="flex flex-col gap-3">
                  <Input placeholder="Full Name *" value={newStudent.full_name} onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })} required className="bg-secondary border-border" />
                  <Input placeholder="Email (for login) *" type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} required className="bg-secondary border-border" />
                  <Input placeholder="Password *" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} required className="bg-secondary border-border" />
                  <select value={newStudent.belt_level} onChange={(e) => setNewStudent({ ...newStudent, belt_level: e.target.value })} className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                    {BELT_LEVELS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <Input type="date" placeholder="Date of Birth" value={newStudent.date_of_birth} onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })} className="bg-secondary border-border" />
                  <Input type="date" placeholder="Date of Joining" value={newStudent.date_of_joining} onChange={(e) => setNewStudent({ ...newStudent, date_of_joining: e.target.value })} className="bg-secondary border-border" />
                  <Input placeholder="Father's Name" value={newStudent.father_name} onChange={(e) => setNewStudent({ ...newStudent, father_name: e.target.value })} className="bg-secondary border-border" />
                  <Input placeholder="Weight (kg)" type="number" value={newStudent.weight_kg} onChange={(e) => setNewStudent({ ...newStudent, weight_kg: e.target.value })} className="bg-secondary border-border" />
                  <Input placeholder="Contact Number" value={newStudent.contact_number} onChange={(e) => setNewStudent({ ...newStudent, contact_number: e.target.value })} className="bg-secondary border-border" />
                  <Button type="submit" className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">CREATE STUDENT</Button>
                </form>
              </div>
            </div>
          )}

          {/* Daily Report Modal */}
          {showDailyReport && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-heading text-xl font-bold text-gold-gradient">Daily Report</h2>
                  <button onClick={() => setShowDailyReport(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
                </div>
                <div className="flex flex-col gap-3">
                  <select value={dailyReport.attendance} onChange={(e) => setDailyReport({ ...dailyReport, attendance: e.target.value })} className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                  <Input placeholder="Performance Notes" value={dailyReport.performance} onChange={(e) => setDailyReport({ ...dailyReport, performance: e.target.value })} className="bg-secondary border-border" />
                  <Input placeholder="Skills Practiced" value={dailyReport.skills_practiced} onChange={(e) => setDailyReport({ ...dailyReport, skills_practiced: e.target.value })} className="bg-secondary border-border" />
                  <Textarea placeholder="Sensei Remarks" value={dailyReport.remarks} onChange={(e) => setDailyReport({ ...dailyReport, remarks: e.target.value })} className="bg-secondary border-border" />
                  <Button onClick={() => handleDailyReport(showDailyReport)} className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">SAVE REPORT</Button>
                </div>
              </div>
            </div>
          )}

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 px-3 font-heading text-muted-foreground">Name</th>
                  <th className="py-3 px-3 font-heading text-muted-foreground">Belt</th>
                  <th className="py-3 px-3 font-heading text-muted-foreground hidden md:table-cell">Contact</th>
                  <th className="py-3 px-3 font-heading text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-3 font-medium">{s.full_name}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">{s.belt_level}</span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">{s.contact_number || "—"}</td>
                    <td className="py-3 px-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs border-border" onClick={() => setShowDailyReport(s.id)}>
                          Daily Report
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs border-accent text-accent" onClick={() => generateWeeklyReport(s.id)}>
                          Gen Weekly
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <p className="text-center text-muted-foreground py-10">No students found.</p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
