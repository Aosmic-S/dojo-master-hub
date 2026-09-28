import { useState } from "react";
import { Award, Check, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const BELTS = [
  { name: "White", color: "bg-white", focus: "Foundations: Stances, basic blocks, Heian Shodan kata" },
  { name: "Yellow", color: "bg-yellow-400", focus: "Front kick, reverse punch, Heian Nidan" },
  { name: "Orange", color: "bg-orange-500", focus: "Side kick, combinations, Heian Sandan" },
  { name: "Green", color: "bg-green-500", focus: "Roundhouse kick, sparring basics, Heian Yondan" },
  { name: "Blue", color: "bg-blue-500", focus: "Hook kick, advanced kata, Heian Godan" },
  { name: "Purple", color: "bg-purple-500", focus: "Combination techniques, Tekki Shodan" },
  { name: "Brown 3rd Kyu", color: "bg-amber-700", focus: "Bassai Dai, free sparring" },
  { name: "Brown 2nd Kyu", color: "bg-amber-700", focus: "Kanku Dai, board breaking" },
  { name: "Brown 1st Kyu", color: "bg-amber-700", focus: "Empi, advanced sparring" },
  { name: "Black 1st Dan", color: "bg-black", focus: "Jion, leadership, teaching basics" },
  { name: "Black 2nd Dan", color: "bg-black", focus: "Multiple kata mastery" },
  { name: "Black 3rd Dan", color: "bg-black", focus: "Senior instructor level" },
];

const BeltRoadmap = ({ currentBelt }: { currentBelt: string }) => {
  const currentIdx = BELTS.findIndex(b => b.name === currentBelt);
  const [selected, setSelected] = useState(Math.max(currentIdx, 0));
  const pct = currentIdx < 0 ? 0 : Math.round(((currentIdx + 1) / BELTS.length) * 100);
  const sel = BELTS[selected];
  const selState = selected < currentIdx ? "Completed" : selected === currentIdx ? "Current belt" : "Upcoming";

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-accent" />
          <h3 className="font-heading text-2xl">Belt Path</h3>
        </div>
        <span className="eyebrow">{currentIdx + 1} / {BELTS.length}</span>
      </div>
      <Progress value={pct} className="mb-5" />

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-5">
        {BELTS.map((b, i) => {
          const isCurrent = i === currentIdx, isPast = i < currentIdx, isSel = i === selected;
          return (
            <button key={b.name} onClick={() => setSelected(i)} aria-label={b.name}
              className={`relative rounded-md border p-2 min-h-[56px] flex flex-col items-center justify-center gap-1 transition-all
                ${isSel ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"}
                ${isCurrent ? "ring-1 ring-accent shadow-[0_0_18px_-4px_hsl(var(--accent)/.6)]" : ""}
                ${!isPast && !isCurrent ? "opacity-60" : ""}`}>
              <span className={`h-2.5 w-full rounded-sm border border-border ${b.color}`} />
              <span className="text-[10px] leading-tight text-center text-muted-foreground">{b.name.replace(" Kyu", "").replace(" Dan", "")}</span>
              {isPast && <Check className="absolute top-1 right-1 h-3 w-3 text-accent" />}
              {!isPast && !isCurrent && <Lock className="absolute top-1 right-1 h-2.5 w-2.5 text-muted-foreground" />}
            </button>
          );
        })}
      </div>

      <div key={selected} className="animate-fade-in rounded-md border border-border bg-secondary/40 p-4">
        <p className="eyebrow mb-1">{selState}</p>
        <p className="font-heading text-2xl">{sel.name} Belt</p>
        <p className="text-sm text-muted-foreground">{sel.focus}</p>
      </div>
    </div>
  );
};
export default BeltRoadmap;
