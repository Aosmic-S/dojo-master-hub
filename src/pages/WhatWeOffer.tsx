import Layout from "@/components/Layout";
import { Swords, Target, Shield, Baby, Dumbbell, Flame } from "lucide-react";

const programs = [
  { icon: Swords, title: "Beginner Karate", desc: "Foundation techniques, stances, and basic kata for newcomers to martial arts." },
  { icon: Target, title: "Advanced Kata", desc: "Master complex kata forms with precision, power, and competitive execution." },
  { icon: Flame, title: "Kumite Training", desc: "Sparring techniques, strategy, and competitive fighting skills development." },
  { icon: Shield, title: "Self-Defense", desc: "Practical self-defense techniques for real-world situations and personal safety." },
  { icon: Baby, title: "Kids Program", desc: "Fun, structured karate classes building discipline and confidence in children." },
  { icon: Dumbbell, title: "Fitness & Conditioning", desc: "Strength, flexibility, and endurance training tailored for martial artists." },
];

const WhatWeOffer = () => (
  <Layout>
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-4">
          WHAT WE <span className="text-gold-gradient">OFFER</span>
        </h1>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-16">
          Comprehensive karate training programs for all ages and skill levels.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p) => (
            <div
              key={p.title}
              className="bg-card-gradient border border-border rounded-lg p-6 hover:border-accent/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <p.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">{p.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default WhatWeOffer;
