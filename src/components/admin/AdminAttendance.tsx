import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Check, Search, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Attendance = "present" | "absent";

const today = () => new Date().toISOString().split("T")[0];

export default function AdminAttendance({ students }: { students: any[] }) {
  const [date, setDate] = useState(today());
  const [search, setSearch] = useState("");
  const [marks, setMarks] = useState<Record<string, Attendance>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.from("daily_reports").select("student_id, attendance").eq("date", date);
      if (!active) return;
      if (error) { toast.error(error.message); return; }
      const next: Record<string, Attendance> = {};
      const ids = new Set<string>();
      (data || []).forEach((row) => {
        next[row.student_id] = row.attendance === "absent" ? "absent" : "present";
        ids.add(row.student_id);
      });
      setMarks(next);
      setSavedIds(ids);
    })();
    return () => { active = false; };
  }, [date]);

  const visible = useMemo(() => students.filter((student) =>
    student.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (student.roll_no || "").toLowerCase().includes(search.toLowerCase())
  ), [students, search]);

  const setAll = (value: Attendance) => setMarks(Object.fromEntries(students.map((student) => [student.id, value])));

  const save = async () => {
    const entries = Object.entries(marks);
    if (!entries.length) { toast.error("Mark at least one student first."); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("daily_reports").upsert(
      entries.map(([student_id, attendance]) => ({ student_id, attendance, date, sensei_id: user?.id ?? null })),
      { onConflict: "student_id,date" },
    );
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setSavedIds(new Set(entries.map(([id]) => id)));
    toast.success(`Attendance saved for ${entries.length} students.`);
  };

  const present = Object.values(marks).filter((mark) => mark === "present").length;
  const absent = Object.values(marks).filter((mark) => mark === "absent").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1"><CalendarCheck className="h-5 w-5 text-accent" /><h2 className="font-heading text-2xl">Mark attendance</h2></div>
          <p className="text-sm text-muted-foreground">Choose a date, then mark each student with one tap.</p>
        </div>
        <div className="w-full md:w-48"><label className="text-xs text-muted-foreground block mb-1">Class date</label><Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="panel p-4"><p className="eyebrow">Marked</p><p className="font-heading text-3xl">{Object.keys(marks).length}/{students.length}</p></div>
        <div className="panel p-4"><p className="eyebrow">Present</p><p className="font-heading text-3xl text-accent">{present}</p></div>
        <div className="panel p-4"><p className="eyebrow">Absent</p><p className="font-heading text-3xl text-destructive">{absent}</p></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student or roll number" className="pl-10" /></div>
        <Button variant="outline" onClick={() => setAll("present")}><Check className="h-4 w-4" /> Mark all present</Button>
      </div>

      <div className="divide-y divide-border border-y border-border">
        {visible.map((student) => {
          const mark = marks[student.id];
          return (
            <div key={student.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3">
              <div className="flex-1 min-w-0"><p className="font-medium truncate">{student.full_name}</p><p className="text-xs text-muted-foreground">{student.roll_no || "No roll number"} · {student.belt_level}</p></div>
              <div className="grid grid-cols-2 gap-2 sm:w-64">
                <Button type="button" variant={mark === "present" ? "default" : "outline"} onClick={() => setMarks((current) => ({ ...current, [student.id]: "present" }))} className={mark === "present" ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}><Check className="h-4 w-4" /> Present</Button>
                <Button type="button" variant={mark === "absent" ? "destructive" : "outline"} onClick={() => setMarks((current) => ({ ...current, [student.id]: "absent" }))}><UserX className="h-4 w-4" /> Absent</Button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{savedIds.size ? `${savedIds.size} saved for this date` : "Not saved yet"}</p><Button onClick={save} disabled={saving || !Object.keys(marks).length}>{saving ? "Saving…" : "Save attendance"}</Button></div>
    </div>
  );
}