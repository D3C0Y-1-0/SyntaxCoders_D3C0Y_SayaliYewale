import type { ReportItem } from '../data/reports';

export function generateReportMarkdown(report: ReportItem): string {
  const assetsTable = report.affectedAssets.length > 0
    ? report.affectedAssets
        .map((a, i) => `| ${i + 1} | ${a.name} | ${a.type} | ${a.ip || 'N/A'} | ${a.version || 'N/A'} |`)
        .join('\n')
    : '| - | None (External / Identity Vector) | - | - | - |';

  const recommendationsList = report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');

  return `# CHITTI – Cyber Intelligence Threat Tracker
## SECURITY INCIDENT & INTELLIGENCE REPORT

---
**Report ID:** ${report.id}  
**Classification:** RESTRICTED / SOC TIER 2  
**Generated At:** ${report.createdAt}  
**Lead Analyst / Author:** ${report.author}  
**Investigation Status:** ${report.status}  

---

### 1. Executive Summary
- **Title:** ${report.title}
- **Telemetry Reference:** ${report.subtitle}
- **Severity Level:** ${report.severity.toUpperCase()}
- **Threat Category:** ${report.type}
${report.cvss ? `- **CVSS Base Score:** ${report.cvss} / 10.0\n` : ''}${report.cveId ? `- **CVE Identifier:** ${report.cveId}\n` : ''}
### 2. Incident Overview
${report.overview}

---

### 3. Affected Systems & Assets (${report.affectedSystemsCount} Matched)
| # | Hostname / Asset | Asset Type | IP Address | Detected Version |
|---|---|---|---|---|
${assetsTable}

---

### 4. Prescribed Remediation Actions
${recommendationsList}

---
*Notice: This early-warning security report was compiled using CHITTI Defense Analytics. For authorization requests or escalation, contact the SOC Command Center.*
`;
}

export function downloadReportFile(report: ReportItem): void {
  const content = generateReportMarkdown(report);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const sanitizedTitle = report.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  link.download = `CHITTI-Report-${report.id}-${sanitizedTitle}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
