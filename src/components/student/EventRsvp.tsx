import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";
import { toast } from "sonner";

const EventRsvp = ({ studentId }: { studentId: string }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, string>>({});

  const load = async () => {
    const today = new Date().toISOString().split("T")[0];
    const [evRes, rRes] = await Promise.all([
      supabase.from("academy_events").select("*").gte("event_date", today).order("event_date").limit(10),
      supabase.from("event_rsvps").select("*").eq("student_id", studentId),
    ]);
    setEvents(evRes.data || []);
    const map: Record<string, string> = {};
    (rRes.data || []).forEach((r: any) => { map[r.event_id] = r.status; });
    setRsvps(map);
  };
  useEffect(() => { load(); }, [studentId]);

  const set = async (eventId: string, status: string) => {
    const { error } = await supabase.from("event_rsvps").upsert({
      event_id: eventId, student_id: studentId, status,
    }, { onConflict: "event_id,student_id" });
    if (error) return toast.error(error.message);
    toast.success("RSVP saved"); load();
  };

  return (
    <div className="bg-card-gradient border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <CalendarCheck className="h-5 w-5 text-accent" />
        <h3 className="font-heading text-lg font-semibold">Upcoming Events — RSVP</h3>
      </div>
      {events.length === 0 ? <p className="text-muted-foreground text-sm">No upcoming events.</p> : (
        <div className="flex flex-col gap-2">
          {events.map(e => {
            const cur = rsvps[e.id];
            return (
              <div key={e.id} className="bg-secondary rounded-lg p-3">
                <p className="font-heading text-sm font-semibold">{e.title}</p>
                <p className="text-xs text-accent">{e.event_date}{e.start_time && ` • ${e.start_time}`}</p>
                {e.location && <p className="text-xs text-muted-foreground">{e.location}</p>}
                <div className="flex gap-1 mt-2">
                  {["going", "interested", "not_going"].map(s => (
                    <Button key={s} size="sm" variant={cur === s ? "default" : "outline"} onClick={() => set(e.id, s)}
                      className={`h-7 text-[11px] ${cur === s ? "bg-accent text-accent-foreground" : "border-border"}`}>
                      {s.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default EventRsvp;
