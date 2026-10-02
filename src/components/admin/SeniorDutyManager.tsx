import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DAYS = [{ value: 1, label: "Monday" }, { value: 2, label: "Tuesday" }, { value: 4, label: "Thursday" }, { value: 5, label: "Friday" }];
const monthValue = () => new Date().toISOString().slice(0, 7);

export default function SeniorDutyManager({ students }: { students: any[] }) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [duties, setDuties] = useState<any[]>([]);
  const [month, setMonth] = useState(monthValue());
  const [saving, setSaving] = useState<string | null>(null);
  const seniors = useMemo(() => students.filter((student) => student.belt_level?.trim().toLowerCase() === "brown 1st kyu"), [students]);
  const nameOf = (id: string | null) => students.find((student) => student.id === id)?.full_name || "Senior";

  const load = useCallback(async () => {
    const monthStart = `${month}-01`;
    const end = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).toISOString().split("T")[0];
    const [scheduleRes, dutiesRes] = await Promise.all([
      supabase.from("senior_duty_schedule").select("*").order("week_of_month").order("day_of_week"),
      supabase.from("senior_duties").select("*").gte("duty_date", monthStart).lte("duty_date", end).order("duty_date"),
    ]);
    if (scheduleRes.error || dutiesRes.error) { toast.error(scheduleRes.error?.message || dutiesRes.error?.message || "Could not load duties"); return; }
    setSchedule(scheduleRes.data || []);
    setDuties(dutiesRes.data || []);
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const assign = async (week: number, day: number, studentId: string) => {
    const key = `${week}-${day}`;
    setSaving(key);
    const existing = schedule.find((row) => row.week_of_month === week && row.day_of_week === day);
    let error = null;
    if (!studentId && existing) ({ error } = await supabase.from("senior_duty_schedule").delete().eq("id", existing.id));
    else if (studentId) ({ error } = await supabase.from("senior_duty_schedule").upsert({ week_of_month: week, day_of_week: day, student_id: studentId }, { onConflict: "week_of_month,day_of_week" }));
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    await load();
  };

  const generate = async () => {
    const { data, error } = await supabase.rpc("materialize_senior_duties", { _month: `${month}-01` });
    if (error) { toast.error(error.message); return; }
    toast.success(data ? `${data} duty dates prepared.` : "Duty dates are already up to date.");
    await load();
  };
  const clearMonth = async () => {
    if (!window.confirm(`Clear all scheduled duties for ${month}?`)) return;
    const monthStart = `${month}-01`;
    const end = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).toISOString().split("T")[0];
    const { error } = await supabase.from("senior_duties").delete().gte("duty_date", monthStart).lte("duty_date", end);
    if (error) { toast.error(error.message); return; }
    toast.success(`Cleared all duties for ${month}.`);
    await load();
  };

  const open = duties.filter((duty) => duty.status === "cover_requested");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div><div className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-accent" /><h2 className="font-heading text-2xl">Senior duty</h2></div><p className="text-sm text-muted-foreground mt-1">Repeating junior-batch rota for Brown 1st Kyu seniors.</p></div>
        <div className="flex flex-wrap gap-2">
  <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="bg-secondary border border-border rounded-md px-3 text-sm" />
  <Button onClick={generate}><RefreshCw className="h-4 w-4" /> Prepare month</Button>
  <Button variant="outline" onClick={clearMonth} className="text-destructive border-destructive/40 hover:bg-destructive/10">Clear month</Button>
</div>


      {!seniors.length && <div className="border border-accent/30 bg-accent/5 rounded-md p-4 text-sm">No Brown 1st Kyu students are available for the rota.</div>}

      <div className="overflow-x-auto border border-border rounded-md">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="bg-secondary/60"><th className="text-left p-3 font-heading">Week</th>{DAYS.map((day) => <th key={day.value} className="text-left p-3 font-heading">{day.label}</th>)}</tr></thead>
          <tbody>{[1, 2, 3, 4].map((week) => <tr key={week} className="border-t border-border"><td className="p-3 font-heading text-accent">Week {week}</td>{DAYS.map((day) => {
            const value = schedule.find((row) => row.week_of_month === week && row.day_of_week === day.value)?.student_id || "";
            return <td key={day.value} className="p-2"><select aria-label={`Week ${week} ${day.label}`} value={value} disabled={saving === `${week}-${day.value}`} onChange={(event) => assign(week, day.value, event.target.value)} className="w-full bg-background border border-border rounded-md px-2 py-2 text-sm"><option value="">Unassigned</option>{seniors.map((student) => <option key={student.id} value={student.id}>{student.full_name}</option>)}</select></td>;
          })}</tr>)}</tbody>
        </table>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3"><h3 className="font-heading text-xl">{new Date(`${month}-02`).toLocaleDateString("en-IN", { month: "long", year: "numeric" })} duties</h3><span className="text-xs text-muted-foreground">{duties.length} scheduled</span></div>
        {open.length > 0 && <div className="mb-4 border border-destructive/40 bg-destructive/5 rounded-md p-4"><div className="flex gap-2"><AlertTriangle className="h-5 w-5 text-destructive shrink-0" /><div><p className="font-medium">Substitute required</p>{open.map((duty) => <p key={duty.id} className="text-sm text-muted-foreground">{nameOf(duty.assigned_student_id)} requested cover for {new Date(`${duty.duty_date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}.</p>)}</div></div></div>}
        <div className="grid md:grid-cols-2 gap-3">{duties.map((duty) => <div key={duty.id} className="panel p-4 flex items-center justify-between gap-3"><div><p className="font-medium">{new Date(`${duty.duty_date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</p><p className="text-xs text-muted-foreground">{nameOf(duty.covering_student_id || duty.assigned_student_id)}</p></div><span className={`text-xs px-2 py-1 rounded border ${duty.status === "cover_requested" ? "border-destructive/40 text-destructive" : duty.status === "covered" || duty.status === "accepted" ? "border-accent/40 text-accent" : "border-border text-muted-foreground"}`}>{duty.status.replace("_", " ")}</span></div>)}</div>
        {!duties.length && <p className="text-sm text-muted-foreground py-5">Set the rota, then choose Prepare month.</p>}
      </div>
    </div>
  );
}
