export type RiskLevel = 'High' | 'Medium' | 'Low';
export type ThreatStatus = 'Active' | 'Investigating' | 'Monitoring' | 'Resolved' | 'Acknowledged';

export interface ThreatAsset {
  name: string;
  version?: string;
  type?: 'server' | 'database' | 'app' | 'network';
  risk?: 'critical' | 'high' | 'medium' | 'low';
}

export interface ThreatItem {
  id: string;
  title: string;
  subtitle: string;
  riskLevel: RiskLevel;
  score: number;
  publishedAt: string;
  status: ThreatStatus;
  summary: string;
  assets: ThreatAsset[];
  actions: string[];
  iconType?: 'warning' | 'alert' | 'info' | 'shield';
}

export const initialThreats: ThreatItem[] = [
  // Page 1 (matches screenshot rows 1 to 5 exactly)
  {
    id: 'THR-001',
    title: 'Critical RCE in Apache Log4j',
    subtitle: 'CVE-2021-44228',
    riskLevel: 'High',
    score: 9.8,
    publishedAt: 'Oct 28, 2025 14:32 IST',
    status: 'Active',
    summary: 'A critical remote code execution vulnerability has been identified in Apache Log4j, allowing attackers to execute arbitrary code via crafted input.',
    assets: [
      { name: 'Web Server', version: 'v2.17', risk: 'critical', type: 'server' },
      { name: 'Database', version: 'v8.0', risk: 'medium', type: 'database' },
    ],
    actions: [
      'Apply latest security patch for Log4j.',
      'Monitor for suspicious activity.',
      'Review access logs.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-002',
    title: 'New Phishing Campaign Detected',
    subtitle: 'TLP:AMBER',
    riskLevel: 'Medium',
    score: 7.2,
    publishedAt: 'Oct 28, 2025 13:50 IST',
    status: 'Investigating',
    summary: 'High-volume spear phishing campaign leveraging cloned SSO login portals discovered targeting executive credentials via typosquatted domains.',
    assets: [
      { name: 'Corporate Mail Gateway', version: 'v4.12', risk: 'high', type: 'app' },
      { name: 'Identity Broker SSO', version: 'v23.0', risk: 'medium', type: 'server' },
    ],
    actions: [
      'Quarantine inbound messages containing sender domain lookalikes.',
      'Force password reset and MFA prompt on targeted email addresses.',
      'Submit domain block requests to DNS resolver feeds.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-003',
    title: 'Deprecated TLS Version',
    subtitle: 'RFC 8996',
    riskLevel: 'Low',
    score: 4.1,
    publishedAt: 'Oct 28, 2025 12:20 IST',
    status: 'Monitoring',
    summary: 'Legacy TLS 1.0 and 1.1 handshake negotiations detected on public egress reverse proxy, violating PCI-DSS and national cryptographic baselines.',
    assets: [
      { name: 'Edge Reverse Proxy', version: 'v1.24', risk: 'medium', type: 'server' },
    ],
    actions: [
      'Disable TLS 1.0/1.1 protocols in Nginx configuration.',
      'Verify cipher suite deprecation compatibility with legacy API clients.',
      'Issue client migration advisory ahead of hard cipher cutoff.',
    ],
    iconType: 'info',
  },
  {
    id: 'THR-004',
    title: 'Malicious npm Package',
    subtitle: 'package:colors-hack',
    riskLevel: 'High',
    score: 8.7,
    publishedAt: 'Oct 28, 2025 11:15 IST',
    status: 'Active',
    summary: 'Compromised open source dependency identified exfiltrating developer AWS session tokens and environment secrets during preinstall scripts.',
    assets: [
      { name: 'CI/CD Build Pipeline', version: 'v3.2', risk: 'critical', type: 'app' },
      { name: 'Frontend Staging Cluster', version: 'v1.19', risk: 'high', type: 'server' },
    ],
    actions: [
      'Pin dependencies to clean semantic hashes in package-lock.json.',
      'Purge artifact repository cache and rotate leaked build tokens.',
      'Run Sonatype / Snyk software composition scan across repos.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-005',
    title: 'Suspicious Login Attempt',
    subtitle: 'User: admin',
    riskLevel: 'Medium',
    score: 6.3,
    publishedAt: 'Oct 28, 2025 10:40 IST',
    status: 'Resolved',
    summary: 'Distributed credential brute force cluster originating from anonymized TOR exit nodes targeted privileged administrative dashboard.',
    assets: [
      { name: 'Admin Console Portal', version: 'v5.4', risk: 'medium', type: 'app' },
    ],
    actions: [
      'Enforce IP rate-limiting policy on administrative endpoints.',
      'Trigger geofence challenge on non-domestic ASN logins.',
      'Confirm administrative session revocation in central IAM.',
    ],
    iconType: 'warning',
  },

  // Page 2 (rows 6 to 10)
  {
    id: 'THR-006',
    title: 'OpenSSH RegreSSHion RCE Flaw',
    subtitle: 'CVE-2024-6387',
    riskLevel: 'High',
    score: 9.1,
    publishedAt: 'Oct 28, 2025 09:30 IST',
    status: 'Active',
    summary: 'Signal handler race condition in OpenSSH daemon (sshd) allows unauthenticated remote code execution as root on glibc-based Linux systems.',
    assets: [
      { name: 'Bastion SSH Gateway', version: 'v9.3p1', risk: 'critical', type: 'server' },
      { name: 'Backend Worker Nodes', version: 'v9.2p1', risk: 'high', type: 'server' },
    ],
    actions: [
      'Deploy upstream OpenSSH 9.8p1 security release.',
      'Set LoginGraceTime to 0 in sshd_config as immediate mitigation.',
      'Restrict SSH port 22 access exclusively to VPN subnets.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-007',
    title: 'DNS Amplification Attack Vector',
    subtitle: 'NET-AMP-092',
    riskLevel: 'Medium',
    score: 6.8,
    publishedAt: 'Oct 28, 2025 08:15 IST',
    status: 'Investigating',
    summary: 'Reflected ANY query UDP flood targeting recursive resolvers with 40x payload magnification factor observed during off-peak window.',
    assets: [
      { name: 'Primary DNS Resolver', version: 'v9.18', risk: 'high', type: 'server' },
    ],
    actions: [
      'Apply Response Rate Limiting (RRL) across BIND configuration.',
      'Drop spoofed recursive ANY requests on upstream border routers.',
      'Enable DNS over HTTPS (DoH) ingress enforcement.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-008',
    title: 'Cleartext HTTP Transmission',
    subtitle: 'SEC-POL-019',
    riskLevel: 'Low',
    score: 3.5,
    publishedAt: 'Oct 28, 2025 07:45 IST',
    status: 'Resolved',
    summary: 'Internal healthcheck endpoint emitting unencrypted telemetry headers over plain port 80 detected by perimeter compliance audit.',
    assets: [
      { name: 'API Microservice Mesh', version: 'v2.0', risk: 'low', type: 'app' },
    ],
    actions: [
      'Configure automatic 301 redirect to HTTPS on all edge ingress.',
      'Enable HSTS header with max-age=31536000 preload.',
      'Audit Kubernetes ingress ingress-nginx annotations.',
    ],
    iconType: 'info',
  },
  {
    id: 'THR-009',
    title: 'Windows Kerberos Privilege Escalation',
    subtitle: 'CVE-2024-38077',
    riskLevel: 'High',
    score: 9.4,
    publishedAt: 'Oct 27, 2025 22:10 IST',
    status: 'Active',
    summary: 'Unauthenticated attackers can forge PAC signatures in Active Directory domain environments to gain enterprise domain administrator rights.',
    assets: [
      { name: 'Domain Controller East', version: 'v2022', risk: 'critical', type: 'server' },
      { name: 'Domain Controller West', version: 'v2022', risk: 'critical', type: 'server' },
    ],
    actions: [
      'Install Microsoft security rollup KB5040442 immediately.',
      'Audit event logs for Event ID 4768 and 4769 anomalies.',
      'Enable RPC sealing enforcement on all DC communications.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-010',
    title: 'Container Escape via runc',
    subtitle: 'CVE-2024-21626',
    riskLevel: 'High',
    score: 8.9,
    publishedAt: 'Oct 27, 2025 19:40 IST',
    status: 'Active',
    summary: 'Leaked internal file descriptor in runc allows containerized workloads to break isolation and overwrite host filesystem binaries.',
    assets: [
      { name: 'Production Kubernetes Node Pool', version: 'v1.28', risk: 'critical', type: 'server' },
    ],
    actions: [
      'Upgrade containerd and runc runtime on worker pool AMIs.',
      'Enforce AppArmor and Seccomp runtime security profiles.',
      'Audit container workdir definitions in Helm charts.',
    ],
    iconType: 'warning',
  },

  // Page 3 (rows 11 to 15)
  {
    id: 'THR-011',
    title: 'SQL Injection in Billing Microservice',
    subtitle: 'APP-VULN-881',
    riskLevel: 'High',
    score: 8.5,
    publishedAt: 'Oct 27, 2025 17:25 IST',
    status: 'Active',
    summary: 'Blind SQL injection in invoice pagination query parameter allows extraction of encrypted customer payment records.',
    assets: [
      { name: 'Billing API Server', version: 'v3.1.2', risk: 'critical', type: 'app' },
      { name: 'PostgreSQL Relational DB', version: 'v15.3', risk: 'critical', type: 'database' },
    ],
    actions: [
      'Deploy hotfix converting dynamic string queries to parameterized statements.',
      'Activate Cloudflare WAF OWASP SQLi CRS ruleset in blocking mode.',
      'Audit database query logs for abnormal UNION SELECT execution.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-012',
    title: 'Cross-Site Scripting in Helpdesk',
    subtitle: 'CVE-2024-29188',
    riskLevel: 'Medium',
    score: 6.4,
    publishedAt: 'Oct 27, 2025 15:10 IST',
    status: 'Monitoring',
    summary: 'Stored XSS vulnerability in support ticket markdown renderer allows session hijacking of tier-1 support agents.',
    assets: [
      { name: 'Zendesk Proxy App', version: 'v1.4', risk: 'medium', type: 'app' },
    ],
    actions: [
      'Sanitize markdown output using DOMPurify with strict HTML tags.',
      'Set cookie flag SameSite=Strict and HttpOnly for session IDs.',
      'Implement strict Content-Security-Policy (CSP) headers.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-013',
    title: 'BGP Route Hijack Anomaly',
    subtitle: 'NET-BGP-401',
    riskLevel: 'Medium',
    score: 7.0,
    publishedAt: 'Oct 27, 2025 14:05 IST',
    status: 'Resolved',
    summary: 'Suspicious AS-PATH prepend broadcast by foreign autonomous system intercepted traffic intended for enterprise payment gateway prefixes.',
    assets: [
      { name: 'BGP Border Router Core 1', version: 'v4.28', risk: 'high', type: 'network' },
    ],
    actions: [
      'Validate RPKI ROA cryptographically with upstream Tier-1 ISPs.',
      'Enforce strict maximum prefix limits with peering transit providers.',
      'Alert network operations center of route propagation anomaly.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-014',
    title: 'Unrestricted File Upload in CMS',
    subtitle: 'CVE-2024-3400',
    riskLevel: 'Medium',
    score: 7.9,
    publishedAt: 'Oct 27, 2025 11:30 IST',
    status: 'Investigating',
    summary: 'Arbitrary file upload in media manager permits deployment of PHP webshells granting persistent root filesystem access.',
    assets: [
      { name: 'Marketing Portal CMS', version: 'v6.4', risk: 'high', type: 'app' },
    ],
    actions: [
      'Restrict media uploads strictly to validated image MIME types.',
      'Mount upload directory with noexec flag in Linux fstab.',
      'Scan storage buckets for hidden PHP and ELF binary signatures.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-015',
    title: 'Weak SSH Host Key Fingerprint',
    subtitle: 'SEC-SSH-003',
    riskLevel: 'Low',
    score: 3.8,
    publishedAt: 'Oct 27, 2025 09:15 IST',
    status: 'Resolved',
    summary: 'Internal staging server utilizing deprecated 1024-bit RSA host key susceptible to factorization and MitM spoofing.',
    assets: [
      { name: 'Staging Jumpbox', version: 'v20.04', risk: 'low', type: 'server' },
    ],
    actions: [
      'Regenerate host keys using Ed25519 and RSA 4096-bit standards.',
      'Distribute new known_hosts fingerprints via configuration management.',
      'Deprecate ssh-rsa algorithm in central SSH policy.',
    ],
    iconType: 'info',
  },

  // Page 4 (rows 16 to 20)
  {
    id: 'THR-016',
    title: 'CobaltStrike Beacon Egress Flow',
    subtitle: 'JA3:00c02b',
    riskLevel: 'Medium',
    score: 7.8,
    publishedAt: 'Oct 26, 2025 21:40 IST',
    status: 'Investigating',
    summary: 'Periodic TLS heartbeats matching known CobaltStrike malleable C2 profiles detected on outbound workstation subnet.',
    assets: [
      { name: 'SecOps Workstation WS-04', version: 'v11', risk: 'high', type: 'app' },
    ],
    actions: [
      'Sever network connection for affected endpoint via EDR agent.',
      'Extract memory image and process tree for forensic triage.',
      'Blackhole C2 destination IP on enterprise core firewall.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-017',
    title: 'Insecure Direct Object Reference (IDOR)',
    subtitle: 'API-IDOR-112',
    riskLevel: 'Medium',
    score: 6.9,
    publishedAt: 'Oct 26, 2025 18:20 IST',
    status: 'Active',
    summary: 'Document download endpoint allows authenticated clients to access arbitrary statement PDFs by manipulating sequential integer IDs.',
    assets: [
      { name: 'Customer Document Vault', version: 'v2.3', risk: 'high', type: 'app' },
    ],
    actions: [
      'Implement UUID v4 identifiers and enforce tenant ownership validation.',
      'Apply ABAC authorization interceptors across Spring API controllers.',
      'Perform retrospective log analysis for sequential ID scraping.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-018',
    title: 'Redis Instance Exposed Without Auth',
    subtitle: 'CONF-REDIS-01',
    riskLevel: 'Medium',
    score: 7.5,
    publishedAt: 'Oct 26, 2025 16:05 IST',
    status: 'Resolved',
    summary: 'In-memory caching Redis instance found binding to 0.0.0.0 without requirepass parameter configured.',
    assets: [
      { name: 'Redis Cache Cluster', version: 'v7.0', risk: 'medium', type: 'database' },
    ],
    actions: [
      'Rebind Redis listener to 127.0.0.1 and private VPC subnet.',
      'Generate cryptographically secure password with 32+ characters.',
      'Verify security group ingress rules in cloud console.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-019',
    title: 'Cross-Site Request Forgery (CSRF)',
    subtitle: 'CVE-2024-1189',
    riskLevel: 'Low',
    score: 4.8,
    publishedAt: 'Oct 26, 2025 14:10 IST',
    status: 'Monitoring',
    summary: 'Missing Anti-CSRF token verification on secondary email update endpoint allows cross-origin state alteration.',
    assets: [
      { name: 'User Profile Settings Webapp', version: 'v1.8', risk: 'low', type: 'app' },
    ],
    actions: [
      'Inject Synchronizer Token Pattern on all POST/PUT mutation forms.',
      'Enforce SameSite=Lax cookie attribute across authentication cookies.',
      'Verify Origin and Referer header validity in API gateway.',
    ],
    iconType: 'info',
  },
  {
    id: 'THR-020',
    title: 'Hardcoded API Secret in Git Commit',
    subtitle: 'SECRET-GIT-902',
    riskLevel: 'Low',
    score: 4.2,
    publishedAt: 'Oct 26, 2025 11:55 IST',
    status: 'Resolved',
    summary: 'Production SendGrid email API key accidentally committed to public branch of developer documentation repository.',
    assets: [
      { name: 'SendGrid Email Relay', version: 'Cloud API', risk: 'medium', type: 'app' },
    ],
    actions: [
      'Instantly revoke exposed SendGrid API key in vendor portal.',
      'Scrub commit history using git-filter-repo tool.',
      'Integrate TruffleHog / Gitleaks pre-commit hooks for all engineers.',
    ],
    iconType: 'warning',
  },

  // Page 5 (rows 21 to 25)
  {
    id: 'THR-021',
    title: 'Kubernetes API Server Unauthorized Access',
    subtitle: 'CVE-2024-10220',
    riskLevel: 'High',
    score: 9.3,
    publishedAt: 'Oct 25, 2025 20:30 IST',
    status: 'Active',
    summary: 'Improper authorization check in aggregated API server lets anonymous requests query sensitive cluster configmaps and secrets.',
    assets: [
      { name: 'K8s Control Plane Master 1', version: 'v1.27', risk: 'critical', type: 'server' },
    ],
    actions: [
      'Upgrade Kubernetes control plane to patched minor release v1.27.12.',
      'Disable --anonymous-auth flag on kube-apiserver manifest.',
      'Audit RBAC bindings for system:anonymous and system:unauthenticated.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-022',
    title: 'Expired SSL Certificate Warning',
    subtitle: 'CERT-EXP-440',
    riskLevel: 'Low',
    score: 3.2,
    publishedAt: 'Oct 25, 2025 17:15 IST',
    status: 'Monitoring',
    summary: 'Wildcard SSL certificate for dev.chitti.sec domain reached expiration date causing browser trust warnings.',
    assets: [
      { name: 'Development Gateway', version: 'Cloudflare SSL', risk: 'low', type: 'network' },
    ],
    actions: [
      'Renew and bind Let\'s Encrypt certificate via Certbot automation.',
      'Configure auto-renewal cronjob with 30-day notice threshold.',
      'Verify OCSP stapling response across monitoring probes.',
    ],
    iconType: 'info',
  },
  {
    id: 'THR-023',
    title: 'SSRF in Webhook Dispatcher',
    subtitle: 'CVE-2024-22024',
    riskLevel: 'Medium',
    score: 7.7,
    publishedAt: 'Oct 25, 2025 15:40 IST',
    status: 'Investigating',
    summary: 'Server-Side Request Forgery vulnerability permits attackers to probe cloud instance metadata service at 169.254.169.254 via custom webhook URLs.',
    assets: [
      { name: 'Webhook Event Dispatcher', version: 'v2.1', risk: 'high', type: 'app' },
    ],
    actions: [
      'Block outbound HTTP requests targeting 169.254.0.0/16 and RFC1918 subnets.',
      'Enforce IMDSv2 with mandatory token hops on AWS EC2 instances.',
      'Run webhook dispatcher inside sandboxed network namespace.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-024',
    title: 'Directory Traversal via File Browser',
    subtitle: 'CVE-2024-1082',
    riskLevel: 'Medium',
    score: 6.7,
    publishedAt: 'Oct 25, 2025 13:20 IST',
    status: 'Monitoring',
    summary: 'Inadequate sanitization of dot-dot-slash sequence in asset download route enables retrieval of /etc/shadow and environment variables.',
    assets: [
      { name: 'Static File Asset Service', version: 'v1.4', risk: 'medium', type: 'server' },
    ],
    actions: [
      'Canonicalize input paths using realpath before serving files.',
      'Restrict filesystem root to chroot jail directory.',
      'Add WAF rule matching ../ sequences.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-025',
    title: 'Samba Cryptex Remote Code Execution',
    subtitle: 'CVE-2024-4411',
    riskLevel: 'Medium',
    score: 7.6,
    publishedAt: 'Oct 25, 2025 10:05 IST',
    status: 'Investigating',
    summary: 'Heap buffer overflow in Samba SMB2 network protocol handler enables arbitrary code execution without authentication.',
    assets: [
      { name: 'Corporate File Storage NAS', version: 'v4.16', risk: 'high', type: 'server' },
    ],
    actions: [
      'Upgrade Samba packages to 4.20.2 or latest vendor backport.',
      'Disable SMBv1 and enforce SMB signing on all file shares.',
      'Block ports 139 and 445 on perimeter firewalls.',
    ],
    iconType: 'warning',
  },

  // Page 6 (rows 26 to 30)
  {
    id: 'THR-026',
    title: 'Default Credentials on IPMI Interface',
    subtitle: 'HARD-IPMI-08',
    riskLevel: 'Medium',
    score: 7.4,
    publishedAt: 'Oct 24, 2025 21:15 IST',
    status: 'Active',
    summary: 'Out-of-band server BMC/IPMI controller detected running with factory-default administrative credentials on dedicated management VLAN.',
    assets: [
      { name: 'Baremetal Rack Server 12', version: 'Supermicro IPMI', risk: 'high', type: 'server' },
    ],
    actions: [
      'Change default IPMI password and enable strong password complexity.',
      'Disable Cypher 0 and vulnerable cipher suites on IPMI daemon.',
      'Isolate management network into restricted out-of-band VLAN.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-027',
    title: 'Missing Rate Limiting on Password Reset',
    subtitle: 'APP-AUTH-71',
    riskLevel: 'Low',
    score: 4.5,
    publishedAt: 'Oct 24, 2025 18:30 IST',
    status: 'Monitoring',
    summary: 'Password reset trigger API lacks IP-based velocity limiting, enabling mail server spamming and denial-of-service against third-party SMTP provider.',
    assets: [
      { name: 'Customer Auth API', version: 'v3.0', risk: 'low', type: 'app' },
    ],
    actions: [
      'Implement Redis token bucket rate limiting (max 3 requests per 10 mins).',
      'Require Cloudflare Turnstile CAPTCHA on consecutive reset requests.',
      'Send generic success responses to prevent user enumeration.',
    ],
    iconType: 'info',
  },
  {
    id: 'THR-028',
    title: 'Zero-Day Heuristic in Edge Router',
    subtitle: 'HEUR-ZERO-01',
    riskLevel: 'Medium',
    score: 7.5,
    publishedAt: 'Oct 24, 2025 15:45 IST',
    status: 'Active',
    summary: 'Unusual memory corruption and anomalous packet sequence targeting Cisco IOS-XE web UI matches state-sponsored zero-day exploit telemetry.',
    assets: [
      { name: 'Border Router Catalyst Core', version: 'v17.9', risk: 'critical', type: 'network' },
    ],
    actions: [
      'Disable HTTP/HTTPS server feature on edge routers immediately.',
      'Inspect web server logs for unauthorized cisco.sh script generation.',
      'Apply vendor emergency hotfix and reboot device.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-029',
    title: 'Unpatched Ghostscript PDF Parser',
    subtitle: 'CVE-2024-29510',
    riskLevel: 'Medium',
    score: 7.3,
    publishedAt: 'Oct 24, 2025 12:10 IST',
    status: 'Active',
    summary: 'Format string injection in Ghostscript allows sandbox escape and command execution during thumbnail preview rendering.',
    assets: [
      { name: 'Document Processing Worker', version: 'v10.02', risk: 'medium', type: 'app' },
    ],
    actions: [
      'Update Ghostscript to version 10.03.1.',
      'Disable PostScript file parsing in ImageMagick policy.xml.',
      'Run document conversions inside isolated gVisor container sandbox.',
    ],
    iconType: 'warning',
  },
  {
    id: 'THR-030',
    title: 'Information Disclosure via Robots.txt',
    subtitle: 'INFO-ROBOT-01',
    riskLevel: 'Low',
    score: 2.9,
    publishedAt: 'Oct 24, 2025 09:20 IST',
    status: 'Monitoring',
    summary: 'Robots.txt file reveals paths to unindexed internal administrative portals and hidden backup archives.',
    assets: [
      { name: 'Marketing Website', version: 'v2.1', risk: 'low', type: 'app' },
    ],
    actions: [
      'Remove sensitive URI paths from publicly accessible robots.txt file.',
      'Rely on authentication and authorization headers rather than obscurity.',
      'Confirm search engine spider de-indexing in Google Search Console.',
    ],
    iconType: 'info',
  },
];

export const riskTrendData: Record<string, { day: string; score: number }[]> = {
  'Last 7 Days': [
    { day: 'Mon', score: 14 },
    { day: 'Tue', score: 13 },
    { day: 'Wed', score: 22 },
    { day: 'Thu', score: 17 },
    { day: 'Fri', score: 15 },
    { day: 'Sat', score: 19 },
    { day: 'Sun', score: 26 },
  ],
  'Last 24 Hours': [
    { day: '00h', score: 12 },
    { day: '04h', score: 9 },
    { day: '08h', score: 18 },
    { day: '12h', score: 24 },
    { day: '16h', score: 21 },
    { day: '20h', score: 23 },
    { day: '24h', score: 26 },
  ],
  'Last 30 Days': [
    { day: 'W1', score: 16 },
    { day: 'W2', score: 22 },
    { day: 'W3', score: 18 },
    { day: 'W4', score: 26 },
  ],
};
