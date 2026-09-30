import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LogOut, Plus, Search, Users, Award, BarChart3, X, Trash2, Edit, Image, Shield, Camera, Megaphone, Settings, Save, FileDown, TrendingUp, Activity, Calendar, MessageCircle, RefreshCw, AlertTriangle, IndianRupee } from "lucide-react";
import { generateWeeklyReportPDF } from "@/lib/weeklyReportPdf";
import { useAuthReady } from "@/hooks/useAuthReady";
import AttendanceChart from "@/components/AttendanceChart";
import EventsCalendar from "@/components/EventsCalendar";
import AdminMessagesInbox from "@/components/admin/AdminMessagesInbox";
import AdminFees from "@/components/admin/AdminFees";
import SenseiOverview from "@/components/admin/SenseiOverview";

const BELT_LEVELS = [
  "White", "Yellow", "Orange", "Green", "Blue", "Purple", "Brown 4th Kyu", "Brown 3rd Kyu",
  "Brown 2nd Kyu", "Brown 1st Kyu", "Black 1st Dan", "Black 2nd Dan", "Black 3rd Dan"
];

type Tab = "overview" | "students" | "fees" | "analytics" | "calendar" | "messages" | "achievements" | "gallery" | "timings" | "announcements" | "settings";

const Dashboard = () => {
  const { user, isReady } = useAuthReady();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState<string | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState<any>(null);
  const [showEditStudent, setShowEditStudent] = useState<any>(null);
  const [showAddAchievement, setShowAddAchievement] = useState<string | null>(null);
  const [showAddAcademyAchievement, setShowAddAcademyAchievement] = useState(false);
  const [showAddGallery, setShowAddGallery] = useState(false);
  const [showEditTimings, setShowEditTimings] = useState(false);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [showPromoteStudent, setShowPromoteStudent] = useState<any>(null);
  const [resyncing, setResyncing] = useState(false);
  const [showFormat, setShowFormat] = useState(false);

  // Data
  const [academyAchievements, setAcademyAchievements] = useState<any[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [timings, setTimings] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [studentAchievements, setStudentAchievements] = useState<any[]>([]);
  const [studentWeeklyReports, setStudentWeeklyReports] = useState<any[]>([]);

  // Forms
  const [newStudent, setNewStudent] = useState({
    full_name: "", belt_level: "White", date_of_birth: "", date_of_joining: "",
    father_name: "", weight_kg: "", contact_number: "", roll_no: ""
  });
  const [dailyReport, setDailyReport] = useState({
    attendance: "present", performance: "", skills_practiced: "", remarks: ""
  });
  const [newAchievement, setNewAchievement] = useState({ title: "", description: "", date: "" });
  const [newAcademyAch, setNewAcademyAch] = useState({ title: "", description: "", year: new Date().getFullYear().toString(), icon_type: "trophy" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", message: "", target_batch: "all" });
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Edit student form
  const [editForm, setEditForm] = useState({
    full_name: "", belt_level: "White", date_of_birth: "", date_of_joining: "",
    father_name: "", weight_kg: "", contact_number: "", roll_no: ""
  });

  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    const [studentsRes, achRes, galleryRes, timingsRes, feesRes, annRes] = await Promise.all([
      supabase.from("students").select("*").order("full_name"),
      supabase.from("academy_achievements").select("*").order("year", { ascending: false }),
      supabase.from("gallery_photos").select("*").order("display_order"),
      supabase.from("timings").select("*").order("display_order"),
      supabase.from("fees").select("*").order("display_order"),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
    ]);
    setStudents(studentsRes.data || []);
    setAcademyAchievements(achRes.data || []);
    setGalleryPhotos(galleryRes.data || []);
    setTimings(timingsRes.data || []);
    setFees(feesRes.data || []);
    setAnnouncements(annRes.data || []);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!user) { navigate("/login"); return; }
    let cancelled = false;
    (async () => {
      setAdminEmail(user.email || "");
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (cancelled) return;
      const userRole = roles?.some((r) => r.role === "admin") ? "admin" : "student";
      setRole(userRole);
      if (userRole === "admin") await loadData();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isReady, user, navigate, loadData]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await supabase.functions.invoke("create-student", {
        body: newStudent,
      });
      if (res.error) throw new Error(res.error.message);
      if (!res.data?.ok) throw new Error(res.data?.error || "Failed to create student");
      toast.success(`Student added! Roll No: ${res.data.roll_no}. Login with Roll No + DOB.`);
      setShowAddStudent(false);
      setNewStudent({ full_name: "", belt_level: "White", date_of_birth: "", date_of_joining: "", father_name: "", weight_kg: "", contact_number: "", roll_no: "" });
      await loadData();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDailyReport = async (studentId: string) => {
    const { error } = await supabase.from("daily_reports").insert({
      student_id: studentId, date: new Date().toISOString().split("T")[0],
      attendance: dailyReport.attendance, performance: dailyReport.performance,
      skills_practiced: dailyReport.skills_practiced, remarks: dailyReport.remarks,
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
    const { data: reports } = await supabase.from("daily_reports").select("*")
      .eq("student_id", studentId)
      .gte("date", weekStart.toISOString().split("T")[0])
      .lte("date", weekEnd.toISOString().split("T")[0])
      .order("date");
    if (!reports?.length) { toast.error("No daily reports for this week."); return; }
    const present = reports.filter((r) => r.attendance === "present").length;
    const summary = `Attendance: ${present}/${reports.length} days present.\n\nPerformance Notes:\n${reports.map((r) => `${r.date}: ${r.performance || "N/A"}`).join("\n")}\n\nSkills: ${[...new Set(reports.flatMap((r) => (r.skills_practiced || "").split(",").map((s: string) => s.trim()).filter(Boolean)))].join(", ") || "N/A"}\n\nRemarks: ${reports.map((r) => r.remarks).filter(Boolean).join("; ") || "No remarks."}`;
    const ws = weekStart.toISOString().split("T")[0];
    const we = weekEnd.toISOString().split("T")[0];
    const { error } = await supabase.from("weekly_reports").insert({
      student_id: studentId, week_start: ws, week_end: we, summary,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Weekly report generated, pushed & PDF downloaded!");
    const student = students.find((s) => s.id === studentId);
    if (student) generateWeeklyReportPDF({ student, weekStart: ws, weekEnd: we, summary, dailyReports: reports });
  };

  const downloadWeeklyPDF = async (studentId: string, report: any) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const { data: dailies } = await supabase.from("daily_reports").select("*")
      .eq("student_id", studentId)
      .gte("date", report.week_start)
      .lte("date", report.week_end)
      .order("date");
    generateWeeklyReportPDF({
      student, weekStart: report.week_start, weekEnd: report.week_end,
      summary: report.summary || "", dailyReports: dailies || [],
    });
  };

  // Profile photo upload
  const handlePhotoUpload = async (studentId: string, file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${studentId}.${ext}`;
    const { error: upErr } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: true });
    if (upErr) { toast.error(upErr.message); return; }
    const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(path);
    const { error: updateErr } = await supabase.from("students").update({ profile_photo_url: urlData.publicUrl }).eq("id", studentId);
    if (updateErr) { toast.error(updateErr.message); return; }
    toast.success("Photo uploaded!");
    await loadData();
  };

  // Student achievements
  const loadStudentAchievements = async (studentId: string) => {
    const [achRes, weekRes] = await Promise.all([
      supabase.from("achievements").select("*").eq("student_id", studentId).order("date", { ascending: false }),
      supabase.from("weekly_reports").select("*").eq("student_id", studentId).order("pushed_at", { ascending: false }),
    ]);
    setStudentAchievements(achRes.data || []);
    setStudentWeeklyReports(weekRes.data || []);
  };

  const handleAddStudentAchievement = async (studentId: string) => {
    const { error } = await supabase.from("achievements").insert({
      student_id: studentId, title: newAchievement.title,
      description: newAchievement.description || null, date: newAchievement.date || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Achievement added!");
    setNewAchievement({ title: "", description: "", date: "" });
    setShowAddAchievement(null);
    await loadStudentAchievements(studentId);
  };

  const deleteStudentAchievement = async (id: string, studentId: string) => {
    await supabase.from("achievements").delete().eq("id", id);
    toast.success("Deleted");
    await loadStudentAchievements(studentId);
  };

  // Academy achievements
  const handleAddAcademyAchievement = async () => {
    const { error } = await supabase.from("academy_achievements").insert(newAcademyAch);
    if (error) { toast.error(error.message); return; }
    toast.success("Achievement added!");
    setNewAcademyAch({ title: "", description: "", year: new Date().getFullYear().toString(), icon_type: "trophy" });
    setShowAddAcademyAchievement(false);
    await loadData();
  };

  const deleteAcademyAchievement = async (id: string) => {
    await supabase.from("academy_achievements").delete().eq("id", id);
    toast.success("Deleted");
    await loadData();
  };

  // Gallery
  const handleGalleryUpload = async (file: File, category: string, alt: string) => {
    const path = `${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("gallery").upload(path, file);
    if (upErr) { toast.error(upErr.message); return; }
    const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
    const { error } = await supabase.from("gallery_photos").insert({
      image_url: urlData.publicUrl, category, alt_text: alt,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Photo added!");
    setShowAddGallery(false);
    await loadData();
  };

  const deleteGalleryPhoto = async (id: string, url: string) => {
    const path = url.split("/gallery/")[1];
    if (path) await supabase.storage.from("gallery").remove([path]);
    await supabase.from("gallery_photos").delete().eq("id", id);
    toast.success("Deleted");
    await loadData();
  };

  // Timings/Fees
  const saveTimings = async (items: any[]) => {
    for (const item of items) {
      await supabase.from("timings").update({
        batch_name: item.batch_name, time_slot: item.time_slot, days: item.days
      }).eq("id", item.id);
    }
    toast.success("Timings updated!");
    setShowEditTimings(false);
    await loadData();
  };

  const saveFee = async (id: string, plan_name: string, price: string, note: string) => {
    await supabase.from("fees").update({ plan_name, price, note }).eq("id", id);
    toast.success("Fee updated!");
    await loadData();
  };

  // Announcements
  const handleAddAnnouncement = async () => {
    const { error } = await supabase.from("announcements").insert({
      ...newAnnouncement, created_by: user!.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Announcement posted!");
    setNewAnnouncement({ title: "", message: "", target_batch: "all" });
    setShowAddAnnouncement(false);
    await loadData();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    toast.success("Deleted");
    await loadData();
  };

  // Admin settings
  const updateAdminEmail = async () => {
    const { error } = await supabase.auth.updateUser({ email: adminEmail });
    if (error) toast.error(error.message);
    else toast.success("Email update requested. Check your inbox.");
  };

  const updateAdminPassword = async () => {
    if (!adminPassword || adminPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: adminPassword });
    if (error) toast.error(error.message);
    else { toast.success("Password updated!"); setAdminPassword(""); }
  };

  // Promote student to admin
  const promoteToAdmin = async (studentUserId: string) => {
    const { error } = await supabase.from("user_roles").upsert({ user_id: studentUserId, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
    if (error) toast.error(error.message);
    else { toast.success("Promoted to admin!"); setShowPromoteStudent(null); }
  };

  // Edit student profile
  const openEditStudent = (student: any) => {
    setEditForm({
      full_name: student.full_name || "",
      belt_level: student.belt_level || "White",
      date_of_birth: student.date_of_birth || "",
      date_of_joining: student.date_of_joining || "",
      father_name: student.father_name || "",
      weight_kg: student.weight_kg ? String(student.weight_kg) : "",
      contact_number: student.contact_number || "",
      roll_no: student.roll_no || "",
    });
    setShowEditStudent(student);
  };

  const handleEditStudent = async () => {
    if (!showEditStudent) return;
    const newRoll = editForm.roll_no.trim().toUpperCase();
    const oldRoll = (showEditStudent.roll_no || "").toUpperCase();
    const { error } = await supabase.from("students").update({
      full_name: editForm.full_name,
      belt_level: editForm.belt_level,
      date_of_birth: editForm.date_of_birth || null,
      date_of_joining: editForm.date_of_joining || null,
      father_name: editForm.father_name || null,
      weight_kg: editForm.weight_kg ? parseFloat(editForm.weight_kg) : null,
      contact_number: editForm.contact_number || null,
      roll_no: newRoll || null,
    }).eq("id", showEditStudent.id);
    if (error) { toast.error(error.message); return; }
    // If roll changed, also update the student's auth login email so they can log in with new roll
    if (newRoll && newRoll !== oldRoll && showEditStudent.user_id) {
      try {
        await supabase.functions.invoke("update-student-roll", {
          body: { user_id: showEditStudent.user_id, new_roll: newRoll },
        });
      } catch { /* non-fatal */ }
    }
    toast.success("Student updated!");
    setShowEditStudent(null);
    setShowStudentDetail(null);
    await loadData();
  };

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">Loading...</div></Layout>;
  if (role === "student") { navigate("/student-profile"); return null; }

  const filteredStudents = students.filter((s) =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.belt_level.toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_no || "").toLowerCase().includes(search.toLowerCase())
  );

  const beltDistribution = BELT_LEVELS.map((b) => ({
    belt: b, count: students.filter((s) => s.belt_level === b).length
  })).filter((b) => b.count > 0);

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "students", label: "Students", icon: Users },
    { key: "analytics", label: "Analytics", icon: Activity },
    { key: "calendar", label: "Calendar", icon: Calendar },
    { key: "messages", label: "Messages", icon: MessageCircle },
    { key: "fees", label: "Fees", icon: IndianRupee },
    { key: "achievements", label: "Achievements", icon: Award },
    { key: "gallery", label: "Gallery", icon: Image },
    { key: "timings", label: "Timings & Fees", icon: BarChart3 },
    { key: "announcements", label: "Announcements", icon: Megaphone },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  // Extra stats
  const blackBelts = students.filter((s) => s.belt_level.startsWith("Black")).length;
  const newThisMonth = students.filter((s) => {
    if (!s.created_at) return false;
    const d = new Date(s.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <Layout>
      <section className="py-6 sm:py-10">
        <div className="container mx-auto px-4">
          {/* Header / Welcome */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card-gradient p-6 sm:p-8 mb-8">
            <div className="absolute inset-0 bg-hero-gradient opacity-40 pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent font-heading mb-2">Sensei Console</p>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold leading-tight">
                  ADMIN <span className="text-gold-gradient">DASHBOARD</span>
                </h1>
                <p className="text-muted-foreground text-sm mt-2">Welcome back, {user?.email?.split("@")[0]}. Manage the dojo from one place.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-border text-muted-foreground self-start sm:self-auto">
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:flex lg:flex-wrap gap-2 mb-8">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2 px-2 lg:px-4 py-2.5 min-h-[56px] lg:min-h-[40px] rounded-lg lg:rounded-full text-[11px] sm:text-xs lg:text-sm font-heading uppercase tracking-wide text-center leading-tight transition-all border ${activeTab === t.key
                  ? "bg-accent text-accent-foreground border-accent gold-glow"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground border-border hover:border-accent/50"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && <SenseiOverview students={students} onNavigate={setActiveTab} />}

          {/* ============ STUDENTS TAB ============ */}
          {activeTab === "students" && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard icon={Users} label="Total Students" value={students.length} accent="accent" />
                <KpiCard icon={Shield} label="Black Belts" value={blackBelts} accent="primary" />
                <KpiCard icon={TrendingUp} label="New This Month" value={newThisMonth} accent="accent" />
                <KpiCard icon={Activity} label="Belt Levels Active" value={beltDistribution.length} accent="primary" />
              </div>

              {/* Belt distribution strip */}
              {beltDistribution.length > 0 && (
                <div className="bg-card-gradient border border-border rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    <h3 className="font-heading text-sm font-semibold uppercase tracking-wide">Belt Distribution</h3>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {beltDistribution.map((b) => (
                      <span key={b.belt} className="text-xs px-3 py-1.5 bg-secondary border border-border rounded-full">
                        <span className="text-muted-foreground">{b.belt}:</span> <span className="text-accent font-semibold ml-1">{b.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-card-gradient border border-border rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or belt…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-border h-11" />
                  </div>
                  <Button onClick={() => setShowAddStudent(true)} className="bg-accent text-accent-foreground font-heading hover:bg-accent/90 h-11 px-5">
                    <Plus className="h-4 w-4 mr-1" /> Add Student
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!confirm("Resync ALL students' login credentials to Roll No + DOB? This will reset every student's password to their date of birth.")) return;
                      setResyncing(true);
                      const { data, error } = await supabase.functions.invoke("resync-student-auth", { body: { all: true } });
                      setResyncing(false);
                      if (error) return toast.error(error.message);
                      const failed = (data?.results || []).filter((r: any) => !r.ok);
                      if (failed.length === 0) toast.success(`Resynced ${data?.count || 0} students`);
                      else toast.warning(`Resynced ${data?.count - failed.length}/${data?.count}. ${failed.length} failed.`);
                    }}
                    disabled={resyncing}
                    variant="outline"
                    className="border-border h-11 px-4"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${resyncing ? "animate-spin" : ""}`} /> Resync All
                  </Button>
                  <Button
                    onClick={() => setShowFormat(true)}
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 h-11 px-4"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" /> Format
                  </Button>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto -mx-4 sm:-mx-6">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-border text-left bg-secondary/30">
                        <th className="py-3 px-4 font-heading text-xs uppercase tracking-wider text-muted-foreground">Photo</th>
                        <th className="py-3 px-4 font-heading text-xs uppercase tracking-wider text-accent">Roll No</th>
                        <th className="py-3 px-4 font-heading text-xs uppercase tracking-wider text-muted-foreground">Name</th>
                        <th className="py-3 px-4 font-heading text-xs uppercase tracking-wider text-muted-foreground">Belt</th>
                        <th className="py-3 px-4 font-heading text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Contact</th>
                        <th className="py-3 px-4 font-heading text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="w-11 h-11 rounded-full bg-secondary overflow-hidden flex items-center justify-center ring-1 ring-border">
                              {s.profile_photo_url ? (
                                <img src={s.profile_photo_url} alt={s.full_name} className="w-full h-full object-cover" />
                              ) : (
                                <Camera className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-heading text-accent text-sm">{s.roll_no || "—"}</span>
                          </td>
                          <td className="py-3 px-4">
                            <button onClick={() => { setShowStudentDetail(s); loadStudentAchievements(s.id); }} className="font-heading font-semibold hover:text-accent transition-colors text-left">
                              {s.full_name}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <BeltBadge belt={s.belt_level} />
                          </td>
                          <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{s.contact_number || "—"}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 flex-wrap">
                              <Button size="sm" variant="outline" className="text-xs border-border h-8" onClick={() => setShowDailyReport(s.id)}>Report</Button>
                              <Button size="sm" variant="outline" className="text-xs border-accent text-accent h-8" onClick={() => generateWeeklyReport(s.id)}>
                                <FileDown className="h-3 w-3 mr-1" /> Weekly PDF
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => openEditStudent(s)} title="Edit">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <label className="cursor-pointer">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(s.id, e.target.files[0]); }} />
                                <span className="inline-flex items-center h-8 px-2 text-xs border border-border rounded-md hover:bg-secondary transition-colors" title="Upload photo">
                                  <Camera className="h-3 w-3" />
                                </span>
                              </label>
                              <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => { setShowAddAchievement(s.id); }} title="Add achievement">
                                <Award className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs h-8 border-accent text-accent" onClick={() => setShowPromoteStudent(s)} title="Promote to admin">
                                <Shield className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStudents.length === 0 && <p className="text-center text-muted-foreground py-12">No students found.</p>}
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-3 px-3 font-heading text-muted-foreground">Photo</th>
                      <th className="py-3 px-3 font-heading text-muted-foreground">Name</th>
                      <th className="py-3 px-3 font-heading text-muted-foreground">Belt</th>
                      <th className="py-3 px-3 font-heading text-muted-foreground hidden md:table-cell">Contact</th>
                      <th className="py-3 px-3 font-heading text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <td className="py-2 px-3">
                          <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                            {s.profile_photo_url ? (
                              <img src={s.profile_photo_url} alt={s.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <button onClick={() => { setShowStudentDetail(s); loadStudentAchievements(s.id); }} className="font-medium hover:text-accent transition-colors text-left">
                            {s.full_name}
                          </button>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">{s.belt_level}</span>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground hidden md:table-cell">{s.contact_number || "—"}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-1 flex-wrap">
                            <Button size="sm" variant="outline" className="text-xs border-border h-7" onClick={() => setShowDailyReport(s.id)}>Report</Button>
                            <Button size="sm" variant="outline" className="text-xs border-accent text-accent h-7" onClick={() => generateWeeklyReport(s.id)}>Weekly</Button>
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => openEditStudent(s)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <label className="cursor-pointer">
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(s.id, e.target.files[0]); }} />
                              <span className="inline-flex items-center h-7 px-2 text-xs border border-border rounded-md hover:bg-secondary transition-colors">
                                <Camera className="h-3 w-3" />
                              </span>
                            </label>
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setShowAddAchievement(s.id); }}>
                              <Award className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs h-7 border-accent text-accent" onClick={() => setShowPromoteStudent(s)}>
                              <Shield className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStudents.length === 0 && <p className="text-center text-muted-foreground py-10">No students found.</p>}
              </div>
            </>
          )}

          {/* ============ ANALYTICS TAB ============ */}
          {activeTab === "analytics" && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard icon={Users} label="Total Students" value={students.length} accent="accent" />
                <KpiCard icon={Shield} label="Black Belts" value={blackBelts} accent="primary" />
                <KpiCard icon={TrendingUp} label="New This Month" value={newThisMonth} accent="accent" />
                <KpiCard icon={Activity} label="Belt Levels Active" value={beltDistribution.length} accent="primary" />
              </div>
              <AttendanceChart />
            </div>
          )}

          {/* ============ CALENDAR TAB ============ */}
          {activeTab === "calendar" && <EventsCalendar canManage={role === "admin"} />}

          {activeTab === "messages" && <AdminMessagesInbox />}
          {activeTab === "fees" && <AdminFees students={students} />}

          {/* ============ ACHIEVEMENTS TAB ============ */}
          {activeTab === "achievements" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Academy Achievements</h2>
                <Button onClick={() => setShowAddAcademyAchievement(true)} className="bg-accent text-accent-foreground font-heading hover:bg-accent/90" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {academyAchievements.map((a) => (
                  <div key={a.id} className="bg-card-gradient border border-border rounded-lg p-4 relative group">
                    <button onClick={() => deleteAcademyAchievement(a.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                    <p className="text-xs text-muted-foreground font-heading mb-1">{a.year}</p>
                    <h3 className="font-heading text-sm font-semibold mb-1">{a.title}</h3>
                    <p className="text-muted-foreground text-xs">{a.description}</p>
                  </div>
                ))}
              </div>
              {academyAchievements.length === 0 && <p className="text-center text-muted-foreground py-10">No achievements yet.</p>}
            </div>
          )}

          {/* ============ GALLERY TAB ============ */}
          {activeTab === "gallery" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Gallery Photos</h2>
                <Button onClick={() => setShowAddGallery(true)} className="bg-accent text-accent-foreground font-heading hover:bg-accent/90" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Upload Photo
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {galleryPhotos.map((p) => (
                  <div key={p.id} className="aspect-square overflow-hidden rounded-lg border border-border relative group">
                    <img src={p.image_url} alt={p.alt_text || ""} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-xs bg-secondary px-2 py-1 rounded">{p.category}</span>
                      <button onClick={() => deleteGalleryPhoto(p.id, p.image_url)} className="bg-destructive text-destructive-foreground p-1.5 rounded">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {galleryPhotos.length === 0 && <p className="text-center text-muted-foreground py-10">No gallery photos yet.</p>}
            </div>
          )}

          {/* ============ TIMINGS & FEES TAB ============ */}
          {activeTab === "timings" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Timings & Fees</h2>
                <Button onClick={() => setShowEditTimings(true)} className="bg-accent text-accent-foreground font-heading hover:bg-accent/90" size="sm">
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-accent mb-3">Batch Timings</h3>
                  {timings.map((t) => (
                    <div key={t.id} className="bg-card-gradient border border-border rounded-lg p-3 mb-2">
                      <p className="font-medium">{t.batch_name}</p>
                      <p className="text-sm text-accent">{t.time_slot}</p>
                      <p className="text-xs text-muted-foreground">{t.days}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-accent mb-3">Fee Structure</h3>
                  {fees.map((f) => (
                    <EditableFee key={f.id} fee={f} onSave={saveFee} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============ ANNOUNCEMENTS TAB ============ */}
          {activeTab === "announcements" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Announcements</h2>
                <Button onClick={() => setShowAddAnnouncement(true)} className="bg-accent text-accent-foreground font-heading hover:bg-accent/90" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Post
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {announcements.map((a) => (
                  <div key={a.id} className="bg-card-gradient border border-border rounded-lg p-4 relative group">
                    <button onClick={() => deleteAnnouncement(a.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                      <Megaphone className="h-4 w-4 text-accent" />
                      <h3 className="font-heading text-sm font-semibold">{a.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded">{a.target_batch}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
                {announcements.length === 0 && <p className="text-center text-muted-foreground py-10">No announcements yet.</p>}
              </div>
            </div>
          )}

          {/* ============ SETTINGS TAB ============ */}
          {activeTab === "settings" && (
            <div className="max-w-md">
              <h2 className="font-heading text-xl font-semibold mb-6">Admin Settings</h2>
              <div className="bg-card-gradient border border-border rounded-lg p-5 mb-4">
                <h3 className="font-heading text-sm font-semibold mb-3">Update Email</h3>
                <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="bg-secondary border-border mb-2" />
                <Button onClick={updateAdminEmail} size="sm" className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">Update Email</Button>
              </div>
              <div className="bg-card-gradient border border-border rounded-lg p-5">
                <h3 className="font-heading text-sm font-semibold mb-3">Update Password</h3>
                <Input type="password" placeholder="New password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="bg-secondary border-border mb-2" />
                <Button onClick={updateAdminPassword} size="sm" className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">Update Password</Button>
              </div>
            </div>
          )}

          {/* ============ MODALS ============ */}

          {/* Add Student */}
          {showAddStudent && (
            <Modal onClose={() => setShowAddStudent(false)} title="Add New Student">
              <form onSubmit={handleAddStudent} className="flex flex-col gap-3">
                <Input placeholder="Full Name *" value={newStudent.full_name} onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })} required className="bg-secondary border-border" />
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Roll No. * (used to login)</label>
                  <Input placeholder="e.g. BJKA042" value={newStudent.roll_no} onChange={(e) => setNewStudent({ ...newStudent, roll_no: e.target.value.toUpperCase() })} required className="bg-secondary border-border uppercase" />
                  <button type="button" onClick={() => {
                    const nums = students.map(s => parseInt((s.roll_no || "").replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
                    const next = (nums.length ? Math.max(...nums) : 0) + 1;
                    setNewStudent(p => ({ ...p, roll_no: `BJKA${String(next).padStart(3, "0")}` }));
                  }} className="text-[11px] text-accent mt-1 hover:underline">Suggest next roll</button>
                </div>
                <select value={newStudent.belt_level} onChange={(e) => setNewStudent({ ...newStudent, belt_level: e.target.value })} className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                  {BELT_LEVELS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Date of Birth * (used as password)</label>
                  <Input type="date" value={newStudent.date_of_birth} onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })} required className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Date of Joining</label>
                  <Input type="date" value={newStudent.date_of_joining} onChange={(e) => setNewStudent({ ...newStudent, date_of_joining: e.target.value })} className="bg-secondary border-border" />
                </div>
                <Input placeholder="Father's Name" value={newStudent.father_name} onChange={(e) => setNewStudent({ ...newStudent, father_name: e.target.value })} className="bg-secondary border-border" />
                <Input placeholder="Weight (kg)" type="number" value={newStudent.weight_kg} onChange={(e) => setNewStudent({ ...newStudent, weight_kg: e.target.value })} className="bg-secondary border-border" />
                <Input placeholder="Contact Number" value={newStudent.contact_number} onChange={(e) => setNewStudent({ ...newStudent, contact_number: e.target.value })} className="bg-secondary border-border" />
                <Button type="submit" className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">CREATE STUDENT</Button>
              </form>
            </Modal>
          )}

          {/* Daily Report */}
          {showDailyReport && (
            <Modal onClose={() => setShowDailyReport(null)} title="Daily Report">
              <div className="flex flex-col gap-3">
                <select value={dailyReport.attendance} onChange={(e) => setDailyReport({ ...dailyReport, attendance: e.target.value })} className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                  <option value="present">Present</option><option value="absent">Absent</option>
                </select>
                <Input placeholder="Performance Notes" value={dailyReport.performance} onChange={(e) => setDailyReport({ ...dailyReport, performance: e.target.value })} className="bg-secondary border-border" />
                <Input placeholder="Skills Practiced" value={dailyReport.skills_practiced} onChange={(e) => setDailyReport({ ...dailyReport, skills_practiced: e.target.value })} className="bg-secondary border-border" />
                <Textarea placeholder="Sensei Remarks" value={dailyReport.remarks} onChange={(e) => setDailyReport({ ...dailyReport, remarks: e.target.value })} className="bg-secondary border-border" />
                <Button onClick={() => handleDailyReport(showDailyReport)} className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">SAVE REPORT</Button>
              </div>
            </Modal>
          )}

          {/* Student Detail */}
          {showStudentDetail && (
            <Modal onClose={() => setShowStudentDetail(null)} title={showStudentDetail.full_name}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                  {showStudentDetail.profile_photo_url ? (
                    <img src={showStudentDetail.profile_photo_url} alt="" className="w-full h-full object-cover" />
                  ) : <Camera className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">{showStudentDetail.belt_level} Belt</span>
                  <p className="text-xs text-muted-foreground mt-1">User ID: {showStudentDetail.user_id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><p className="text-muted-foreground text-xs">Father's Name</p><p>{showStudentDetail.father_name || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Date of Birth</p><p>{showStudentDetail.date_of_birth || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Date of Joining</p><p>{showStudentDetail.date_of_joining || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Weight</p><p>{showStudentDetail.weight_kg ? `${showStudentDetail.weight_kg} kg` : "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Contact</p><p>{showStudentDetail.contact_number || "—"}</p></div>
              </div>
              <Button size="sm" variant="outline" className="mb-4 border-accent text-accent" onClick={() => openEditStudent(showStudentDetail)}>
                <Edit className="h-3 w-3 mr-1" /> Edit Profile
              </Button>
              <h4 className="font-heading text-sm font-semibold mb-2">Achievements</h4>
              {studentAchievements.length === 0 ? (
                <p className="text-muted-foreground text-xs mb-3">No achievements yet.</p>
              ) : (
                <div className="flex flex-col gap-2 mb-3">
                  {studentAchievements.map((a) => (
                    <div key={a.id} className="flex justify-between items-center bg-secondary rounded p-2 text-xs">
                      <div>
                        <p className="font-medium">{a.title}</p>
                        <p className="text-muted-foreground">{a.description} {a.date && `• ${a.date}`}</p>
                      </div>
                      <button onClick={() => deleteStudentAchievement(a.id, showStudentDetail.id)}><Trash2 className="h-3 w-3 text-destructive" /></button>
                    </div>
                  ))}
                </div>
              )}
              <Button size="sm" onClick={() => setShowAddAchievement(showStudentDetail.id)} className="bg-accent text-accent-foreground font-heading text-xs mb-5">
                <Plus className="h-3 w-3 mr-1" /> Add Achievement
              </Button>

              <h4 className="font-heading text-sm font-semibold mb-2 flex items-center gap-2">
                <FileDown className="h-4 w-4 text-accent" /> Weekly Reports
              </h4>
              {studentWeeklyReports.length === 0 ? (
                <p className="text-muted-foreground text-xs">No weekly reports yet. Click <em>Weekly PDF</em> on the student row to generate one.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {studentWeeklyReports.map((r) => (
                    <div key={r.id} className="flex justify-between items-center bg-secondary rounded p-2 text-xs">
                      <div>
                        <p className="font-medium">{r.week_start} → {r.week_end}</p>
                        <p className="text-muted-foreground text-[10px]">Pushed {new Date(r.pushed_at).toLocaleDateString()}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-accent text-accent" onClick={() => downloadWeeklyPDF(showStudentDetail.id, r)}>
                        <FileDown className="h-3 w-3 mr-1" /> PDF
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Modal>
          )}

          {/* Edit Student */}
          {showEditStudent && (
            <Modal onClose={() => setShowEditStudent(null)} title={`Edit: ${showEditStudent.full_name}`}>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-accent font-heading uppercase tracking-wider mb-1 block">Roll No. (login ID)</label>
                  <Input value={editForm.roll_no} onChange={(e) => setEditForm({ ...editForm, roll_no: e.target.value.toUpperCase() })} className="bg-secondary border-accent/50 uppercase font-heading" />
                  <p className="text-[11px] text-muted-foreground mt-1">Changing this updates the student's login Roll No.</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Full Name</label>
                  <Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Belt Level</label>
                  <select value={editForm.belt_level} onChange={(e) => setEditForm({ ...editForm, belt_level: e.target.value })} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                    {BELT_LEVELS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Date of Birth</label>
                  <Input type="date" value={editForm.date_of_birth} onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Date of Joining</label>
                  <Input type="date" value={editForm.date_of_joining} onChange={(e) => setEditForm({ ...editForm, date_of_joining: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Father's Name</label>
                  <Input value={editForm.father_name} onChange={(e) => setEditForm({ ...editForm, father_name: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Weight (kg)</label>
                  <Input type="number" value={editForm.weight_kg} onChange={(e) => setEditForm({ ...editForm, weight_kg: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Contact Number</label>
                  <Input value={editForm.contact_number} onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })} className="bg-secondary border-border" />
                </div>
                <Button onClick={handleEditStudent} className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">
                  <Save className="h-4 w-4 mr-1" /> SAVE CHANGES
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-accent/50 text-accent hover:bg-accent/10 font-heading"
                  onClick={async () => {
                    const { data, error } = await supabase.functions.invoke("resync-student-auth", {
                      body: { student_id: showEditStudent.id },
                    });
                    if (error || !data?.ok) {
                      toast.error(data?.error || error?.message || "Resync failed");
                    } else {
                      toast.success("Login reset. Student can sign in with Roll No + DOB.");
                    }
                  }}
                >
                  Reset Login (Roll No + DOB)
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Use this if the student can't log in. It re-syncs the auth account so the password is the DOB.
                </p>
              </div>
            </Modal>
          )}

          {/* Add Student Achievement */}
          {showAddAchievement && (
            <Modal onClose={() => setShowAddAchievement(null)} title="Add Student Achievement">
              <div className="flex flex-col gap-3">
                <Input placeholder="Title *" value={newAchievement.title} onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })} required className="bg-secondary border-border" />
                <Input placeholder="Description" value={newAchievement.description} onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })} className="bg-secondary border-border" />
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Achievement Date</label>
                  <Input type="date" value={newAchievement.date} onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })} className="bg-secondary border-border" />
                </div>
                <Button onClick={() => handleAddStudentAchievement(showAddAchievement)} className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">ADD</Button>
              </div>
            </Modal>
          )}

          {/* Add Academy Achievement */}
          {showAddAcademyAchievement && (
            <Modal onClose={() => setShowAddAcademyAchievement(false)} title="Add Academy Achievement">
              <div className="flex flex-col gap-3">
                <Input placeholder="Title *" value={newAcademyAch.title} onChange={(e) => setNewAcademyAch({ ...newAcademyAch, title: e.target.value })} required className="bg-secondary border-border" />
                <Input placeholder="Description" value={newAcademyAch.description} onChange={(e) => setNewAcademyAch({ ...newAcademyAch, description: e.target.value })} className="bg-secondary border-border" />
                <Input placeholder="Year" value={newAcademyAch.year} onChange={(e) => setNewAcademyAch({ ...newAcademyAch, year: e.target.value })} className="bg-secondary border-border" />
                <select value={newAcademyAch.icon_type} onChange={(e) => setNewAcademyAch({ ...newAcademyAch, icon_type: e.target.value })} className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                  <option value="trophy">Trophy</option><option value="medal">Medal</option><option value="star">Star</option>
                </select>
                <Button onClick={handleAddAcademyAchievement} className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">ADD</Button>
              </div>
            </Modal>
          )}

          {/* Add Gallery Photo */}
          {showAddGallery && <GalleryUploadModal onClose={() => setShowAddGallery(false)} onUpload={handleGalleryUpload} />}

          {/* Edit Timings */}
          {showEditTimings && <TimingsEditModal timings={timings} onClose={() => setShowEditTimings(false)} onSave={saveTimings} />}

          {/* Add Announcement */}
          {showAddAnnouncement && (
            <Modal onClose={() => setShowAddAnnouncement(false)} title="Post Announcement">
              <div className="flex flex-col gap-3">
                <Input placeholder="Title *" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} required className="bg-secondary border-border" />
                <Textarea placeholder="Message *" value={newAnnouncement.message} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })} required className="bg-secondary border-border" />
                <select value={newAnnouncement.target_batch} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target_batch: e.target.value })} className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                  <option value="all">All</option><option value="juniors">Juniors</option><option value="seniors">Seniors</option>
                </select>
                <Button onClick={handleAddAnnouncement} className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">POST</Button>
              </div>
            </Modal>
          )}

          {/* Promote Student */}
          {showPromoteStudent && (
            <Modal onClose={() => setShowPromoteStudent(null)} title="Promote to Admin">
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to promote <strong>{showPromoteStudent.full_name}</strong> to Admin? They will have full admin access.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => promoteToAdmin(showPromoteStudent.user_id)} className="bg-accent text-accent-foreground font-heading">Confirm</Button>
                <Button variant="outline" onClick={() => setShowPromoteStudent(null)} className="border-border">Cancel</Button>
              </div>
            </Modal>
          )}

          {showFormat && (
            <FormatModal onClose={() => setShowFormat(false)} onDone={loadData} />
          )}

        </div>
      </section>
    </Layout>
  );
};

// ---- Helper Components ----

const KpiCard = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number | string; accent: "accent" | "primary" }) => (
  <div className="relative overflow-hidden bg-card-gradient border border-border rounded-xl p-5 group hover:border-accent/50 transition-colors">
    <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30 ${accent === "accent" ? "bg-accent" : "bg-primary"}`} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-2">{label}</p>
        <p className="font-heading text-3xl font-bold">{value}</p>
      </div>
      <div className={`p-2.5 rounded-lg ${accent === "accent" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const BeltBadge = ({ belt }: { belt: string }) => {
  const styles: Record<string, string> = {
    White: "bg-white/10 text-foreground border-white/30",
    Yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
    Orange: "bg-orange-500/15 text-orange-400 border-orange-500/40",
    Green: "bg-green-500/15 text-green-400 border-green-500/40",
    Blue: "bg-blue-500/15 text-blue-400 border-blue-500/40",
    Purple: "bg-purple-500/15 text-purple-400 border-purple-500/40",
  };
  let cls = "bg-primary/15 text-primary border-primary/40";
  if (belt.startsWith("Brown")) cls = "bg-amber-700/20 text-amber-500 border-amber-700/40";
  else if (belt.startsWith("Black")) cls = "bg-foreground/10 text-foreground border-foreground/30";
  else if (styles[belt]) cls = styles[belt];
  return <span className={`text-xs font-heading uppercase tracking-wide px-2.5 py-1 rounded-full border ${cls}`}>{belt}</span>;
};


const Modal = ({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading text-xl font-bold text-gold-gradient">{title}</h2>
        <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
      </div>
      {children}
    </div>
  </div>
);

const GalleryUploadModal = ({ onClose, onUpload }: { onClose: () => void; onUpload: (file: File, cat: string, alt: string) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("Training");
  const [alt, setAlt] = useState("");
  return (
    <Modal onClose={onClose} title="Upload Gallery Photo">
      <div className="flex flex-col gap-3">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
          <option value="Training">Training</option><option value="Tournaments">Tournaments</option><option value="Events">Events</option><option value="Belts">Belts</option>
        </select>
        <Input placeholder="Alt text" value={alt} onChange={(e) => setAlt(e.target.value)} className="bg-secondary border-border" />
        <Button onClick={() => { if (file) onUpload(file, category, alt); }} disabled={!file} className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">UPLOAD</Button>
      </div>
    </Modal>
  );
};

const TimingsEditModal = ({ timings, onClose, onSave }: { timings: any[]; onClose: () => void; onSave: (items: any[]) => void }) => {
  const [items, setItems] = useState(timings.map((t) => ({ ...t })));
  const update = (idx: number, field: string, val: string) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], [field]: val };
    setItems(copy);
  };
  return (
    <Modal onClose={onClose} title="Edit Timings">
      <div className="flex flex-col gap-4">
        {items.map((t, i) => (
          <div key={t.id} className="bg-secondary rounded-lg p-3 flex flex-col gap-2">
            <Input value={t.batch_name} onChange={(e) => update(i, "batch_name", e.target.value)} placeholder="Batch" className="bg-background border-border" />
            <Input value={t.time_slot} onChange={(e) => update(i, "time_slot", e.target.value)} placeholder="Time Slot" className="bg-background border-border" />
            <Input value={t.days} onChange={(e) => update(i, "days", e.target.value)} placeholder="Days" className="bg-background border-border" />
          </div>
        ))}
        <Button onClick={() => onSave(items)} className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">SAVE</Button>
      </div>
    </Modal>
  );
};

const EditableFee = ({ fee, onSave }: { fee: any; onSave: (id: string, plan: string, price: string, note: string) => void }) => {
  const [editing, setEditing] = useState(false);
  const [plan, setPlan] = useState(fee.plan_name);
  const [price, setPrice] = useState(fee.price);
  const [note, setNote] = useState(fee.note || "");

  if (!editing) return (
    <div className="bg-card-gradient border border-border rounded-lg p-3 mb-2 flex justify-between items-center">
      <div><p className="font-medium">{fee.plan_name}</p><p className="text-accent text-lg font-heading">{fee.price}</p>{fee.note && <p className="text-xs text-muted-foreground">{fee.note}</p>}</div>
      <button onClick={() => setEditing(true)}><Edit className="h-4 w-4 text-muted-foreground" /></button>
    </div>
  );

  return (
    <div className="bg-secondary border border-border rounded-lg p-3 mb-2 flex flex-col gap-2">
      <Input value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Plan" className="bg-background border-border" />
      <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" className="bg-background border-border" />
      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className="bg-background border-border" />
      <Button size="sm" onClick={() => { onSave(fee.id, plan, price, note); setEditing(false); }} className="bg-accent text-accent-foreground font-heading">Save</Button>
    </div>
  );
};

const FORMAT_TARGETS: { key: string; label: string; table: string; description: string }[] = [
  { key: "daily_reports", label: "Daily Reports", table: "daily_reports", description: "All daily attendance & performance entries." },
  { key: "weekly_reports", label: "Weekly Reports", table: "weekly_reports", description: "All compiled weekly reports." },
  { key: "achievements", label: "Student Achievements", table: "achievements", description: "Per-student achievements." },
  { key: "student_badges", label: "Student Badges", table: "student_badges", description: "All awarded badges." },
  { key: "student_goals", label: "Student Goals", table: "student_goals", description: "All goals set by/for students." },
  { key: "student_notes", label: "Training Journals", table: "student_notes", description: "All student journal entries." },
  { key: "student_messages", label: "Messages", table: "student_messages", description: "All student ↔ sensei messages." },
  { key: "event_rsvps", label: "Event RSVPs", table: "event_rsvps", description: "All RSVP responses." },
  { key: "academy_events", label: "Academy Events", table: "academy_events", description: "All scheduled calendar events." },
  { key: "announcements", label: "Announcements", table: "announcements", description: "All posted announcements." },
  { key: "gallery_photos", label: "Gallery Photos", table: "gallery_photos", description: "All gallery image entries (storage files NOT deleted)." },
  { key: "academy_achievements", label: "Academy Achievements", table: "academy_achievements", description: "All academy-wide milestones." },
];

const FORMAT_SECURITY_CODE = "BJKA-RESET-2026";

const FormatModal = ({ onClose, onDone }: { onClose: () => void; onDone: () => void }) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [confirmText, setConfirmText] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [busy, setBusy] = useState(false);

  const toggle = (key: string) => setSelected((s) => ({ ...s, [key]: !s[key] }));
  const selectedKeys = Object.keys(selected).filter((k) => selected[k]);
  const ready = selectedKeys.length > 0 && confirmText === "FORMAT" && securityCode === FORMAT_SECURITY_CODE;

  const runFormat = async () => {
    if (!ready) return;
    setBusy(true);
    const results: { label: string; ok: boolean; error?: string }[] = [];
    for (const key of selectedKeys) {
      const target = FORMAT_TARGETS.find((t) => t.key === key)!;
      const { error } = await supabase
        .from(target.table as any)
        .delete()
        .not("id", "is", null);
      results.push({ label: target.label, ok: !error, error: error?.message });
    }
    setBusy(false);
    const failed = results.filter((r) => !r.ok);
    if (failed.length === 0) toast.success(`Formatted ${results.length} dataset(s)`);
    else toast.error(`${failed.length} failed: ${failed.map((f) => f.label).join(", ")}`);
    onDone();
    onClose();
  };

  return (
    <Modal onClose={onClose} title="⚠️ Format Data">
      <div className="flex flex-col gap-4">
        <div className="bg-destructive/10 border border-destructive/40 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-heading font-semibold text-destructive mb-1">DESTRUCTIVE ACTION — CANNOT BE UNDONE</p>
              <p className="text-muted-foreground text-xs">
                Selected datasets will be <b>permanently deleted</b> from the database. Student accounts, profiles, roles, fees, timings, belt curriculum, and the technique library are <b>never</b> touched by this tool.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold mb-2">Choose what to format</p>
          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
            {FORMAT_TARGETS.map((t) => (
              <label key={t.key} className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${selected[t.key] ? "border-destructive/60 bg-destructive/5" : "border-border hover:bg-secondary"}`}>
                <input
                  type="checkbox"
                  checked={!!selected[t.key]}
                  onChange={() => toggle(t.key)}
                  className="mt-1 accent-destructive"
                />
                <div className="flex-1">
                  <p className="text-sm font-heading">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground">{t.description}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => setSelected(Object.fromEntries(FORMAT_TARGETS.map((t) => [t.key, true])))} className="text-xs h-8 border-border">Select all</Button>
            <Button size="sm" variant="outline" onClick={() => setSelected({})} className="text-xs h-8 border-border">Clear</Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-heading uppercase tracking-wider text-muted-foreground">
            Type <span className="text-destructive font-bold">FORMAT</span> to confirm
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="FORMAT"
            className="bg-secondary border-border"
          />
          <label className="text-xs font-heading uppercase tracking-wider text-muted-foreground mt-1">
            Security code
          </label>
          <Input
            type="password"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
            placeholder="Enter security code"
            className="bg-secondary border-border"
          />
          <p className="text-[10px] text-muted-foreground">
            Default code: <code className="bg-secondary px-1 rounded">{FORMAT_SECURITY_CODE}</code>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            disabled={!ready || busy}
            onClick={runFormat}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-heading flex-1"
          >
            {busy ? "Formatting..." : `Format ${selectedKeys.length} dataset(s)`}
          </Button>
          <Button variant="outline" onClick={onClose} className="border-border">Cancel</Button>
        </div>
      </div>
    </Modal>
  );
};

export default Dashboard;
