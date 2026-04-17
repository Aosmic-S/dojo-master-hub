import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportPayload {
  student: {
    full_name: string;
    belt_level: string;
    father_name?: string | null;
    contact_number?: string | null;
    profile_photo_url?: string | null;
  };
  weekStart: string;
  weekEnd: string;
  summary: string;
  dailyReports?: Array<{
    date: string;
    attendance: string;
    performance?: string | null;
    skills_practiced?: string | null;
    remarks?: string | null;
  }>;
}

const CRIMSON: [number, number, number] = [196, 30, 30];
const GOLD: [number, number, number] = [212, 165, 30];
const DARK: [number, number, number] = [20, 20, 20];
const MUTED: [number, number, number] = [110, 110, 110];

export function generateWeeklyReportPDF(data: ReportPayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header band
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setFillColor(...CRIMSON);
  doc.rect(0, 90, pageWidth, 4, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 94, pageWidth, 2, "F");

  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("RAJA JANAK ACADEMY", margin, 42);

  doc.setTextColor(230, 230, 230);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Affiliated with Drona Martial Arts Academy (WKF, KIO, SAKF, IOC)", margin, 60);

  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("WEEKLY PROGRESS REPORT", pageWidth - margin, 42, { align: "right" });
  doc.setTextColor(200, 200, 200);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${data.weekStart}  to  ${data.weekEnd}`, pageWidth - margin, 60, { align: "right" });

  // Student info card
  let y = 130;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 80, 6, 6, "FD");

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(data.student.full_name, margin + 16, y + 26);

  doc.setFillColor(...CRIMSON);
  doc.roundedRect(margin + 16, y + 36, 90, 18, 9, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`${data.student.belt_level} BELT`, margin + 61, y + 48, { align: "center" });

  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (data.student.father_name) doc.text(`Father: ${data.student.father_name}`, margin + 120, y + 46);
  if (data.student.contact_number) doc.text(`Contact: ${data.student.contact_number}`, margin + 120, y + 60);

  y += 105;

  // Summary section
  doc.setTextColor(...CRIMSON);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("WEEKLY SUMMARY", margin, y);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.line(margin, y + 4, margin + 130, y + 4);
  y += 18;

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(data.summary, pageWidth - margin * 2);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 13 + 18;

  // Daily breakdown table
  if (data.dailyReports && data.dailyReports.length > 0) {
    doc.setTextColor(...CRIMSON);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DAILY BREAKDOWN", margin, y);
    doc.line(margin, y + 4, margin + 130, y + 4);
    y += 12;

    autoTable(doc, {
      startY: y,
      head: [["Date", "Attendance", "Performance", "Skills", "Remarks"]],
      body: data.dailyReports.map((r) => [
        r.date,
        r.attendance,
        r.performance || "—",
        r.skills_practiced || "—",
        r.remarks || "—",
      ]),
      styles: { fontSize: 8, cellPadding: 6, textColor: DARK },
      headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { left: margin, right: margin },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(margin, ph - 36, pageWidth - margin, ph - 36);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("Raja Janak Academy — Discipline. Strength. Honour.", margin, ph - 22);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, ph - 22, { align: "right" });
  }

  const filename = `weekly-report-${data.student.full_name.replace(/\s+/g, "-")}-${data.weekEnd}.pdf`;
  doc.save(filename);
}
