export type ReportSeverity = 'Critical' | 'Medium' | 'Low' | 'Informational';
export type ReportType = 'Vulnerability' | 'Phishing' | 'Compliance' | 'Incident' | 'Malware';
export type ReportStatus = 'Published' | 'Under Review' | 'Draft' | 'Archived';

export interface AffectedAssetInfo {
  name: string;
  type: string;
  ip?: string;
  version?: string;
}

export interface ReportItem {
  id: string;
  title: string;
  subtitle: string;
  severity: ReportSeverity;
  type: ReportType;
  status: ReportStatus;
  author: string;
  createdAt: string; // e.g. "Oct 28, 2025 14:32 IST"
  dateKey: string;   // ISO date string for range filtering
  overview: string;
  affectedSystemsCount: number;
  affectedAssets: AffectedAssetInfo[];
  cveId?: string;
  cvss?: number;
  recommendations: string[];
}

export interface ReportKPIData {
  totalReports: number;
  totalTrend: string;
  criticalReports: number;
  criticalTrend: string;
  avgReportTime: string;
  avgReportTrend: string;
  reportAccuracy: number;
  accuracyTrend: string;
}

export const initialReportKPIs: ReportKPIData = {
  totalReports: 42,
  totalTrend: '+12%',
  criticalReports: 8,
  criticalTrend: '+1%',
  avgReportTime: '2.6 hrs',
  avgReportTrend: '-18%',
  reportAccuracy: 98,
  accuracyTrend: '+2%',
};

