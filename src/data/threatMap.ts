export type SeverityLevel = 'high' | 'medium' | 'low';

export interface ThreatTypeBreakdown {
  name: string;
  count: number;
  percentage: number;
}

export interface ThreatMarkerItem {
  id: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  severity: SeverityLevel;
  count: number;
  topTypes: ThreatTypeBreakdown[];
  lastSeen: string;
  series: number[]; // 12 points for sparkline
  status: string;
  mitigation: string;
}

export interface AttackArc {
  id: string;
  from: [number, number]; // [lng, lat]
  to: [number, number];   // [lng, lat]
  sourceName: string;
  targetName: string;
  threatType: string;
}

export type TimeRangeOption = 'Last 1 Hour' | 'Last 24 Hours' | 'Last 7 Days' | 'Last 30 Days';

export const ATTACK_ARCS: AttackArc[] = [
  {
    id: 'arc-1',
    from: [-122.33, 47.6],  // Western USA (Seattle)
    to: [0.5, 49.5],        // Western Europe
    sourceName: 'Seattle Gateway',
    targetName: 'London Datacenter',
    threatType: 'CobaltStrike C2 Egress',
  },
  {
    id: 'arc-2',
    from: [89.5, 26.2],     // India/NE Border
    to: [-122.33, 47.6],    // Western USA
    sourceName: 'Assam Gateway',
    targetName: 'Pacific NW Cloud',
    threatType: 'DDoS Amplification',
  },
  {
    id: 'arc-3',
    from: [30.3, 59.95],    // St. Petersburg
    to: [0.5, 49.5],        // Western Europe
    sourceName: 'Nordic Proxy',
    targetName: 'Frankfurt Core',
    threatType: 'Ransomware Loader',
  },
  {
    id: 'arc-4',
    from: [121.47, 31.23],  // Eastern China
    to: [151.2, -33.86],    // Sydney
    sourceName: 'East Coast Node',
    targetName: 'Sydney Edge Router',
    threatType: 'Credential Harvesting',
  },
];

