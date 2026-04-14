import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", phone: "", email: "", message: "" });
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-lg">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-4">
            GET IN <span className="text-gold-gradient">TOUCH</span>
          </h1>
          <p className="text-muted-foreground text-center mb-12">
            Ready to start your journey? Send us a message.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-secondary border-border"
            />
            <Input
              placeholder="Phone Number *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-secondary border-border"
            />
            <Input
              placeholder="Email (optional)"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-secondary border-border"
            />
            <Textarea
              placeholder="Your Message *"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-secondary border-border"
            />
            <Button type="submit" size="lg" className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading text-lg">
              SEND MESSAGE
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