export const mockReportsData: ReportItem[] = [
  {
    id: 'REP-001',
    title: 'Critical RCE in Apache Log4j',
    subtitle: 'CVE-2021-44228 • Exploit Detected',
    severity: 'Critical',
    type: 'Vulnerability',
    status: 'Published',
    author: 'Sayali Yewale',
    createdAt: 'Oct 28, 2025 14:32 IST',
    dateKey: '2025-10-28T14:32:00',
    overview:
      'A critical remote code execution vulnerability has been identified in Apache Log4j, allowing attackers to execute arbitrary code via crafted input.',
    affectedSystemsCount: 2,
    cveId: 'CVE-2021-44228',
    cvss: 9.8,
    affectedAssets: [
      { name: 'web-prod-01', type: 'Web Server', ip: '10.0.1.14', version: 'Log4j 2.14.1' },
      { name: 'auth-gateway-02', type: 'API Gateway', ip: '10.0.2.8', version: 'Log4j 2.14.0' },
    ],
    recommendations: [
      'Upgrade log4j-core library immediately to version 2.17.1 or higher.',
      'Set log4j2.formatMsgNoLookups=true as an interim mitigation parameter.',
      'Inspect perimeter firewall logs for outbound JNDI/LDAP requests.',
    ],
  },
  {
    id: 'REP-002',
    title: 'New Phishing Campaign Detected',
    subtitle: 'Suspicious domain: login-security.com',
    severity: 'Medium',
    type: 'Phishing',
    status: 'Published',
    author: 'SOC Tier 2',
    createdAt: 'Oct 28, 2025 13:50 IST',
    dateKey: '2025-10-28T13:50:00',
    overview:
      'A credential harvesting campaign impersonating the internal SSO portal was intercepted by perimeter mail security gateways. Multiple target inboxes identified.',
    affectedSystemsCount: 4,
    cvss: 6.5,
    affectedAssets: [
      { name: 'mail-edge-01', type: 'Mail Gateway', ip: '192.168.10.5' },
      { name: 'iam-auth-cluster', type: 'Identity Service', ip: '10.0.4.12' },
      { name: 'sso-portal-ext', type: 'SSO Frontend', ip: '10.0.4.15' },
      { name: 'user-workstation-88', type: 'Endpoint', ip: '172.16.8.88' },
    ],
    recommendations: [
      'Block domain login-security.com on edge DNS sinkholes and secure web gateways.',
      'Revoke active session tokens for the 4 targeted user accounts.',
      'Initiate automated password resets and mandate FIDO2 MFA verification.',
    ],
  },
  {
    id: 'REP-003',
    title: 'Deprecated TLS Version',
    subtitle: 'TLS 1.0/1.1 detected',
    severity: 'Low',
    type: 'Compliance',
    status: 'Published',
    author: 'AI Automated',
    createdAt: 'Oct 28, 2025 12:20 IST',
    dateKey: '2025-10-28T12:20:00',
    overview:
      'Legacy TLS 1.0 and 1.1 handshake negotiations were observed on the legacy customer billing portal. This violates PCI-DSS v4.0 Section 4.1 cryptographic standards.',
    affectedSystemsCount: 1,
    cvss: 3.7,
    affectedAssets: [
      { name: 'legacy-billing-app', type: 'Payment Portal', ip: '10.0.8.22', version: 'Nginx 1.16' },
    ],
    recommendations: [
      'Update SSL cipher suites in Nginx configuration to restrict negotiations to TLS 1.2 and TLS 1.3.',
      'Disable CBC-mode ciphers and enforce ECDHE key exchange.',
      'Schedule regression testing for legacy merchant payment clients.',
    ],
  },
  {
    id: 'REP-004',
    title: 'Malicious npm Package',
    subtitle: 'package:colors-hack',
    severity: 'Medium',
    type: 'Malware',
    status: 'Published',
    author: 'Sayali Yewale',
    createdAt: 'Oct 28, 2025 11:15 IST',
    dateKey: '2025-10-28T11:15:00',
    overview:
      'A compromised supply-chain dependency "colors-hack" version 1.4.2 was flagged during CI/CD build scans. Contains obfuscated data exfiltration payloads.',
    affectedSystemsCount: 3,
    cvss: 6.8,
    affectedAssets: [
      { name: 'ci-runner-linux-03', type: 'CI/CD Pipeline', ip: '10.20.1.103' },
      { name: 'analytics-worker-01', type: 'Background Worker', ip: '10.20.2.14' },
      { name: 'dev-staging-env', type: 'Staging Cluster', ip: '10.30.0.5' },
    ],
    recommendations: [
      'Quarantine and purge colors-hack package from the internal artifact cache.',
      'Pin dependencies to verified SHA-512 hashes in package-lock.json.',
      'Audit build agent outbound network egress over the past 48 hours.',
    ],
  },
  {
    id: 'REP-005',
    title: 'Suspicious Login Attempt',
    subtitle: 'User: admin',
    severity: 'Informational',
    type: 'Incident',
    status: 'Published',
    author: 'SOC Tier 2',
    createdAt: 'Oct 28, 2025 10:40 IST',
    dateKey: '2025-10-28T10:40:00',
    overview:
      'Anomalous administrative login attempt originated from an unrecognised geographic location (TOR Exit Node). Automated geo-velocity rule triggered multi-factor challenge.',
    affectedSystemsCount: 1,
    cvss: 2.1,
    affectedAssets: [
      { name: 'vpn-gateway-primary', type: 'VPN Concentrator', ip: '10.0.0.1' },
    ],
    recommendations: [
      'Confirm legitimate travel status with administrative account owner.',
      'Enforce conditional access policies restricting VPN logins to managed corporate devices.',
      'Maintain continuous session audit logging for user admin.',
    ],
  },
  {
    id: 'REP-006',
    title: 'OpenSSH Remote Code Execution (RegreSSHion)',
    subtitle: 'CVE-2024-6387 • Signal Detected',
    severity: 'Critical',
    type: 'Vulnerability',
    status: 'Published',
    author: 'Sayali Yewale',
    createdAt: 'Oct 27, 2025 18:20 IST',
    dateKey: '2025-10-27T18:20:00',
    overview:
      'A signal handler race condition in OpenSSH server (sshd) allows unauthenticated remote code execution as root on glibc-based Linux systems.',
    affectedSystemsCount: 5,
    cveId: 'CVE-2024-6387',
    cvss: 8.1,
    affectedAssets: [
      { name: 'bastion-host-01', type: 'Bastion', ip: '10.0.10.1' },
      { name: 'prod-core-db-01', type: 'Database Host', ip: '10.0.10.15' },
      { name: 'k8s-master-node', type: 'Kubernetes Master', ip: '10.0.20.1' },
    ],
    recommendations: [
      'Upgrade OpenSSH to version 9.8p1 or newer across all exposed hosts.',
      'Set LoginGraceTime to 0 in sshd_config as immediate interim mitigation.',
      'Restrict SSH port 22 access strictly to bastion IP ranges.',
    ],
  },
  {
    id: 'REP-007',
    title: 'Spear Phishing Targeting Executive Credentials',
    subtitle: 'Spoofed CEO communication via external relay',
    severity: 'Critical',
    type: 'Phishing',
    status: 'Published',
    author: 'SOC Tier 2',
    createdAt: 'Oct 27, 2025 15:10 IST',
    dateKey: '2025-10-27T15:10:00',
    overview:
      'Targeted spear phishing campaign spoofing executive leadership requested urgent wire authorization. Email headers reveal origin from compromised third-party vendor.',
    affectedSystemsCount: 2,
    cvss: 7.9,
    affectedAssets: [
      { name: 'mail-exchange-02', type: 'Exchange Server', ip: '10.0.5.12' },
      { name: 'finance-portal', type: 'Finance Application', ip: '10.0.8.4' },
    ],
    recommendations: [
      'Enable strict DMARC enforcement (p=reject) across all inbound corporate domains.',
      'Brief finance personnel on out-of-band verbal wire authorization protocols.',
      'Flag sender domain for enhanced scrutiny in gateway quarantine rules.',
    ],
  },
  {
    id: 'REP-008',
    title: 'SQL Injection in Legacy Customer CRM',
    subtitle: 'CVE-2025-1940 • Unauthenticated SQLi',
    severity: 'Critical',
    type: 'Vulnerability',
    status: 'Under Review',
    author: 'Sayali Yewale',
    createdAt: 'Oct 26, 2025 09:30 IST',
    dateKey: '2025-10-26T09:30:00',
    overview:
      'Improper sanitization of user input in CRM customer lookup endpoint permits unauthenticated boolean-based blind SQL injection into core database tables.',
    affectedSystemsCount: 1,
    cveId: 'CVE-2025-1940',
    cvss: 9.1,
    affectedAssets: [
      { name: 'crm-app-server', type: 'Application Server', ip: '10.0.12.8' },
    ],
    recommendations: [
      'Deploy immediate WAF virtual patching rule blocking single quotes in search parameters.',
      'Refactor database queries using parameterized statements.',
      'Audit database audit logs for unauthorized schema extraction attempts.',
    ],
  },
  {
    id: 'REP-009',
    title: 'Ransomware Canary Alert Triggered',
    subtitle: 'File modification burst on storage volume 4',
    severity: 'Critical',
    type: 'Incident',
    status: 'Published',
    author: 'AI Automated',
    createdAt: 'Oct 25, 2025 22:45 IST',
    dateKey: '2025-10-25T22:45:00',
    overview:
      'Automated honeypot canary files on Shared Volume 4 experienced rapid sequential encryption patterns. Host was automatically quarantined from the core VLAN.',
    affectedSystemsCount: 1,
    cvss: 9.5,
    affectedAssets: [
      { name: 'san-storage-vol4', type: 'Storage Area Network', ip: '10.100.4.1' },
    ],
    recommendations: [
      'Maintain host isolation while extracting forensic memory dumps.',
      'Validate immutable volume snapshots prior to initiating restoration.',
      'Scan enterprise endpoints for lateral movement artifacts using EDR.',
    ],
  },
  {
    id: 'REP-010',
    title: 'Insecure S3 Bucket Permissions Detected',
    subtitle: 'Public read access enabled on backup archive',
    severity: 'Medium',
    type: 'Compliance',
    status: 'Published',
    author: 'AI Automated',
    createdAt: 'Oct 25, 2025 16:15 IST',
    dateKey: '2025-10-25T16:15:00',
    overview:
      'Cloud posture auditor identified an Amazon S3 bucket containing sanitized test database dumps with permissive AllUsers read access enabled.',
    affectedSystemsCount: 1,
    cvss: 5.4,
    affectedAssets: [
      { name: 's3-staging-backups', type: 'Cloud Bucket', ip: 'aws-s3-ap-south-1' },
    ],
    recommendations: [
      'Enable S3 Block Public Access at the organizational account level.',
      'Enable AWS KMS encryption using customer-managed keys.',
      'Review CloudTrail access logs for foreign IP downloads.',
    ],
  },
  {
    id: 'REP-011',
    title: 'Privilege Escalation via Windows Kerberos',
    subtitle: 'CVE-2024-38077 • Windows Server 2022',
    severity: 'Critical',
    type: 'Vulnerability',
    status: 'Published',
    author: 'Sayali Yewale',
    createdAt: 'Oct 24, 2025 11:20 IST',
    dateKey: '2025-10-24T11:20:00',
    overview:
      'Flaw in Windows Remote Desktop Licensing service allows unauthenticated remote attackers to execute code with SYSTEM privileges on domain controllers.',
    affectedSystemsCount: 2,
    cveId: 'CVE-2024-38077',
    cvss: 9.8,
    affectedAssets: [
      { name: 'dc-primary-ad', type: 'Domain Controller', ip: '10.0.0.10' },
      { name: 'dc-secondary-ad', type: 'Domain Controller', ip: '10.0.0.11' },
    ],
    recommendations: [
      'Deploy Microsoft cumulative security update KB5040437 immediately.',
      'Disable Remote Desktop Licensing service on domain controllers.',
      'Audit Kerberos ticket granting requests for PAC spoofing attempts.',
    ],
  },
  {
    id: 'REP-012',
    title: 'Cryptojacking Binary Found in Docker Container',
    subtitle: 'xmrig execution in worker pod',
    severity: 'Medium',
    type: 'Malware',
    status: 'Published',
    author: 'SOC Tier 2',
    createdAt: 'Oct 23, 2025 14:05 IST',
    dateKey: '2025-10-23T14:05:00',
    overview:
      'Kubernetes cluster telemetry identified 100% sustained CPU spikes on worker node 04. Process examination revealed unauthorized XMRig miner execution.',
    affectedSystemsCount: 1,
    cvss: 6.2,
    affectedAssets: [
      { name: 'k8s-worker-node-04', type: 'Kubernetes Node', ip: '10.0.20.14' },
    ],
    recommendations: [
      'Terminate rogue container pod and enforce read-only container root filesystems.',
      'Audit container image registries for unverified public base images.',
      'Restrict outbound stratum protocol mining traffic on edge egress firewalls.',
    ],
  },
  {
    id: 'REP-013',
    title: 'Weak Password Policy on Remote Management Interface',
    subtitle: 'IPMI interface lacking account lockout policy',
    severity: 'Low',
    type: 'Compliance',
    status: 'Published',
    author: 'AI Automated',
    createdAt: 'Oct 22, 2025 17:40 IST',
    dateKey: '2025-10-22T17:40:00',
    overview:
      'Hardware management IPMI interfaces on secondary rack servers were discovered without account lockout thresholds, permitting brute force dictionary attempts.',
    affectedSystemsCount: 4,
    cvss: 3.9,
    affectedAssets: [
      { name: 'rack-02-mgmt-ipmi', type: 'Hardware IPMI', ip: '192.168.100.12' },
      { name: 'rack-02-mgmt-ipmi-b', type: 'Hardware IPMI', ip: '192.168.100.13' },
    ],
    recommendations: [
      'Isolate all IPMI/iLO interfaces to an out-of-band non-routable management network.',
      'Enable 5-attempt account lockouts with 30-minute lockout durations.',
      'Rotate default vendor administrative credentials to 16+ character secrets.',
    ],
  },
  {
    id: 'REP-014',
    title: 'Brand Impersonation Domain Registered',
    subtitle: 'chitti-support-portal.com newly registered',
    severity: 'Informational',
    type: 'Phishing',
    status: 'Published',
    author: 'SOC Tier 2',
    createdAt: 'Oct 21, 2025 08:15 IST',
    dateKey: '2025-10-21T08:15:00',
    overview:
      'External threat intelligence reconnaissance flagged domain chitti-support-portal.com registered via anonymous registrar with active MX records configured.',
    affectedSystemsCount: 0,
    cvss: 2.5,
    affectedAssets: [],
    recommendations: [
      'Submit proactive domain abuse takedown request to registrar.',
      'Add domain to defensive email perimeter blocking rules.',
      'Monitor brand name occurrences across certificate transparency logs.',
    ],
  },
  {
    id: 'REP-015',
    title: 'Fortinet FortiOS Out-of-Bounds Write Vulnerability',
    subtitle: 'CVE-2024-21762 • Critical SSL-VPN RCE',
    severity: 'Critical',
    type: 'Vulnerability',
    status: 'Published',
    author: 'Sayali Yewale',
    createdAt: 'Oct 20, 2025 16:50 IST',
    dateKey: '2025-10-20T16:50:00',
    overview:
      'Critical out-of-bounds write flaw in FortiOS SSL-VPN allows remote unauthenticated attackers to execute arbitrary code or commands via specially crafted HTTP requests.',
    affectedSystemsCount: 2,
    cveId: 'CVE-2024-21762',
    cvss: 9.6,
    affectedAssets: [
      { name: 'edge-firewall-primary', type: 'Firewall Appliance', ip: '203.0.113.1' },
      { name: 'edge-firewall-secondary', type: 'Firewall Appliance', ip: '203.0.113.2' },
    ],
    recommendations: [
      'Upgrade FortiOS firmware to version 7.4.3 or 7.2.7 immediately.',
      'Disable SSL-VPN feature if IPsec VPN tunnels are available as alternatives.',
      'Audit active SSL-VPN connection sessions for anomalous geographic sources.',
    ],
  },
  {
    id: 'REP-016',
    title: 'DDoS Amplification Exposure via Memcached',
    subtitle: 'Port 11211 UDP exposed to public internet',
    severity: 'Medium',
    type: 'Incident',
    status: 'Archived',
    author: 'AI Automated',
    createdAt: 'Oct 19, 2025 11:00 IST',
    dateKey: '2025-10-19T11:00:00',
    overview:
      'External attack surface mapping identified Memcached caching service responding on public UDP port 11211, vulnerable to reflective amplification abuse.',
    affectedSystemsCount: 1,
    cvss: 5.9,
    affectedAssets: [
      { name: 'cache-cluster-01', type: 'Cache Server', ip: '10.0.15.5' },
    ],
    recommendations: [
      'Bind Memcached strictly to localhost or internal loopback interface 127.0.0.1.',
      'Disable UDP listener support by appending -U 0 in memcached configuration.',
      'Verify border ingress filtering blocks inbound traffic on port 11211.',
    ],
  },
  {
    id: 'REP-017',
    title: 'Unencrypted Database Backups in Transit',
    subtitle: 'NFS share transferring unencrypted .sql dumps',
    severity: 'Low',
    type: 'Compliance',
    status: 'Under Review',
    author: 'Sayali Yewale',
    createdAt: 'Oct 18, 2025 14:10 IST',
    dateKey: '2025-10-18T14:10:00',
    overview:
      'Internal network protocol analyzer detected daily database backups transmitted over unencrypted NFSv3 protocol across internal switch trunks.',
    affectedSystemsCount: 2,
    cvss: 3.4,
    affectedAssets: [
      { name: 'db-backup-agent', type: 'Database Backup Agent', ip: '10.0.30.2' },
      { name: 'nfs-backup-storage', type: 'NFS Storage', ip: '10.0.30.10' },
    ],
    recommendations: [
      'Upgrade storage mounts to NFSv4.2 with Kerberos RPCSEC_GSS encryption enabled.',
      'Pre-encrypt backup dump files with GPG/AES-256 before socket transmission.',
      'Review compliance audit logs for internal transmission security requirements.',
    ],
  },
  {
    id: 'REP-018',
    title: 'Adversary Scanning from Known Bulletproof Hosting',
    subtitle: '2,400 reconnaissance probes from AS49981',
    severity: 'Informational',
    type: 'Incident',
    status: 'Published',
    author: 'SOC Tier 2',
    createdAt: 'Oct 17, 2025 19:45 IST',
    dateKey: '2025-10-17T19:45:00',
    overview:
      'High-velocity TCP SYN scanning targeting ports 8080, 8443, and 9000 observed from autonomous system AS49981. Probes were dropped automatically by stateless firewall ACLs.',
    affectedSystemsCount: 1,
    cvss: 2.0,
    affectedAssets: [
      { name: 'perimeter-router-01', type: 'Border Router', ip: '203.0.113.254' },
    ],
    recommendations: [
      'Automate dynamic IP reputation blocklisting for recurring AS49981 subnets.',
      'Monitor for secondary scanning originating from residential proxy pools.',
      'No internal host compromise observed.',
    ],
  },
  {
    id: 'REP-019',
    title: 'Zero-Day Vulnerability in Palo Alto PAN-OS',
    subtitle: 'CVE-2024-3400 • Command Injection in GlobalProtect',
    severity: 'Critical',
    type: 'Vulnerability',
    status: 'Published',
    author: 'Sayali Yewale',
    createdAt: 'Oct 16, 2025 13:15 IST',
    dateKey: '2025-10-16T13:15:00',
    overview:
      'Critical command injection vulnerability in GlobalProtect feature of PAN-OS allows unauthenticated attackers to execute arbitrary code with root privileges.',
    affectedSystemsCount: 2,
    cveId: 'CVE-2024-3400',
    cvss: 10.0,
    affectedAssets: [
      { name: 'pa-vpn-cluster-a', type: 'GlobalProtect Gateway', ip: '203.0.113.50' },
      { name: 'pa-vpn-cluster-b', type: 'GlobalProtect Gateway', ip: '203.0.113.51' },
    ],
    recommendations: [
      'Apply vendor hotfix release PAN-OS 11.1.2-h3 immediately across all gateways.',
      'Enable Threat Prevention signatures 95187, 95189, and 95191.',
      'Disable device telemetry temporarily until maintenance patch window.',
    ],
  },
  {
    id: 'REP-020',
    title: 'Active Directory Kerberoasting Attack Vector',
    subtitle: 'Service account with SPN and RC4 encryption',
    severity: 'Medium',
    type: 'Incident',
    status: 'Published',
    author: 'SOC Tier 2',
    createdAt: 'Oct 15, 2025 10:20 IST',
    dateKey: '2025-10-15T10:20:00',
    overview:
      'Domain security assessment identified a privileged service account svc-sql-sync configured with a Service Principal Name utilizing weak RC4_HMAC_MD5 encryption.',
    affectedSystemsCount: 1,
    cvss: 6.7,
    affectedAssets: [
      { name: 'dc-primary-ad', type: 'Domain Controller', ip: '10.0.0.10' },
    ],
    recommendations: [
      'Migrate service accounts to Group Managed Service Accounts (gMSA).',
      'Disable RC4 encryption types and enforce AES-256 for Kerberos authentication.',
      'Increase service account password entropy to 30+ characters.',
    ],
  },
];
