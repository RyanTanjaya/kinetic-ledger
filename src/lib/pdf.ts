import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Invoice, ProfileSettings } from '../types';

// ASCII-safe currency prefixes (Helvetica/WinAnsi can't render every symbol).
const SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: 'EUR ',
  GBP: 'GBP ',
  SGD: 'S$',
  AUD: 'A$',
  MYR: 'RM ',
};

// Strip characters the standard PDF font can't encode.
const clean = (s: string) => (s ?? '').replace(/[^\x20-\x7E]/g, '');

/** Build a professional one-page PDF invoice and trigger a browser download. */
export async function downloadInvoicePdf(invoice: Invoice, settings: ProfileSettings): Promise<void> {
  const symbol = SYMBOLS[settings.currency] || '$';
  const money = (v: number) => symbol + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const ink = rgb(0.06, 0.09, 0.16);
  const muted = rgb(0.45, 0.5, 0.58);
  const rule = rgb(0.88, 0.9, 0.93);
  const M = 50;

  const text = (s: string, x: number, y: number, size: number, f = font, color = ink) =>
    page.drawText(clean(s), { x, y, size, font: f, color });
  const rightText = (s: string, xRight: number, y: number, size: number, f = font, color = ink) => {
    const c = clean(s);
    page.drawText(c, { x: xRight - f.widthOfTextAtSize(c, size), y, size, font: f, color });
  };
  const hr = (y: number, thickness = 1, color = rule) =>
    page.drawLine({ start: { x: M, y }, end: { x: width - M, y }, thickness, color });

  let y = 791;

  // Header
  text(settings.businessName || 'Ryan Dev Studio', M, y, 18, bold);
  text(settings.email || '', M, y - 17, 9, font, muted);
  rightText('INVOICE', width - M, y, 22, bold);
  rightText(invoice.id, width - M, y - 19, 11, font, muted);
  y -= 46;
  hr(y);
  y -= 26;

  // Bill to + dates
  text('BILL TO', M, y, 8, bold, muted);
  text(invoice.clientName, M, y - 15, 12, bold);
  if (invoice.clientCompany) text(invoice.clientCompany, M, y - 30, 9, font, muted);
  rightText('Issued: ' + invoice.issueDate, width - M, y, 9, font, muted);
  rightText('Due: ' + invoice.dueDate, width - M, y - 15, 9, font, ink);
  y -= 58;

  // Line items header
  const colQtyR = 380;
  const colRateR = 470;
  const colAmtR = width - M;
  text('DESCRIPTION', M, y, 8, bold, muted);
  rightText('QTY', colQtyR, y, 8, bold, muted);
  rightText('RATE', colRateR, y, 8, bold, muted);
  rightText('AMOUNT', colAmtR, y, 8, bold, muted);
  y -= 10;
  hr(y);
  y -= 20;

  for (const it of invoice.lineItems) {
    text(it.description, M, y, 10);
    rightText(String(it.qty), colQtyR, y, 10, font, muted);
    rightText(money(it.unitPrice), colRateR, y, 10, font, muted);
    rightText(money(it.qty * it.unitPrice), colAmtR, y, 10, bold);
    y -= 19;
  }

  y -= 6;
  hr(y, 1.5, ink);
  y -= 24;
  rightText('TOTAL', colRateR, y, 11, bold, muted);
  rightText(money(invoice.amount), colAmtR, y, 15, bold);
  y -= 42;

  // Notes (wrapped)
  if (invoice.notes) {
    text('NOTES', M, y, 8, bold, muted);
    y -= 15;
    const maxW = width - 2 * M;
    let lineStr = '';
    for (const word of clean(invoice.notes).split(/\s+/)) {
      const test = lineStr ? lineStr + ' ' + word : word;
      if (font.widthOfTextAtSize(test, 9) > maxW) {
        text(lineStr, M, y, 9, font, muted);
        y -= 13;
        lineStr = word;
      } else {
        lineStr = test;
      }
    }
    if (lineStr) text(lineStr, M, y, 9, font, muted);
  }

  text('Generated with Kinetic Ledger', M, 40, 8, font, muted);

  const bytes = await pdf.save();
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.id}_${clean(invoice.clientName).replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
