import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Users, 
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  "data-testid"?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel = "vs last period",
  icon,
  isLoading,
  "data-testid": testId
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={cn(
            "text-xs flex items-center gap-1 mt-1",
            isPositive && "text-emerald-600",
            isNegative && "text-red-600",
            !isPositive && !isNegative && "text-muted-foreground"
          )}>
            {isPositive && <ArrowUpRight className="w-3 h-3" />}
            {isNegative && <ArrowDownRight className="w-3 h-3" />}
            {isPositive && "+"}
            {change}% {changeLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Deal Volume Chart
interface DealVolumeData {
  month: string;
  deals: number;
  volume: number;
}

interface DealVolumeChartProps {
  data: DealVolumeData[];
  isLoading?: boolean;
  "data-testid"?: string;
}

const dealVolumeConfig: ChartConfig = {
  deals: { label: "Deals", color: "hsl(var(--primary))" },
  volume: { label: "Volume ($K)", color: "hsl(var(--chart-2))" },
};

export function DealVolumeChart({ data, isLoading, "data-testid": testId }: DealVolumeChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card data-testid={testId}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Deal Volume Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={dealVolumeConfig} className="h-[300px]">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area 
              type="monotone" 
              dataKey="deals" 
              stroke="hsl(var(--primary))" 
              fill="url(#colorDeals)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Role Distribution Chart
interface RoleDistributionData {
  role: string;
  count: number;
  color: string;
}

interface RoleDistributionChartProps {
  data: RoleDistributionData[];
  isLoading?: boolean;
  "data-testid"?: string;
}

export function RoleDistributionChart({ data, isLoading, "data-testid": testId }: RoleDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const chartConfig: ChartConfig = data.reduce((acc, item) => ({
    ...acc,
    [item.role]: { label: item.role, color: item.color }
  }), {});
  
  return (
    <Card data-testid={testId}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          User Distribution by Role
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey="count"
              nameKey="role"
              label={({ role, percent }) => `${role}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Funding Progress Chart
interface FundingProgressData {
  project: string;
  raised: number;
  goal: number;
}

interface FundingProgressChartProps {
  data: FundingProgressData[];
  isLoading?: boolean;
  "data-testid"?: string;
}

export function FundingProgressChart({ data, isLoading, "data-testid": testId }: FundingProgressChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const chartConfig: ChartConfig = {
    raised: { label: "Raised", color: "hsl(var(--chart-1))" },
    remaining: { label: "Remaining", color: "hsl(var(--muted))" },
  };
  
  const chartData = data.map(item => ({
    project: item.project.length > 20 ? item.project.substring(0, 20) + '...' : item.project,
    raised: item.raised,
    remaining: Math.max(0, item.goal - item.raised),
    progress: Math.round((item.raised / item.goal) * 100)
  }));
  
  return (
    <Card data-testid={testId}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Capital Project Funding
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            <YAxis dataKey="project" type="category" className="text-xs" width={100} />
            <ChartTooltip 
              content={<ChartTooltipContent />} 
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Bar dataKey="raised" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="remaining" stackId="a" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Deal Status Distribution
interface DealStatusData {
  status: string;
  count: number;
  color: string;
}

interface DealStatusChartProps {
  data: DealStatusData[];
  isLoading?: boolean;
  "data-testid"?: string;
}

export function DealStatusChart({ data, isLoading, "data-testid": testId }: DealStatusChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const chartConfig: ChartConfig = {
    count: { label: "Deals" },
  };
  
  return (
    <Card data-testid={testId}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Deals by Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="status" className="text-xs" />
            <YAxis className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Combined Analytics Dashboard for Admin
interface AnalyticsDashboardProps {
  stats?: {
    totalDeals: number;
    totalVolume: number;
    activeProjects: number;
    totalUsers: number;
    dealsChange?: number;
    volumeChange?: number;
    projectsChange?: number;
    usersChange?: number;
  };
  dealVolumeData?: DealVolumeData[];
  roleDistribution?: RoleDistributionData[];
  fundingProgress?: FundingProgressData[];
  dealStatus?: DealStatusData[];
  isLoading?: boolean;
  "data-testid"?: string;
}

export function AnalyticsDashboard({
  stats,
  dealVolumeData,
  roleDistribution,
  fundingProgress,
  dealStatus,
  isLoading,
  "data-testid": testId
}: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6" data-testid={testId}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Deals"
          value={stats?.totalDeals ?? 0}
          change={stats?.dealsChange}
          icon={<Home className="w-4 h-4 text-primary" />}
          isLoading={isLoading}
          data-testid="stat-total-deals"
        />
        <StatCard
          title="Total Volume"
          value={stats ? `$${(stats.totalVolume / 1000000).toFixed(1)}M` : '$0'}
          change={stats?.volumeChange}
          icon={<DollarSign className="w-4 h-4 text-primary" />}
          isLoading={isLoading}
          data-testid="stat-total-volume"
        />
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects ?? 0}
          change={stats?.projectsChange}
          icon={<FileText className="w-4 h-4 text-primary" />}
          isLoading={isLoading}
          data-testid="stat-active-projects"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          change={stats?.usersChange}
          icon={<Users className="w-4 h-4 text-primary" />}
          isLoading={isLoading}
          data-testid="stat-total-users"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dealVolumeData && (
          <DealVolumeChart 
            data={dealVolumeData} 
            isLoading={isLoading}
            data-testid="chart-deal-volume" 
          />
        )}
        {roleDistribution && (
          <RoleDistributionChart 
            data={roleDistribution} 
            isLoading={isLoading}
            data-testid="chart-role-distribution" 
          />
        )}
        {fundingProgress && (
          <FundingProgressChart 
            data={fundingProgress} 
            isLoading={isLoading}
            data-testid="chart-funding-progress" 
          />
        )}
        {dealStatus && (
          <DealStatusChart 
            data={dealStatus} 
            isLoading={isLoading}
            data-testid="chart-deal-status" 
          />
        )}
      </div>
    </div>
  );
}

// Sample data for demonstration
export const sampleAnalyticsData = {
  stats: {
    totalDeals: 156,
    totalVolume: 24500000,
    activeProjects: 12,
    totalUsers: 847,
    dealsChange: 12,
    volumeChange: 8,
    projectsChange: -5,
    usersChange: 23,
  },
  dealVolumeData: [
    { month: 'Jan', deals: 12, volume: 1800 },
    { month: 'Feb', deals: 15, volume: 2200 },
    { month: 'Mar', deals: 18, volume: 2800 },
    { month: 'Apr', deals: 14, volume: 2100 },
    { month: 'May', deals: 22, volume: 3400 },
    { month: 'Jun', deals: 25, volume: 3800 },
    { month: 'Jul', deals: 28, volume: 4200 },
    { month: 'Aug', deals: 24, volume: 3600 },
  ],
  roleDistribution: [
    { role: 'Investors', count: 420, color: '#c9a55c' },
    { role: 'Wholesalers', count: 180, color: '#2563eb' },
    { role: 'Dreamscapers', count: 95, color: '#16a34a' },
    { role: 'Buyers', count: 152, color: '#dc2626' },
  ],
  fundingProgress: [
    { project: 'Scottsdale Luxury Flip', raised: 112000, goal: 150000 },
    { project: 'Mesa Duplex Conversion', raised: 85000, goal: 85000 },
    { project: 'Gilbert Rental Portfolio', raised: 140000, goal: 280000 },
    { project: 'Tempe Townhome Dev', raised: 125000, goal: 450000 },
  ],
  dealStatus: [
    { status: 'Under Review', count: 24, color: '#f59e0b' },
    { status: 'Listed', count: 45, color: '#3b82f6' },
    { status: 'Under Contract', count: 18, color: '#8b5cf6' },
    { status: 'Sold', count: 67, color: '#10b981' },
    { status: 'Withdrawn', count: 2, color: '#ef4444' },
  ],
};

export default AnalyticsDashboard;
