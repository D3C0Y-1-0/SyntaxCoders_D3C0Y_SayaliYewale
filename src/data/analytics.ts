export interface KPIItem {
  id: string;
  title: string;
  value: string;
  numericVal: number;
  suffix?: string;
  trend: string;
  trendDirection: 'up' | 'down';
  trendPositive: boolean;
  color: string;
  sparkline: string;
  iconName: 'bar-chart' | 'shield-check' | 'clock' | 'trending-up';
}

export const initialKPIs: KPIItem[] = [
  {
    id: 'kpi-health',
    title: 'System Health',
    value: '97.3%',
    numericVal: 97.3,
    suffix: '%',
    trend: '+1.2%',
    trendDirection: 'up',
    trendPositive: true,
    color: '#C6F432',
    sparkline: 'M 2 28 Q 18 10, 36 22 T 78 8',
    iconName: 'bar-chart',
  },
  {
    id: 'kpi-threats',
    title: 'Total Threats',
    value: '24',
    numericVal: 24,
    trend: '+12%',
    trendDirection: 'up',
    trendPositive: false,
    color: '#FF4D4D',
    sparkline: 'M 2 26 Q 22 34, 42 16 T 78 12',
    iconName: 'shield-check',
  },
  {
    id: 'kpi-response',
    title: 'Avg Response Time',
    value: '2.8 hrs',
    numericVal: 2.8,
    suffix: ' hrs',
    trend: '-18%',
    trendDirection: 'down',
    trendPositive: true, // down is positive for response time
    color: '#FFB020',
    sparkline: 'M 2 24 Q 24 12, 44 26 T 78 14',
    iconName: 'clock',
  },
  {
    id: 'kpi-detection',
    title: 'Detection Rate',
    value: '96%',
    numericVal: 96,
    suffix: '%',
    trend: '+2%',
    trendDirection: 'up',
    trendPositive: true,
    color: '#7CE04B',
    sparkline: 'M 2 30 Q 20 22, 40 18 T 78 10',
    iconName: 'trending-up',
  },
];

export interface ThreatTrendPoint {
  day: string;
  total: number;
  critical: number;
}

export const threatTrendsDataset: Record<string, ThreatTrendPoint[]> = {
  'Last 7 Days': [
    { day: 'Mon', total: 17, critical: 10 },
    { day: 'Tue', total: 20, critical: 13 },
    { day: 'Wed', total: 29, critical: 18 },
    { day: 'Thu', total: 25, critical: 14 },
    { day: 'Fri', total: 21, critical: 12 },
    { day: 'Sat', total: 29, critical: 18 },
    { day: 'Sun', total: 38, critical: 23 },
  ],
  'Last 24 Hours': [
    { day: '00:00', total: 12, critical: 7 },
    { day: '04:00', total: 14, critical: 8 },
    { day: '08:00', total: 22, critical: 13 },
    { day: '12:00', total: 34, critical: 20 },
    { day: '16:00', total: 28, critical: 17 },
    { day: '20:00', total: 31, critical: 19 },
    { day: '24:00', total: 24, critical: 15 },
  ],
  'Last 30 Days': [
    { day: 'Week 1', total: 140, critical: 84 },
    { day: 'Week 2', total: 168, critical: 98 },
    { day: 'Week 3', total: 152, critical: 92 },
    { day: 'Week 4', total: 189, critical: 114 },
  ],
};

export interface DistributionSegment {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export const threatDistributionData: DistributionSegment[] = [
  { name: 'Critical', percentage: 37.5, count: 9, color: '#FF4D4D' },
  { name: 'High', percentage: 29.2, count: 7, color: '#FFB020' },
  { name: 'Medium', percentage: 20.8, count: 5, color: '#4F8CFF' },
  { name: 'Low', percentage: 12.5, count: 3, color: '#7CE04B' },
];

export interface ThreatCategory {
  name: string;
  percentage: number;
  count: number;
  gradient: string;
}

export const topThreatCategoriesData: ThreatCategory[] = [
  {
    name: 'Malware',
    percentage: 38,
    count: 9,
    gradient: 'from-[#7CE04B] to-[#C6F432]',
  },
  {
    name: 'Phishing',
    percentage: 32,
    count: 8,
    gradient: 'from-[#38BDF8] to-[#4F8CFF]',
  },
  {
    name: 'Suspicious Login',
    percentage: 20,
    count: 5,
    gradient: 'from-[#FDE68A] to-[#F59E0B]',
  },
  {
    name: 'Others',
    percentage: 10,
    count: 2,
    gradient: 'from-[#C084FC] to-[#8B5CF6]',
  },
];

export interface ActivityBarPoint {
  day: string;
  activity: number;
}

export const activityOverviewDataset: Record<string, ActivityBarPoint[]> = {
  'Last 7 Days': [
    { day: 'Mon', activity: 17 },
    { day: 'Tue', activity: 16 },
    { day: 'Wed', activity: 22 },
    { day: 'Thu', activity: 18 },
    { day: 'Fri', activity: 21 },
    { day: 'Sat', activity: 20 },
    { day: 'Sun', activity: 28 },
  ],
  'Last 24 Hours': [
    { day: '00h', activity: 10 },
    { day: '04h', activity: 8 },
    { day: '08h', activity: 19 },
    { day: '12h', activity: 26 },
    { day: '16h', activity: 23 },
    { day: '20h', activity: 21 },
    { day: '24h', activity: 24 },
  ],
  'Last 30 Days': [
    { day: 'W1', activity: 18 },
    { day: 'W2', activity: 24 },
    { day: 'W3', activity: 19 },
    { day: 'W4', activity: 28 },
  ],
};
