import wkf from "@/assets/affiliation-wkf.jpg";
import kio from "@/assets/affiliation-kio.jpg";
import ckf from "@/assets/affiliation-ckf.jpg";
import oca from "@/assets/affiliation-oca.jpg";
import ioc from "@/assets/affiliation-ioc.jpg";
import uka from "@/assets/affiliation-uka.jpg";
import shitokai from "@/assets/affiliation-shitokai.jpg";

const AFFILIATIONS = [
  { src: wkf, label: "World Karate Federation" },
  { src: kio, label: "Karate India Organisation" },
  { src: ckf, label: "Commonwealth Karate Federation" },
  { src: oca, label: "Olympic Council of Asia" },
  { src: ioc, label: "International Olympic Committee" },
  { src: uka, label: "Uttarakhand Karate Association" },
  { src: shitokai, label: "Shito-Ryu Shitokai International" },
];

const AffiliationsStrip = () => (
  <section className="py-14 bg-secondary/30 border-y border-border">
    <div className="container mx-auto px-4">
      <p className="text-center text-accent font-heading text-xs uppercase tracking-[0.3em] mb-2">Proudly Affiliated With</p>
      <h2 className="text-center font-heading text-2xl sm:text-3xl font-bold mb-10">
        WORLD-CLASS <span className="text-gold-gradient">RECOGNITION</span>
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-5 sm:gap-6 items-center justify-items-center">
        {AFFILIATIONS.map((a) => (
          <div key={a.label} className="group flex flex-col items-center gap-2">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-background ring-1 ring-border overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 group-hover:ring-accent">
              <img src={a.src} alt={a.label} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground text-center max-w-[110px] leading-tight">{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AffiliationsStrip;
