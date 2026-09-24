import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { IndianRupee, Check, Clock, Trash2 } from "lucide-react";

const thisMonth = () => new Date().toISOString().slice(0, 7);

const AdminFees = ({ students }: { students: any[] }) => {
  const [month, setMonth] = useState(thisMonth());
  const [rows, setRows] = useState<any[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [defaultAmount, setDefaultAmount] = useState("1000");

  const load = async () => {
    const { data } = await supabase.from("fee_payments").select("*").eq("month", month);
    setRows(data || []);
  };
  useEffect(() => { load(); }, [month]);

  const byStudent = useMemo(() => Object.fromEntries(rows.map(r => [r.student_id, r])), [rows]);
  const paidCount = rows.filter(r => r.status === "paid").length;
  const collected = rows.filter(r => r.status === "paid").reduce((s, r) => s + Number(r.amount), 0);

  const mark = async (studentId: string, status: "paid" | "due") => {
    const amount = Number(amounts[studentId] ?? byStudent[studentId]?.amount ?? defaultAmount) || 0;
    const { error } = await supabase.from("fee_payments").upsert({
      student_id: studentId, month, amount, status,
      paid_on: status === "paid" ? new Date().toISOString().slice(0, 10) : null,
    }, { onConflict: "student_id,month" });
    if (error) toast.error(error.message); else { toast.success(status === "paid" ? "Marked paid" : "Marked due"); load(); }
  };

  const remove = async (id: string) => {
    await supabase.from("fee_payments").delete().eq("id", id); load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card-gradient border border-border rounded-lg p-5"><p className="text-xs text-muted-foreground">Collected ({month})</p><p className="font-heading text-3xl font-bold text-accent">₹{collected}</p></div>
        <div className="bg-card-gradient border border-border rounded-lg p-5"><p className="text-xs text-muted-foreground">Paid</p><p className="font-heading text-3xl font-bold">{paidCount}</p></div>
        <div className="bg-card-gradient border border-border rounded-lg p-5"><p className="text-xs text-muted-foreground">Pending</p><p className="font-heading text-3xl font-bold text-primary">{students.length - paidCount}</p></div>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div><p className="text-xs text-muted-foreground mb-1">Month</p><Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="bg-secondary w-44" /></div>
        <div><p className="text-xs text-muted-foreground mb-1">Default fee (₹)</p><Input type="number" value={defaultAmount} onChange={e => setDefaultAmount(e.target.value)} className="bg-secondary w-32" /></div>
      </div>

      <div className="bg-card-gradient border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-muted-foreground">
            <th className="p-3">Roll</th><th className="p-3">Student</th><th className="p-3">Amount (₹)</th><th className="p-3">Status</th><th className="p-3">Actions</th>
          </tr></thead>
          <tbody>
            {students.map(s => {
              const r = byStudent[s.id];
              return (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="p-3 text-muted-foreground">{s.roll_no || "—"}</td>
                  <td className="p-3 font-medium">{s.full_name}</td>
                  <td className="p-3"><Input type="number" className="bg-secondary w-28 h-8"
                    value={amounts[s.id] ?? r?.amount ?? defaultAmount}
                    onChange={e => setAmounts({ ...amounts, [s.id]: e.target.value })} /></td>
                  <td className="p-3">
                    {r?.status === "paid"
                      ? <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent/20 text-accent"><Check className="h-3 w-3" /> Paid {r.paid_on}</span>
                      : <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/20 text-primary"><Clock className="h-3 w-3" /> Due</span>}
                  </td>
                  <td className="p-3 flex gap-2">
                    {r?.status === "paid"
                      ? <Button size="sm" variant="outline" onClick={() => mark(s.id, "due")}>Mark due</Button>
                      : <Button size="sm" className="bg-accent text-accent-foreground" onClick={() => mark(s.id, "paid")}><IndianRupee className="h-3 w-3 mr-1" />Mark paid</Button>}
                    {r && <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFees;
