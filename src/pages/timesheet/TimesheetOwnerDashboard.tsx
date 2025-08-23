import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, Clock, TrendingUp, Building, Home, BarChart3 } from "lucide-react";
import { 
  loadTimeEntries, 
  getUsers,
  getTimesheetProjects,
  formatDuration,
  type TimeEntry,
  type TimesheetUser 
} from "@/lib/timesheet";

const TimesheetOwnerDashboard = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [users, setUsers] = useState<TimesheetUser[]>([]);
  const [projects, setProjects] = useState([]);
  const [period, setPeriod] = useState('monthly');
  
  useEffect(() => {
    setEntries(loadTimeEntries());
    setUsers(getUsers());
    setProjects(getTimesheetProjects());
  }, []);
  
  // Get date range for current period
  const today = new Date();
  const getDateRange = () => {
    const start = new Date(today);
    const end = new Date(today);
    
    switch (period) {
      case 'weekly':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'monthly':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      case 'quarterly':
        const quarter = Math.floor(start.getMonth() / 3);
        start.setMonth(quarter * 3);
        start.setDate(1);
        end.setMonth(quarter * 3 + 3);
        end.setDate(0);
        break;
    }
    
    return { start, end };
  };
  
  const { start, end } = getDateRange();
  const periodEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= start && entryDate <= end;
  });
  
  // Calculate KPIs
  const totalHours = periodEntries.reduce((sum, e) => sum + e.durationSeconds, 0);
  
  // Hours by team (role)
  const hoursByTeam = users.reduce((acc, user) => {
    const userEntries = periodEntries.filter(e => e.userId === user.id);
    const hours = userEntries.reduce((sum, e) => sum + e.durationSeconds, 0);
    acc[user.role] = (acc[user.role] || 0) + hours;
    return acc;
  }, {} as Record<string, number>);
  
  // Top 5 projects by hours
  const projectHours = periodEntries.reduce((acc, entry) => {
    const projectName = projects.find((p: any) => p.id === entry.projectId)?.name || 'Unknown';
    acc[projectName] = (acc[projectName] || 0) + entry.durationSeconds;
    return acc;
  }, {} as Record<string, number>);
  
  const top5Projects = Object.entries(projectHours)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, hours]) => ({ name, hours }));
  
  // Members with 0 hours in period
  const membersWithZeroHours = users.filter(user => {
    const userEntries = periodEntries.filter(e => e.userId === user.id);
    return userEntries.length === 0;
  });
  
  // Chart data
  const teamChartData = Object.entries(hoursByTeam).map(([role, hours]) => ({
    role: role.replace('_', ' '),
    hours: Math.round(hours / 3600 * 10) / 10 // Convert to hours with 1 decimal
  }));
  
  const projectChartData = top5Projects.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    hours: Math.round(project.hours / 3600 * 10) / 10
  }));
  
  // Generate trend data (mock for demo)
  const trendData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayEntries = entries.filter(e => e.date === date.toISOString().split('T')[0]);
    const hours = dayEntries.reduce((sum, e) => sum + e.durationSeconds, 0) / 3600;
    
    trendData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: Math.round(hours * 10) / 10
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Owner Dashboard</h1>
            <p className="text-muted-foreground">Company-wide time tracking insights</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/timesheet/manager">
                Manager View
              </Link>
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="quarterly">This Quarter</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                {start.toLocaleDateString()} - {end.toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(totalHours)}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(hoursByTeam).length}</div>
              <p className="text-xs text-muted-foreground">
                Teams with logged time
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Project</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(top5Projects[0]?.hours || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {top5Projects[0]?.name || 'No projects'}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{membersWithZeroHours.length}</div>
              <p className="text-xs text-muted-foreground">
                No time logged this period
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Hours by Team Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Hours by Team</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}h`, 'Hours']}
                    labelFormatter={(label) => `Role: ${label}`}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Projects Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Projects by Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}h`, 'Hours']}
                    labelFormatter={(label) => `Project: ${label}`}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Hours Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Hours Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}h`, 'Hours']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inactive Members */}
        {membersWithZeroHours.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Members with No Time Logged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {membersWithZeroHours.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <Badge variant="outline" className="mt-1">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/timesheet/manager/member/${user.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TimesheetOwnerDashboard;