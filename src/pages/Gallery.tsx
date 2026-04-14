import { useState } from "react";
import Layout from "@/components/Layout";

const categories = ["All", "Tournaments", "Training", "Events", "Belts"];

const images = [
  { src: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600", cat: "Training", alt: "Karate training" },
  { src: "https://images.unsplash.com/photo-1564415315949-7a0c4c73acea?w=600", cat: "Tournaments", alt: "Tournament" },
  { src: "https://images.unsplash.com/photo-1514050566906-8d077bae7046?w=600", cat: "Training", alt: "Kata practice" },
  { src: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600", cat: "Events", alt: "Belt ceremony" },
  { src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600", cat: "Training", alt: "Group training" },
  { src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600", cat: "Events", alt: "Academy event" },
  { src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600", cat: "Belts", alt: "Belt grading" },
  { src: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=600", cat: "Tournaments", alt: "Competition" },
];

const Gallery = () => {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? images : images.filter((i) => i.cat === filter);

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-4">
            <span className="text-gold-gradient">GALLERY</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
            Moments from the dojo, tournaments, and celebrations.
          </p>

          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === c ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg border border-border group">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
