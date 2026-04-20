import { Award } from "lucide-react";

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
  return (
    <div className="bg-card-gradient border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-accent" />
        <h3 className="font-heading text-lg font-semibold">Belt Progression Roadmap</h3>
      </div>
      <div className="relative pl-8">
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
        {BELTS.map((b, i) => {
          const isCurrent = i === currentIdx;
          const isPast = i < currentIdx;
          return (
            <div key={b.name} className="relative pb-4 last:pb-0">
              <div className={`absolute -left-[22px] top-1 w-4 h-4 rounded-full border-2 ${b.color} ${isCurrent ? "ring-2 ring-accent ring-offset-2 ring-offset-card scale-125" : ""} ${isPast ? "border-accent" : "border-border"}`} />
              <div className={`${isCurrent ? "bg-accent/10 border border-accent rounded-lg p-3" : ""}`}>
                <p className={`font-heading text-sm ${isCurrent ? "text-accent font-bold" : isPast ? "text-muted-foreground line-through" : "font-semibold"}`}>
                  {b.name} {isCurrent && "← You are here"}
                </p>
                <p className="text-xs text-muted-foreground">{b.focus}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default BeltRoadmap;
