import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "Tournaments", "Training", "Events", "Belts"];

const Gallery = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("gallery_photos").select("*").order("display_order");
      setPhotos(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filter === "All" ? photos : photos.filter((p) => p.category === filter);

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
              <button key={c} onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === c ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground">No photos yet. Admin can upload from the dashboard.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((img) => (
                <div key={img.id} className="aspect-square overflow-hidden rounded-lg border border-border group">
                  <img src={img.image_url} alt={img.alt_text || ""} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
