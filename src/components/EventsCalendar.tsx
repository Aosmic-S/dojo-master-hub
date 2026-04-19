import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, Trash2, MapPin, Clock, X, CalendarDays } from "lucide-react";
import { toast } from "sonner";

type AcademyEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  is_all_day: boolean;
  audience: string;
  location: string | null;
  display_color: string;
};

const COLORS: Record<string, string> = {
  accent: "hsl(var(--accent))",
  primary: "hsl(var(--primary))",
  emerald: "hsl(152, 65%, 45%)",
  sky: "hsl(199, 80%, 55%)",
  violet: "hsl(265, 70%, 60%)",
};

const todayStr = () => new Date().toISOString().split("T")[0];

const EventsCalendar = ({ canManage }: { canManage: boolean }) => {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [events, setEvents] = useState<AcademyEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", event_date: todayStr(),
    start_time: "", end_time: "", is_all_day: true,
    audience: "all", location: "", display_color: "accent",
  });

  const monthStart = useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth(), 1), [cursor]);
  const monthEnd = useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0), [cursor]);

  const loadEvents = async () => {
    const start = monthStart.toISOString().split("T")[0];
    const end = monthEnd.toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("academy_events").select("*")
      .gte("event_date", start).lte("event_date", end)
      .order("event_date").order("start_time", { nullsFirst: true });
    if (error) { toast.error(error.message); return; }
    setEvents((data as AcademyEvent[]) || []);
  };

  useEffect(() => { loadEvents(); /* eslint-disable-next-line */ }, [monthStart.getTime()]);

  const eventsByDate = useMemo(() => {
    const m = new Map<string, AcademyEvent[]>();
    events.forEach((e) => {
      const list = m.get(e.event_date) || [];
      list.push(e);
      m.set(e.event_date, list);
    });
    return m;
  }, [events]);

  // Build 6-row grid starting on Sunday
  const cells = useMemo(() => {
    const firstDow = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();
    const arr: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < firstDow; i++) {
      const d = new Date(monthStart);
      d.setDate(d.getDate() - (firstDow - i));
      arr.push({ date: d, inMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push({ date: new Date(cursor.getFullYear(), cursor.getMonth(), i), inMonth: true });
    }
    while (arr.length % 7 !== 0 || arr.length < 42) {
      const last = arr[arr.length - 1].date;
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      arr.push({ date: d, inMonth: false });
      if (arr.length >= 42) break;
    }
    return arr;
  }, [cursor, monthStart, monthEnd]);

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = todayStr();

  const openCreate = (date?: string) => {
    if (!canManage) { setSelectedDate(date || null); return; }
    setForm({
      title: "", description: "", event_date: date || todayStr(),
      start_time: "", end_time: "", is_all_day: true,
      audience: "all", location: "", display_color: "accent",
    });
    setShowForm(true);
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.event_date) { toast.error("Title and date are required"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_date: form.event_date,
      start_time: form.is_all_day ? null : (form.start_time || null),
      end_time: form.is_all_day ? null : (form.end_time || null),
      is_all_day: form.is_all_day,
      audience: form.audience,
      location: form.location.trim() || null,
      display_color: form.display_color,
      created_by: user?.id ?? null,
    };
    const { error } = await supabase.from("academy_events").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Event added!");
    setShowForm(false);
    await loadEvents();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("academy_events").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Event deleted");
    await loadEvents();
  };

  const dayEvents = selectedDate ? eventsByDate.get(selectedDate) || [] : [];

  return (
    <div className="bg-card-gradient border border-border rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-accent/15 flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold">Academy Events Calendar</h3>
            <p className="text-xs text-muted-foreground">Plan tournaments, gradings, seminars & holidays</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" className="h-9 w-9 border-border" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-heading text-sm uppercase tracking-wider min-w-[140px] text-center">{monthLabel}</span>
          <Button size="icon" variant="outline" className="h-9 w-9 border-border" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {canManage && (
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading h-9 ml-1" onClick={() => openCreate()}>
              <Plus className="h-4 w-4 mr-1" /> Event
            </Button>
          )}
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-heading uppercase tracking-wider text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map(({ date, inMonth }, idx) => {
          const dateStr = date.toISOString().split("T")[0];
          const dayEvts = eventsByDate.get(dateStr) || [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(dateStr)}
              onDoubleClick={() => canManage && openCreate(dateStr)}
              className={`relative min-h-[64px] sm:min-h-[78px] rounded-md border text-left p-1.5 transition-all ${
                isSelected
                  ? "border-accent bg-accent/10 gold-glow"
                  : isToday
                  ? "border-accent/60 bg-secondary/60"
                  : inMonth
                  ? "border-border bg-secondary/30 hover:border-accent/40"
                  : "border-border/40 bg-transparent opacity-50"
              }`}
            >
              <span className={`text-xs font-heading ${isToday ? "text-accent font-bold" : inMonth ? "text-foreground" : "text-muted-foreground"}`}>
                {date.getDate()}
              </span>
              <div className="mt-1 flex flex-col gap-0.5">
                {dayEvts.slice(0, 2).map((e) => (
                  <span
                    key={e.id}
                    className="block text-[9px] sm:text-[10px] truncate rounded px-1 py-0.5 text-foreground/90"
                    style={{ backgroundColor: `${COLORS[e.display_color] || COLORS.accent}33`, borderLeft: `2px solid ${COLORS[e.display_color] || COLORS.accent}` }}
                    title={e.title}
                  >
                    {e.title}
                  </span>
                ))}
                {dayEvts.length > 2 && (
                  <span className="text-[9px] text-muted-foreground">+{dayEvts.length - 2} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day list */}
      {selectedDate && (
        <div className="mt-5 border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-heading text-sm font-semibold">
              {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </h4>
            {canManage && (
              <Button size="sm" variant="outline" className="h-8 text-xs border-accent text-accent" onClick={() => openCreate(selectedDate)}>
                <Plus className="h-3 w-3 mr-1" /> Add for this day
              </Button>
            )}
          </div>
          {dayEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No events planned for this day.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {dayEvents.map((e) => (
                <div key={e.id} className="bg-secondary/60 border border-border rounded-lg p-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[e.display_color] || COLORS.accent }} />
                      <h5 className="font-heading text-sm font-semibold truncate">{e.title}</h5>
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">{e.audience}</span>
                    </div>
                    {e.description && <p className="text-xs text-muted-foreground mb-1">{e.description}</p>}
                    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {e.is_all_day ? "All day" : `${e.start_time?.slice(0, 5) || "—"}${e.end_time ? ` – ${e.end_time.slice(0, 5)}` : ""}`}</span>
                      {e.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>}
                    </div>
                  </div>
                  {canManage && (
                    <button onClick={() => handleDelete(e.id)} className="text-destructive hover:text-destructive/80 transition-colors p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-lg font-semibold">New Academy Event</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border" />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border" rows={2} />
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Event Date *</label>
                <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="bg-secondary border-border" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_all_day} onChange={(e) => setForm({ ...form, is_all_day: e.target.checked })} />
                All day
              </label>
              {!form.is_all_day && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">Start</label>
                    <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="bg-secondary border-border" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">End</label>
                    <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="bg-secondary border-border" />
                  </div>
                </div>
              )}
              <Input placeholder="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-secondary border-border" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Audience</label>
                  <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                    <option value="all">All</option><option value="juniors">Juniors</option><option value="seniors">Seniors</option><option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Color</label>
                  <select value={form.display_color} onChange={(e) => setForm({ ...form, display_color: e.target.value })} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground">
                    <option value="accent">Gold</option><option value="primary">Crimson</option><option value="emerald">Emerald</option><option value="sky">Sky</option><option value="violet">Violet</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleCreate} className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading">CREATE EVENT</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;
