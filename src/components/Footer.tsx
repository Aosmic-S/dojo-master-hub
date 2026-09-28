import { Link } from "react-router-dom";
import { Phone, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-secondary border-t border-border py-10">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="font-heading text-xl text-gold-gradient mb-3">RAJA JANAK ACADEMY</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Affiliated with Drona Martial Arts Academy. Training champions since inception.
          </p>
          <a href="tel:+916396448776" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-1">
            <Phone className="h-3.5 w-3.5 text-accent" /> +91 63964 48776
          </a>
          <a href="https://maps.app.goo.gl/6pwehRmZg7Kj3i6o8?g_st=ac" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
            <MapPin className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
            <span>Shimla Bypass Rd, near Shiv Mandir,<br />Medinipur, Vikasnagar, Uttarakhand 248142</span>
          </a>
        </div>
        <div>
          <h4 className="font-heading text-sm uppercase tracking-wider text-accent mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {["What We Offer", "Timings & Fees", "Achievements", "Contact"].map((l) => (
              <Link key={l} to={`/${l.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-sm uppercase tracking-wider text-accent mb-3">Affiliations</h4>
          <div className="flex flex-wrap gap-2">
            {["WKF", "KIO", "CKF", "OCA", "IOC", "UKA", "Goju-Ryu"].map((a) => (
              <span key={a} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground border border-border">
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border pt-6 text-center text-muted-foreground text-xs">
        <p>© {new Date().getFullYear()} Raja Janak Academy. All rights reserved.</p>
        <p className="mt-1">Made by <span className="text-accent font-medium">Aosmic Studio</span></p>
      </div>
    </div>
  </footer>
);

export default Footer;
