import { jsPDF } from "jspdf";

const FOOTER_Y = 288; // mm from the top of the A4 page (baseline)
const START_FONT_SIZE = 8; // pt
const MIN_FONT_SIZE = 5; // pt
const PT_TO_MM = 0.3528;

/**
 * Prints a play link centred in the page footer, as a manual fallback to the QR.
 *
 * People copy this by hand, so it has to stay on ONE line: PDF viewers detect a
 * link per text line, and a URL wrapped in two loses everything after the break
 * when it is clicked or pasted (for event plays that was `eventId`, so the play
 * was not tagged to its event). The font shrinks until the whole link fits, and
 * a real link annotation covers the text so clicking never relies on the
 * viewer's own detection. Only if even the smallest size does not fit does it
 * wrap — the parameters printed last are then the ones at risk.
 */
export function drawFooterLink(doc: jsPDF, pageW: number, link: string): void {
  const maxWidth = pageW - 24;

  doc.setFont("helvetica", "normal");
  let fontSize = START_FONT_SIZE;
  doc.setFontSize(fontSize);
  while (fontSize > MIN_FONT_SIZE && doc.getTextWidth(link) > maxWidth) {
    fontSize -= 0.5;
    doc.setFontSize(fontSize);
  }

  doc.setTextColor(120, 120, 120);
  const lines: string[] = doc.splitTextToSize(link, maxWidth);
  doc.text(lines, pageW / 2, FOOTER_Y, { align: "center" });

  const lineHeight = fontSize * PT_TO_MM * doc.getLineHeightFactor();
  const w = Math.max(...lines.map((line) => doc.getTextWidth(line)));
  doc.link(
    (pageW - w) / 2,
    FOOTER_Y - fontSize * PT_TO_MM,
    w,
    lines.length * lineHeight,
    { url: link }
  );
}
