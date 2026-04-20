import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Plus, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

const GoalsTracker = ({ studentId }: { studentId: string }) => {
  const [goals, setGoals] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target_date: "" });

  const load = async () => {
    const { data } = await supabase.from("student_goals").select("*")
      .eq("student_id", studentId).order("is_completed").order("created_at", { ascending: false });
    setGoals(data || []);
  };
  useEffect(() => { load(); }, [studentId]);

  const add = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from("student_goals").insert({
      student_id: studentId, title: form.title,
      description: form.description || null, target_date: form.target_date || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Goal added"); setForm({ title: "", description: "", target_date: "" }); setShow(false); load();
  };

  const toggle = async (g: any) => {
    await supabase.from("student_goals").update({
      is_completed: !g.is_completed, completed_at: !g.is_completed ? new Date().toISOString() : null
    }).eq("id", g.id);
    load();
  };

  const del = async (id: string) => { await supabase.from("student_goals").delete().eq("id", id); load(); };

  const completed = goals.filter(g => g.is_completed).length;
  const pct = goals.length ? Math.round((completed / goals.length) * 100) : 0;

  return (
    <div className="bg-card-gradient border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Target className="h-5 w-5 text-accent" /><h3 className="font-heading text-lg font-semibold">Personal Goals</h3></div>
        <Button size="sm" onClick={() => setShow(!show)} className="bg-accent text-accent-foreground"><Plus className="h-3 w-3 mr-1" /> Goal</Button>
      </div>
      {goals.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{completed} / {goals.length} completed</span><span className="text-accent font-heading">{pct}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${pct}%` }} /></div>
        </div>
      )}
      {show && (
        <div className="bg-secondary rounded-lg p-3 mb-3 flex flex-col gap-2">
          <Input placeholder="Goal title (e.g. Earn Yellow Belt)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-background border-border" />
          <Input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-background border-border" />
          <Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className="bg-background border-border" />
          <Button size="sm" onClick={add} className="bg-primary text-primary-foreground">Save</Button>
        </div>
      )}
      {goals.length === 0 ? <p className="text-muted-foreground text-sm">Set your training goals.</p> : (
        <div className="flex flex-col gap-2">
          {goals.map(g => (
            <div key={g.id} className={`bg-secondary rounded-lg p-3 flex items-start gap-2 ${g.is_completed ? "opacity-60" : ""}`}>
              <button onClick={() => toggle(g)} className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${g.is_completed ? "bg-accent border-accent" : "border-border"}`}>
                {g.is_completed && <Check className="h-3 w-3 text-accent-foreground" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${g.is_completed ? "line-through" : ""}`}>{g.title}</p>
                {g.description && <p className="text-xs text-muted-foreground">{g.description}</p>}
                {g.target_date && <p className="text-[10px] text-accent">Target: {g.target_date}</p>}
              </div>
              <button onClick={() => del(g.id)}><Trash2 className="h-3 w-3 text-destructive" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default GoalsTracker;
