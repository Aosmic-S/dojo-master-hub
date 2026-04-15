import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

const Timings = () => {
  const [timings, setTimings] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [tRes, fRes] = await Promise.all([
        supabase.from("timings").select("*").order("display_order"),
        supabase.from("fees").select("*").order("display_order"),
      ]);
      setTimings(tRes.data || []);
      setFees(fRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">Loading...</div></Layout>;

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-4">
            TIMINGS & <span className="text-gold-gradient">FEE STRUCTURE</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-16">
            Flexible schedules and affordable plans for every student.
          </p>

          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-accent mb-6">Batch Timings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-3 px-4 font-heading text-muted-foreground">Batch</th>
                      <th className="py-3 px-4 font-heading text-muted-foreground">Time</th>
                      <th className="py-3 px-4 font-heading text-muted-foreground">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timings.map((b) => (
                      <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{b.batch_name}</td>
                        <td className="py-3 px-4 text-accent">{b.time_slot}</td>
                        <td className="py-3 px-4 text-muted-foreground">{b.days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                * Morning class schedule will be announced via profile announcements.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-semibold text-accent mb-6">Fee Structure</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fees.map((f) => (
                  <div key={f.id} className="bg-card-gradient border border-border rounded-lg p-5 text-center hover:border-accent/50 transition-colors">
                    <p className="text-muted-foreground text-sm mb-1">{f.plan_name}</p>
                    <p className="font-heading text-3xl font-bold text-foreground">{f.price}</p>
                    {f.note && <p className="text-xs text-accent mt-1">{f.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Timings;
