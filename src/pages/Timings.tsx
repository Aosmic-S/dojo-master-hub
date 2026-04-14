import Layout from "@/components/Layout";

const batches = [
  { batch: "Morning (Kids 5–10)", time: "6:00 AM – 7:30 AM", days: "Mon–Sat" },
  { batch: "Morning (Juniors 10–16)", time: "7:30 AM – 9:00 AM", days: "Mon–Sat" },
  { batch: "Evening (Kids 5–10)", time: "4:00 PM – 5:30 PM", days: "Mon–Sat" },
  { batch: "Evening (Seniors 16+)", time: "5:30 PM – 7:00 PM", days: "Mon–Sat" },
  { batch: "Competition Batch", time: "7:00 PM – 8:30 PM", days: "Mon–Fri" },
];

const fees = [
  { plan: "Monthly", price: "₹1,500", note: "" },
  { plan: "Quarterly", price: "₹4,000", note: "Save ₹500" },
  { plan: "Half-Yearly", price: "₹7,500", note: "Save ₹1,500" },
  { plan: "Annual", price: "₹14,000", note: "Save ₹4,000" },
];

const Timings = () => (
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
          {/* Timings */}
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
                  {batches.map((b) => (
                    <tr key={b.batch} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{b.batch}</td>
                      <td className="py-3 px-4 text-accent">{b.time}</td>
                      <td className="py-3 px-4 text-muted-foreground">{b.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fees */}
          <div>
            <h2 className="font-heading text-2xl font-semibold text-accent mb-6">Fee Structure</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fees.map((f) => (
                <div key={f.plan} className="bg-card-gradient border border-border rounded-lg p-5 text-center hover:border-accent/50 transition-colors">
                  <p className="text-muted-foreground text-sm mb-1">{f.plan}</p>
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

export default Timings;
