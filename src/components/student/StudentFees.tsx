import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IndianRupee, Check, Clock } from "lucide-react";

const StudentFees = ({ studentId }: { studentId: string }) => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("fee_payments").select("*").eq("student_id", studentId).order("month", { ascending: false })
      .then(({ data }) => setRows(data || []));
  }, [studentId]);

  const current = new Date().toISOString().slice(0, 7);
  const thisMonth = rows.find(r => r.month === current);
  const totalPaid = rows.filter(r => r.status === "paid").reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="bg-card-gradient border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4"><IndianRupee className="h-5 w-5 text-accent" /><h3 className="font-heading text-lg font-semibold">My Fees</h3></div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary rounded-lg p-3"><p className="text-xs text-muted-foreground">This month</p>
          <p className={`font-heading text-xl font-bold ${thisMonth?.status === "paid" ? "text-accent" : "text-primary"}`}>{thisMonth?.status === "paid" ? "PAID" : "DUE"}</p></div>
        <div className="bg-secondary rounded-lg p-3"><p className="text-xs text-muted-foreground">Total paid</p><p className="font-heading text-xl font-bold">₹{totalPaid}</p></div>
      </div>
      {rows.length === 0 ? <p className="text-sm text-muted-foreground">No fee records yet.</p> : (
        <div className="flex flex-col gap-2">
          {rows.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-secondary rounded-lg p-3 text-sm">
              <span className="font-medium">{new Date(r.month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
              <span>₹{r.amount}</span>
              {r.status === "paid"
                ? <span className="inline-flex items-center gap-1 text-xs text-accent"><Check className="h-3 w-3" />Paid {r.paid_on}</span>
                : <span className="inline-flex items-center gap-1 text-xs text-primary"><Clock className="h-3 w-3" />Due</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default StudentFees;
