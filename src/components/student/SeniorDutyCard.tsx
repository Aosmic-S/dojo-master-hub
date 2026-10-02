import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Check, HandHelping } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SeniorDutyCard({ student }: { student: any }) {
  const [duties, setDuties] = useState<any[]>([]);
  const isSenior = student.belt_level?.trim().toLowerCase() === "brown 1st kyu";

  const load = useCallback(async () => {
    if (!isSenior) return;
    const today = new Date().toISOString().split("T")[0];
    const end = new Date(); end.setDate(end.getDate() + 45);
    const { data, error } = await supabase.from("senior_duties").select("*").gte("duty_date", today).lte("duty_date", end.toISOString().split("T")[0]).order("duty_date");
    if (error) { toast.error(error.message); return; }
    setDuties(data || []);
  }, [isSenior]);

  useEffect(() => { load(); }, [load]);
  if (!isSenior || !duties.length) return null;

  const respond = async (id: string, status: "accepted" | "cover_requested") => {
    const { error } = await supabase.from("senior_duties").update({ status, responded_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "accepted" ? "Duty accepted. Thank you." : "A substitute has been requested and the Sensei has been notified.");
    await load();
  };

  const cover = async (duty: any) => {
    const { error } = await supabase.from("senior_duties").update({ status: "covered", covering_student_id: student.id, responded_at: new Date().toISOString() }).eq("id", duty.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Thank you. You are now covering this duty.");
    await load();
  };

  return (
    <div className="border border-accent/30 bg-accent/5 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3"><CalendarClock className="h-5 w-5 text-accent" /><h3 className="font-heading text-lg">Senior duty</h3></div>
      <div className="space-y-3">{duties.map((duty) => {
        const mine = duty.assigned_student_id === student.id;
        const open = duty.status === "cover_requested";
        if (!mine && !open) return null;
        return <div key={duty.id} className="bg-card border border-border rounded-md p-3 flex flex-col sm:flex-row sm:items-center gap-3"><div className="flex-1"><p className="font-medium">Junior batch · {new Date(`${duty.duty_date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p><p className="text-xs text-muted-foreground">{open ? "A senior substitute is requested." : duty.status === "pending" ? "Please confirm your availability." : duty.status === "accepted" ? "Duty accepted." : "Cover arranged."}</p></div>{mine && duty.status === "pending" && <div className="flex gap-2"><Button size="sm" onClick={() => respond(duty.id, "accepted")}><Check className="h-4 w-4" /> Accept duty</Button><Button size="sm" variant="outline" onClick={() => respond(duty.id, "cover_requested")}><HandHelping className="h-4 w-4" /> Request a substitute</Button></div>}{!mine && open && <Button size="sm" onClick={() => cover(duty)}><HandHelping className="h-4 w-4" /> Volunteer to cover</Button>}</div>;
      })}</div>
    </div>
  );
}