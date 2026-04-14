import Layout from "@/components/Layout";
import { MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Location = () => (
  <Layout>
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-4">
          FIND <span className="text-gold-gradient">US</span>
        </h1>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-16">
          Visit the dojo or reach out — we'd love to hear from you.
        </p>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="rounded-lg overflow-hidden border border-border aspect-video">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.8743!2d85.1376!3d26.6013!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDM2JzA0LjciTiA4NcKwMDgnMTUuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Raja Janak Academy Location"
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-card-gradient border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg font-semibold mb-1">Address</h3>
                  <p className="text-muted-foreground text-sm">
                    Raja Janak Academy, Main Road,<br />
                    Near City Center, Bihar, India
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card-gradient border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg font-semibold mb-1">Phone</h3>
                  <p className="text-muted-foreground text-sm">+91 98765 43210</p>
                </div>
              </div>
            </div>

            <div className="bg-card-gradient border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground text-sm">info@rajajanakacademy.com</p>
                </div>
              </div>
            </div>

            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,30%)] text-primary-foreground font-heading text-lg py-6">
                💬 Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default Location;
