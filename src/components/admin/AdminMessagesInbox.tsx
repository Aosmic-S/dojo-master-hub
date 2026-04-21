import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AdminMessagesInbox = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  const loadStudents = useCallback(async () => {
    const { data: studs } = await supabase
      .from("students")
      .select("id, full_name, roll_no, profile_photo_url")
      .order("full_name");
    const { data: msgs } = await supabase
      .from("student_messages")
      .select("student_id, is_read, sender_role, created_at")
      .order("created_at", { ascending: false });
    const unread: Record<string, number> = {};
    const lastAt: Record<string, string> = {};
    (msgs || []).forEach((m) => {
      if (m.sender_role === "student" && !m.is_read) {
        unread[m.student_id] = (unread[m.student_id] || 0) + 1;
      }
      if (!lastAt[m.student_id]) lastAt[m.student_id] = m.created_at;
    });
    setUnreadMap(unread);
    const sorted = (studs || []).sort((a, b) => {
      const ua = unread[a.id] || 0;
      const ub = unread[b.id] || 0;
      if (ua !== ub) return ub - ua;
      const la = lastAt[a.id] || "";
      const lb = lastAt[b.id] || "";
      return lb.localeCompare(la);
    });
    setStudents(sorted);
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const loadThread = useCallback(async (studentId: string) => {
    const { data } = await supabase
      .from("student_messages").select("*")
      .eq("student_id", studentId).order("created_at", { ascending: true });
    setMessages(data || []);
    await supabase.from("student_messages").update({ is_read: true })
      .eq("student_id", studentId).eq("sender_role", "student").eq("is_read", false);
    loadStudents();
  }, [loadStudents]);

  const openThread = (s: any) => { setSelected(s); loadThread(s.id); };

  const send = async () => {
    if (!reply.trim() || !selected) return;
    const { error } = await supabase.from("student_messages").insert({
      student_id: selected.id, sender_role: "admin", message: reply.trim(),
    });
    if (error) return toast.error(error.message);
    setReply(""); loadThread(selected.id);
  };

  const filtered = students.filter((s) => !search ||
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_no || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-4 h-[600px]">
      <div className="bg-card-gradient border border-border rounded-lg p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-5 w-5 text-accent" />
          <h3 className="font-heading text-lg font-semibold">Inbox</h3>
        </div>
        <div className="relative mb-3">
          <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..." className="pl-8 bg-secondary border-border" />
        </div>
        <div className="flex flex-col gap-1">
          {filtered.map((s) => (
            <button key={s.id} onClick={() => openThread(s)}
              className={`flex items-center justify-between text-left px-3 py-2 rounded-lg border transition-colors ${
                selected?.id === s.id ? "bg-accent text-accent-foreground border-accent" : "border-border hover:bg-secondary"}`}>
              <div className="flex flex-col">
                <span className="text-sm font-heading">{s.full_name}</span>
                <span className="text-[10px] opacity-70">{s.roll_no || "—"}</span>
              </div>
              {unreadMap[s.id] > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-2 py-0.5">
                  {unreadMap[s.id]}
                </span>
              )}
            </button>
          ))}
          {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No students</p>}
        </div>
      </div>

      <div className="bg-card-gradient border border-border rounded-lg p-4 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Select a student to view messages</p>
          </div>
        ) : (
          <>
            <div className="border-b border-border pb-2 mb-3">
              <p className="font-heading text-base font-semibold">{selected.full_name}</p>
              <p className="text-xs text-muted-foreground">Roll No: {selected.roll_no || "—"}</p>
            </div>
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto bg-secondary/40 rounded-lg p-3 mb-3">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-xs text-center py-4">No messages yet</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`max-w-[80%] rounded-lg p-2 text-sm ${
                    m.sender_role === "admin" ? "self-end bg-accent text-accent-foreground" : "self-start bg-secondary"}`}>
                    <p>{m.message}</p>
                    <p className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Textarea value={reply} onChange={(e) => setReply(e.target.value)}
                placeholder="Reply to student..." className="bg-secondary border-border min-h-[60px]" />
              <Button onClick={send} className="bg-accent text-accent-foreground self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default AdminMessagesInbox;
