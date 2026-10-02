import { useState } from "react";
import { createPortal } from "react-dom";
import { 
  Activity, Award, BarChart3, Calendar, CalendarCheck, 
  ChevronRight, Image, IndianRupee, LayoutDashboard, 
  Megaphone, Menu, MessageCircle, Settings, ShieldCheck, Users, X 
} from "lucide-react";

export type SenseiTab = 
  | "overview" 
  | "students" 
  | "attendance" 
  | "duty" 
  | "fees" 
  | "analytics" 
  | "calendar" 
  | "messages" 
  | "achievements" 
  | "gallery" 
  | "timings" 
  | "announcements" 
  | "settings";

import { Button } from "@/components/ui/button";

const sections = [
  { label: "DOJO", items: [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "attendance", label: "Mark Attendance", icon: CalendarCheck },
    { key: "duty", label: "Senior Duty", icon: ShieldCheck },
    { key: "students", label: "Students", icon: Users },
    { key: "analytics", label: "Analytics", icon: Activity },
    { key: "calendar", label: "Calendar", icon: Calendar },
    { key: "messages", label: "Messages", icon: MessageCircle },
    { key: "fees", label: "Payments", icon: IndianRupee },
  ] },

  { label: "ACADEMY", items: [
    { key: "achievements", label: "Achievements", icon: Award },
    { key: "gallery", label: "Gallery", icon: Image },
    { key: "timings", label: "Timings & fees", icon: BarChart3 },
    { key: "announcements", label: "Announcements", icon: Megaphone },
  ] },
  { label: "ACCOUNT", items: [{ key: "settings", label: "Settings", icon: Settings }] },
] as const;

const labelFor = (tab: SenseiTab) => {
  for (const section of sections) {
    const item = section.items.find((entry) => entry.key === tab);
    if (item) return item.label;
  }
  return "Overview";
};

export function SenseiNavigation({ activeTab, onNavigate }: { activeTab: SenseiTab; onNavigate: (tab: SenseiTab) => void }) {
  const [open, setOpen] = useState(false);
  const choose = (tab: SenseiTab) => { onNavigate(tab); setOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const list = (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{section.label}</p>
          <div className="space-y-0.5">
            {section.items.map(({ key, label, icon: Icon }) => (
              <Button key={key} type="button" variant="ghost" onClick={() => choose(key)} aria-current={activeTab === key ? "page" : undefined}
                className={`w-full h-11 justify-start gap-3 px-3 rounded-md text-sm font-medium ${activeTab === key ? "bg-accent/10 text-accent border-l-2 border-accent hover:bg-accent/15 hover:text-accent" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Icon className="h-4 w-4 shrink-0" /> <span className="flex-1 text-left">{label}</span>
                {activeTab === key && <ChevronRight className="h-3.5 w-3.5" />}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="lg:hidden flex items-center justify-between gap-3 border-b border-border pb-4 mb-6">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-accent font-semibold">Sensei console</p>
          <h2 className="font-heading text-2xl leading-none mt-1 truncate">{labelFor(activeTab)}</h2>
        </div>
        <Button type="button" variant="outline" onClick={() => setOpen(true)} aria-label="Open dashboard sections" aria-expanded={open} className="shrink-0 h-11 border-border">
          <Menu className="h-4 w-4" /> Sections
        </Button>
      </div>
      <aside aria-label="Dashboard sections" className="hidden lg:block w-52 xl:w-56 shrink-0 sticky top-24 self-start border-r border-border pr-4 pb-8">{list}</aside>
      {open && createPortal((
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-background/80" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside aria-label="Dashboard sections" className="absolute top-0 bottom-0 left-0 w-[min(85vw,320px)] overflow-y-auto bg-card border-r border-border p-5 shadow-xl">
            <div className="flex items-center justify-between mb-7">
              <div><p className="text-[10px] text-accent font-semibold uppercase tracking-widest">Raja Janak Academy</p><h2 className="font-heading text-2xl">Sensei Console</h2></div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close dashboard sections"><X className="h-5 w-5" /></Button>
            </div>
            {list}
          </aside>
        </div>
      ), document.body)}
    </>
  );
}
