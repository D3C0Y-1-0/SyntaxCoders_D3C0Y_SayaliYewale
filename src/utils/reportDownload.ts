import { jsPDF } from 'jspdf';
import type { ReportItem } from '../data/reports';

/**
 * Generates an authentic, professionally styled SOC Early Warning PDF
 * using jsPDF and triggers browser download.
 */
export function downloadReportFile(report: ReportItem): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Header Banner
  doc.setFillColor(7, 11, 18); // Dark Navy/Black (#070B12)
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Lime Accent Strip
  doc.setFillColor(198, 244, 50); // CHITTI Lime (#C6F432)
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Brand Titles
  doc.setTextColor(198, 244, 50);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('CHITTI', margin, 15);

  doc.setTextColor(245, 245, 245);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('— Cyber Intelligence Threat Tracker', margin + 22, 15);

  doc.setFontSize(7.5);
  doc.setTextColor(154, 160, 166);
  doc.text(
    'AI-BASED NATIONAL CYBER THREAT EARLY WARNING & DECISION SUPPORT SYSTEM',
    margin,
    23
  );

  // Classification Pill (Top Right)
  doc.setFillColor(220, 38, 38); // Red
  doc.roundedRect(pageWidth - margin - 48, 10, 48, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('RESTRICTED // SOC TIER-2', pageWidth - margin - 45, 15);

  // 2. Incident Summary Card Box
  let currentY = 38;
  doc.setFillColor(248, 250, 252); // Very light grey background for readability
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 30, 2, 2, 'FD');

  // Metadata 4-Column Grid inside Box
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');

  // Col 1: Report ID & Status
  doc.text('REPORT IDENTIFIER', margin + 5, currentY + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`#${report.id}`, margin + 5, currentY + 13);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('INVESTIGATION STATUS', margin + 5, currentY + 20);
  doc.setTextColor(16, 185, 129); // Green
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(report.status.toUpperCase(), margin + 5, currentY + 26);

  // Col 2: Date & Author
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('DATE GENERATED', margin + 50, currentY + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(report.createdAt, margin + 50, currentY + 13);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('LEAD ANALYST', margin + 50, currentY + 20);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(report.author, margin + 50, currentY + 26);

  // Col 3: Severity Badge
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('SEVERITY TIER', margin + 98, currentY + 7);

  const isCritical = report.severity === 'Critical';
  const isMedium = report.severity === 'Medium';
  if (isCritical) {
    doc.setFillColor(239, 68, 68); // Red
  } else if (isMedium) {
    doc.setFillColor(245, 158, 11); // Amber
  } else {
    doc.setFillColor(16, 185, 129); // Green
  }
  doc.roundedRect(margin + 98, currentY + 9, 28, 6, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(report.severity.toUpperCase(), margin + 102, currentY + 13.5);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('THREAT CATEGORY', margin + 98, currentY + 20);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(report.type, margin + 98, currentY + 26);

  // Col 4: CVSS & CVE
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('CVSS BASE SCORE', margin + 140, currentY + 7);
  doc.setTextColor(220, 38, 38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(report.cvss ? `${report.cvss} / 10.0` : 'N/A', margin + 140, currentY + 13);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('CVE IDENTIFIER', margin + 140, currentY + 20);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(report.cveId || 'ANOMALY-FEED', margin + 140, currentY + 26);

  // 3. Section: Executive Summary & Overview
  currentY += 38;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. EXECUTIVE INCIDENT OVERVIEW', margin, currentY);

  doc.setDrawColor(198, 244, 50);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY + 2, margin + 65, currentY + 2);

  currentY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(report.title, margin, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Telemetry Reference: ${report.subtitle}`, margin, currentY);

  currentY += 6;
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const overviewLines = doc.splitTextToSize(report.overview, contentWidth);
  doc.text(overviewLines, margin, currentY);

  currentY += overviewLines.length * 4.5 + 6;

  // 4. Section: Affected Systems & Assets
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(
    `2. AFFECTED SYSTEMS & INFRASTRUCTURE (${report.affectedSystemsCount} Matched Assets)`,
    margin,
    currentY
  );

  doc.setDrawColor(198, 244, 50);
  doc.line(margin, currentY + 2, margin + 85, currentY + 2);

  currentY += 7;

  // Table Header
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('HOSTNAME / ASSET', margin + 4, currentY + 4.8);
  doc.text('ASSET TYPE', margin + 65, currentY + 4.8);
  doc.text('IP ADDRESS', margin + 110, currentY + 4.8);
  doc.text('DETECTED VERSION', margin + 148, currentY + 4.8);

  currentY += 7;

  // Table Rows
  if (report.affectedAssets.length > 0) {
    report.affectedAssets.forEach((asset, idx) => {
      const isAlt = idx % 2 === 1;
      if (isAlt) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, currentY, contentWidth, 6.5, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, currentY + 6.5, margin + contentWidth, currentY + 6.5);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(asset.name, margin + 4, currentY + 4.5);
      doc.text(asset.type, margin + 65, currentY + 4.5);
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.text(asset.ip || '10.0.4.12', margin + 110, currentY + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(asset.version || 'v2.4.52', margin + 148, currentY + 4.5);

      currentY += 6.5;
    });
  } else {
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(
      'No immediate internal hosts compromised (Identity/External Origin Vector).',
      margin + 4,
      currentY + 4.8
    );
    currentY += 7;
  }

  currentY += 6;

  // 5. Section: Prescribed Remediation Actions
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. PRESCRIBED MITIGATION WORKFLOW & ACTIONS', margin, currentY);

  doc.setDrawColor(198, 244, 50);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY + 2, margin + 85, currentY + 2);

  currentY += 8;

  report.recommendations.forEach((rec, idx) => {
    // Action number badge
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin, currentY - 3.5, 6, 5, 1, 1, 'F');
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`${idx + 1}`, margin + 1.8, currentY);

    // Recommendation Text
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const recLines = doc.splitTextToSize(rec, contentWidth - 10);
    doc.text(recLines, margin + 9, currentY);

    currentY += recLines.length * 4.2 + 2.5;
  });

  // 6. Footer (Confidentiality & Watermark)
  const footerY = pageHeight - 12;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    `CHITTI Early Warning Intelligence Dispatch • Incident Ref: ADV-${report.id} • Auth: ${report.author}`,
    margin,
    footerY + 1
  );
  doc.text('Page 1 of 1 • Strict SOC Handling Only', pageWidth - margin - 50, footerY + 1);

  // 7. Sanitize filename and Trigger Native PDF Save
  const sanitizedTitle = report.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const filename = `CHITTI-Report-${report.id}-${sanitizedTitle}.pdf`;

  doc.save(filename);
}