// Base markers matching screenshot layout
const BASE_MARKERS_24H: ThreatMarkerItem[] = [
  // High Severity (Red)
  {
    id: 'high-us-west',
    region: 'Western USA (Seattle/Pacific NW)',
    country: 'United States',
    lat: 47.6,
    lng: -122.33,
    severity: 'high',
    count: 3842,
    topTypes: [
      { name: 'Remote Code Execution (CVE-2024-38077)', count: 1820, percentage: 47 },
      { name: 'Cloud Storage API Poisoning', count: 1240, percentage: 32 },
      { name: 'Kerberoasting Brute-Force', count: 782, percentage: 21 },
    ],
    lastSeen: '1 min ago',
    series: [180, 210, 240, 290, 310, 275, 340, 390, 420, 380, 410, 440],
    status: 'Critical Active Outbreak',
    mitigation: 'Automated rate-limiting and IP CIDR isolation deployed on ingress gateways.',
  },
  {
    id: 'high-in-border',
    region: 'India / Northeast Border Corridor',
    country: 'India',
    lat: 26.2,
    lng: 89.5,
    severity: 'high',
    count: 4912,
    topTypes: [
      { name: 'DDoS SYN Flood Amplification', count: 2450, percentage: 50 },
      { name: 'BGP Route Hijacking Probe', count: 1510, percentage: 31 },
      { name: 'SCADA Protocol Infiltration', count: 952, percentage: 19 },
    ],
    lastSeen: 'Just now',
    series: [250, 290, 320, 380, 410, 460, 430, 490, 520, 580, 610, 640],
    status: 'High Density Influx',
    mitigation: 'Edge scrubbers absorbing 42 Gbps; stateful filter inspection enabled.',
  },
  {
    id: 'high-in-south',
    region: 'Southern India (Bengaluru/Chennai)',
    country: 'India',
    lat: 13.0,
    lng: 78.5,
    severity: 'high',
    count: 3218,
    topTypes: [
      { name: 'Financial API Credential Stuffing', count: 1620, percentage: 50 },
      { name: 'SQL Injection on Banking Gateway', count: 1040, percentage: 32 },
      { name: 'Malicious JWT Token Forgery', count: 558, percentage: 18 },
    ],
    lastSeen: '3 min ago',
    series: [140, 165, 190, 230, 210, 260, 280, 320, 340, 310, 350, 370],
    status: 'Elevated Threat Wave',
    mitigation: 'Biometric challenge enforcement and anomalous ASN blocking active.',
  },

  // Medium Severity (Amber)
  {
    id: 'med-eu-west',
    region: 'Western Europe (UK / France)',
    country: 'United Kingdom',
    lat: 49.5,
    lng: 0.5,
    severity: 'medium',
    count: 1740,
    topTypes: [
      { name: 'CobaltStrike C2 Beaconing', count: 820, percentage: 47 },
      { name: 'Zero-Day ZeroLogon Probe', count: 540, percentage: 31 },
      { name: 'DNS Tunneling Exfiltration', count: 380, percentage: 22 },
    ],
    lastSeen: '5 min ago',
    series: [90, 110, 130, 125, 145, 160, 150, 175, 190, 185, 200, 215],
    status: 'Under Investigation',
    mitigation: 'DNS sinkholing and heuristic protocol inspection active.',
  },
  {
    id: 'med-eu-north',
    region: 'Northern Europe (Baltic / St. Petersburg)',
    country: 'Russia',
    lat: 59.95,
    lng: 30.3,
    severity: 'medium',
    count: 1420,
    topTypes: [
      { name: 'Ransomware Loader Ingestion', count: 680, percentage: 48 },
      { name: 'Phishing Reverse Proxy Relay', count: 450, percentage: 32 },
      { name: 'SSH Cryptominer Propagation', count: 290, percentage: 20 },
    ],
    lastSeen: '8 min ago',
    series: [80, 95, 110, 105, 120, 135, 140, 130, 150, 160, 155, 170],
    status: 'Monitored Suspicious Activity',
    mitigation: 'Firewall dropping untrusted ingress packets across port 445/3389.',
  },
  {
    id: 'med-cn-east',
    region: 'Eastern China Coast (Shanghai)',
    country: 'China',
    lat: 31.23,
    lng: 121.47,
    severity: 'medium',
    count: 2110,
    topTypes: [
      { name: 'Credential Stuffing Clusters', count: 1050, percentage: 50 },
      { name: 'Supply Chain Package Tampering', count: 680, percentage: 32 },
      { name: 'Webshell Exploit Traversal', count: 380, percentage: 18 },
    ],
    lastSeen: '4 min ago',
    series: [120, 140, 160, 150, 180, 195, 210, 205, 230, 245, 250, 265],
    status: 'Cluster Detected',
    mitigation: 'WAF rules updated to block automated headless browser signatures.',
  },
  {
    id: 'med-br-interior',
    region: 'Brazil Interior (Center-West)',
    country: 'Brazil',
    lat: -15.0,
    lng: -52.0,
    severity: 'medium',
    count: 1190,
    topTypes: [
      { name: 'Mobile Banking Trojan Feeds', count: 610, percentage: 51 },
      { name: 'VoIP PBX Toll Fraud Relay', count: 380, percentage: 32 },
      { name: 'Spear Phishing Botnet Hub', count: 200, percentage: 17 },
    ],
    lastSeen: '11 min ago',
    series: [70, 85, 95, 110, 105, 125, 130, 145, 140, 155, 160, 175],
    status: 'Sustained Probe Pattern',
    mitigation: 'Telecom fraud detection filter activated on core gateways.',
  },
  {
    id: 'med-au-east',
    region: 'Eastern Australia (Sydney / NSW)',
    country: 'Australia',
    lat: -33.86,
    lng: 151.2,
    severity: 'medium',
    count: 980,
    topTypes: [
      { name: 'IoT Botnet Mirai Scanning', count: 480, percentage: 49 },
      { name: 'Exchange Server Auth Bypass', count: 320, percentage: 33 },
      { name: 'Cloud Tenant Enumeration', count: 180, percentage: 18 },
    ],
    lastSeen: '14 min ago',
    series: [55, 65, 75, 80, 90, 85, 100, 105, 115, 120, 125, 135],
    status: 'Active Scanning',
    mitigation: 'Honeypot telemetry capturing signature patterns for CERT distribution.',
  },

  // Low Severity (Green)
  {
    id: 'low-mx',
    region: 'Central Mexico (Bajío Corridor)',
    country: 'Mexico',
    lat: 21.2,
    lng: -101.5,
    severity: 'low',
    count: 420,
    topTypes: [
      { name: 'Automated Port Discovery', count: 230, percentage: 55 },
      { name: 'Wordpress XML-RPC Pingback', count: 120, percentage: 29 },
      { name: 'Expired SSL Negotiation', count: 70, percentage: 16 },
    ],
    lastSeen: '22 min ago',
    series: [25, 30, 35, 40, 38, 45, 42, 50, 48, 52, 55, 58],
    status: 'Low Priority Background Noise',
    mitigation: 'Standard IPS drop rule applied without host alerting.',
  },
  {
    id: 'low-ng-west',
    region: 'West Africa (Lagos / Abuja)',
    country: 'Nigeria',
    lat: 9.08,
    lng: 7.5,
    severity: 'low',
    count: 530,
    topTypes: [
      { name: 'Business Email Compromise Lures', count: 310, percentage: 58 },
      { name: 'SMTP Open Relay Exploitation', count: 140, percentage: 26 },
      { name: 'Generic CMS Scanner', count: 80, percentage: 16 },
    ],
    lastSeen: '19 min ago',
    series: [30, 38, 42, 45, 50, 48, 55, 58, 62, 60, 65, 70],
    status: 'Routine Telemetry',
    mitigation: 'DKIM and SPF strict quarantine handling active.',
  },
  {
    id: 'low-za-south',
    region: 'South Africa (Gauteng / Western Cape)',
    country: 'South Africa',
    lat: -30.55,
    lng: 25.0,
    severity: 'low',
    count: 360,
    topTypes: [
      { name: 'Cryptomining Mining Pool Egress', count: 190, percentage: 53 },
      { name: 'Telnet Default Credential Sweep', count: 110, percentage: 31 },
      { name: 'DNS Amplification Echo', count: 60, percentage: 16 },
    ],
    lastSeen: '28 min ago',
    series: [20, 24, 28, 30, 32, 35, 38, 40, 42, 45, 44, 48],
    status: 'Baseline Monitored',
    mitigation: 'Outbound Stratum protocol ports blocked at boundary firewall.',
  },
  {
    id: 'low-br-south',
    region: 'Southern Brazil Coast (Florianópolis)',
    country: 'Brazil',
    lat: -26.0,
    lng: -48.5,
    severity: 'low',
    count: 290,
    topTypes: [
      { name: 'Phishing Landing Pages Hosting', count: 160, percentage: 55 },
      { name: 'MikroTik RouterOS Scanner', count: 85, percentage: 29 },
      { name: 'NTP Monlist Amplification', count: 45, percentage: 16 },
    ],
    lastSeen: '31 min ago',
    series: [15, 18, 22, 25, 24, 28, 30, 32, 34, 35, 36, 40],
    status: 'Under Observation',
    mitigation: 'ISP domain takedown notice automatically dispatched.',
  },
  {
    id: 'low-cn-south',
    region: 'Southern China (Guangzhou / Pearl River)',
    country: 'China',
    lat: 23.13,
    lng: 113.26,
    severity: 'low',
    count: 640,
    topTypes: [
      { name: 'Industrial IoT Modbus Probes', count: 340, percentage: 53 },
      { name: 'UPnP Exposure Exploitation', count: 200, percentage: 31 },
      { name: 'Redis Unauthorized Access Test', count: 100, percentage: 16 },
    ],
    lastSeen: '16 min ago',
    series: [35, 42, 48, 52, 56, 60, 65, 68, 72, 75, 78, 82],
    status: 'Stable Feed',
    mitigation: 'Industrial protocol anomaly filter keeping baseline integrity.',
  },
];

