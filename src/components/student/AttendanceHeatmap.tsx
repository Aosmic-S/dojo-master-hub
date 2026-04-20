import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";

const AttendanceHeatmap = ({ studentId }: { studentId: string }) => {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const { data } = await supabase.from("daily_reports").select("date, attendance")
        .eq("student_id", studentId).gte("date", since.toISOString().split("T")[0]);
      setReports(data || []);
    })();
  }, [studentId]);

  const map = useMemo(() => {
    const m = new Map<string, string>();
    reports.forEach(r => m.set(r.date, r.attendance));
    return m;
  }, [reports]);

  const days = useMemo(() => {
    const arr: { date: string; status: string | undefined }[] = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      arr.push({ date: iso, status: map.get(iso) });
    }
    return arr;
  }, [map]);

  return (
    <div className="bg-card-gradient border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-5 w-5 text-accent" />
        <h3 className="font-heading text-lg font-semibold">90-Day Attendance Heatmap</h3>
      </div>
      <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] sm:grid-cols-[repeat(30,minmax(0,1fr))] gap-1">
        {days.map(d => (
          <div key={d.date} title={`${d.date}: ${d.status || "no class"}`}
            className={`aspect-square rounded-sm ${
              d.status === "present" ? "bg-accent" :
              d.status === "absent" ? "bg-primary/60" :
              "bg-secondary"
            }`} />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-secondary rounded-sm" /> No class</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-accent rounded-sm" /> Present</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-primary/60 rounded-sm" /> Absent</span>
      </div>
    </div>
  );
};

export default AttendanceHeatmap;
