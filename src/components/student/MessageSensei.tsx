import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

const MessageSensei = ({ studentId }: { studentId: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  const load = async () => {
    const { data } = await supabase.from("student_messages").select("*")
      .eq("student_id", studentId).order("created_at", { ascending: true });
    setMessages(data || []);
  };
  useEffect(() => { load(); }, [studentId]);

  const send = async () => {
    if (!text.trim()) return;
    const { error } = await supabase.from("student_messages").insert({
      student_id: studentId, sender_role: "student", message: text.trim(),
    });
    if (error) return toast.error(error.message);
    setText(""); load();
  };

  return (
    <div className="bg-card-gradient border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-5 w-5 text-accent" />
        <h3 className="font-heading text-lg font-semibold">Message Sensei</h3>
      </div>
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-3 bg-secondary/40 rounded-lg p-3">
        {messages.length === 0 ? <p className="text-muted-foreground text-xs text-center py-4">No messages yet. Say hi!</p> : (
          messages.map(m => (
            <div key={m.id} className={`max-w-[80%] rounded-lg p-2 text-sm ${m.sender_role === "student" ? "self-end bg-primary text-primary-foreground" : "self-start bg-secondary"}`}>
              <p>{m.message}</p>
              <p className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message..." className="bg-secondary border-border min-h-[60px]" />
        <Button onClick={send} className="bg-accent text-accent-foreground self-end"><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
};
export default MessageSensei;
