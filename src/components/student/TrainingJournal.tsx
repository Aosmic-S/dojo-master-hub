import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const TrainingJournal = ({ studentId }: { studentId: string }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const load = async () => {
    const { data } = await supabase.from("student_notes").select("*")
      .eq("student_id", studentId).order("created_at", { ascending: false });
    setNotes(data || []);
  };
  useEffect(() => { load(); }, [studentId]);

  const add = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from("student_notes").insert({ student_id: studentId, ...form });
    if (error) return toast.error(error.message);
    toast.success("Note added");
    setForm({ title: "", content: "" }); setShow(false); load();
  };

  const del = async (id: string) => {
    await supabase.from("student_notes").delete().eq("id", id); load();
  };

  return (
    <div className="bg-card-gradient border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-accent" /><h3 className="font-heading text-lg font-semibold">Training Journal</h3></div>
        <Button size="sm" onClick={() => setShow(!show)} className="bg-accent text-accent-foreground"><Plus className="h-3 w-3 mr-1" /> Note</Button>
      </div>
      {show && (
        <div className="bg-secondary rounded-lg p-3 mb-3 flex flex-col gap-2">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-background border-border" />
          <Textarea placeholder="What did you learn today?" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="bg-background border-border" />
          <Button size="sm" onClick={add} className="bg-primary text-primary-foreground">Save</Button>
        </div>
      )}
      {notes.length === 0 ? <p className="text-muted-foreground text-sm">No notes yet. Document your training journey.</p> : (
        <div className="flex flex-col gap-2">
          {notes.map(n => (
            <div key={n.id} className="bg-secondary rounded-lg p-3 group relative">
              <button onClick={() => del(n.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3 text-destructive" /></button>
              <p className="font-heading text-sm font-semibold">{n.title}</p>
              <p className="text-muted-foreground text-xs mt-1 whitespace-pre-wrap">{n.content}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default TrainingJournal;