// Helper to scale counts for different time ranges
export function getThreatMarkersForRange(range: TimeRangeOption): ThreatMarkerItem[] {
  let scale = 1;
  switch (range) {
    case 'Last 1 Hour':
      scale = 0.08;
      break;
    case 'Last 24 Hours':
      scale = 1;
      break;
    case 'Last 7 Days':
      scale = 6.4;
      break;
    case 'Last 30 Days':
      scale = 24.5;
      break;
  }

  return BASE_MARKERS_24H.map((marker) => {
    const scaledCount = Math.round(marker.count * scale);
    const scaledSeries = marker.series.map((val) => Math.round(val * scale));
    const scaledTopTypes = marker.topTypes.map((type) => ({
      ...type,
      count: Math.round(type.count * scale),
    }));

    let lastSeenStr = marker.lastSeen;
    if (range === 'Last 1 Hour') {
      lastSeenStr = `${Math.floor(Math.random() * 45 + 5)} sec ago`;
    } else if (range === 'Last 7 Days') {
      lastSeenStr = `${Math.floor(Math.random() * 6 + 1)} hr ago`;
    } else if (range === 'Last 30 Days') {
      lastSeenStr = `${Math.floor(Math.random() * 12 + 1)} d ago`;
    }

    return {
      ...marker,
      count: scaledCount,
      series: scaledSeries,
      topTypes: scaledTopTypes,
      lastSeen: lastSeenStr,
    };
  });
}

// Live simulated new threats pool for ambient live updates
export const LIVE_UPDATE_SIMULATION_POOL = [
  { region: 'Western USA (Seattle)', severity: 'high', type: 'Zero-Day Infiltration Attempt' },
  { region: 'India / Northeast Border', severity: 'high', type: 'Layer 7 HTTP Flood Surge' },
  { region: 'Southern India (Bengaluru)', severity: 'high', type: 'OAuth API Key Extraction' },
  { region: 'Western Europe (UK/France)', severity: 'medium', type: 'DNS Resolver Spoofing' },
  { region: 'Northern Europe (St. Petersburg)', severity: 'medium', type: 'Brute-Force SSH Influx' },
  { region: 'Eastern China (Shanghai)', severity: 'medium', type: 'Malicious NPM Package Push' },
  { region: 'Brazil Interior', severity: 'medium', type: 'Banking Trojan Payload' },
  { region: 'Eastern Australia (Sydney)', severity: 'medium', type: 'Border Router Probing' },
  { region: 'Central Mexico', severity: 'low', type: 'Automated Port Sweep' },
  { region: 'West Africa (Nigeria)', severity: 'low', type: 'Phishing Lure Dispatched' },
];
