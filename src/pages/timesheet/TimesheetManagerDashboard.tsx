import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, TrendingUp, Home, Filter } from "lucide-react";
import { 
  loadTimeEntries, 
  getUsers,
  getTimesheetProjects,
  formatDuration,
  type TimeEntry,
  type TimesheetUser 
} from "@/lib/timesheet";

const TimesheetManagerDashboard = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [users, setUsers] = useState<TimesheetUser[]>([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    member: '',
    role: '',
    period: 'weekly',
    project: ''
  });
  
  useEffect(() => {
    setEntries(loadTimeEntries());
    setUsers(getUsers());
    setProjects(getTimesheetProjects());
  }, []);
  
  // Get date ranges for filtering
  const today = new Date();
  const getDateRange = (period: string) => {
    const start = new Date(today);
    const end = new Date(today);
    
    switch (period) {
      case 'daily':
        // Today only
        break;
      case 'weekly':
        start.setDate(start.getDate() - start.getDay()); // Start of week
        end.setDate(start.getDate() + 6); // End of week
        break;
      case 'monthly':
        start.setDate(1); // Start of month
        end.setMonth(end.getMonth() + 1);
        end.setDate(0); // Last day of month
        break;
    }
    
    return { start, end };
  };
  
  const { start, end } = getDateRange(filters.period);
  
  // Filter entries based on current filters
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const inDateRange = entryDate >= start && entryDate <= end;
    
    const matchesUser = !filters.member || entry.userId.toString() === filters.member;
    const matchesRole = !filters.role || entry.role === filters.role;
    const matchesProject = !filters.project || entry.projectId.toString() === filters.project;
    
    return inDateRange && matchesUser && matchesRole && matchesProject;
  });
  
  // Calculate member summaries
  const memberSummaries = users
    .filter(user => user.role !== 'owner') // Exclude owners from team view
    .map(user => {
      const userEntries = filteredEntries.filter(e => e.userId === user.id);
      const totalHours = userEntries.reduce((sum, e) => sum + e.durationSeconds, 0);
      const billableHours = userEntries.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.durationSeconds, 0);
      const nonBillableHours = totalHours - billableHours;
      
      // Mock overdue submissions (entries with status 'submitted' older than 2 days)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const overdueSubmissions = userEntries.filter(e => 
        e.status === 'submitted' && new Date(e.date) < twoDaysAgo
      ).length;
      
      return {
        user,
        totalHours,
        billableHours,
        nonBillableHours,
        overdueSubmissions,
        entryCount: userEntries.length
      };
    });

  const getProjectName = (projectId: number) => {
    return projects.find((p: any) => p.id === projectId)?.name || 'Unknown Project';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manager Dashboard</h1>
            <p className="text-muted-foreground">Monitor team time tracking and productivity</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Member</label>
                <Select value={filters.member} onValueChange={(value) => setFilters({ ...filters, member: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All members</SelectItem>
                    {users.filter(u => u.role !== 'owner').map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="team_member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Period</label>
                <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={filters.project} onValueChange={(value) => setFilters({ ...filters, project: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All projects</SelectItem>
                    {projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberSummaries.length}</div>
              <p className="text-xs text-muted-foreground">
                {memberSummaries.filter(m => m.entryCount > 0).length} active this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(filteredEntries.reduce((sum, e) => sum + e.durationSeconds, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {filteredEntries.length} entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredEntries.filter(e => e.status === 'submitted').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Entries awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Overview Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Billable</TableHead>
                  <TableHead>Non-Billable</TableHead>
                  <TableHead>Overdue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberSummaries.map((summary) => (
                  <TableRow key={summary.user.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{summary.user.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {summary.user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDuration(summary.totalHours)}</TableCell>
                    <TableCell className="text-success">{formatDuration(summary.billableHours)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDuration(summary.nonBillableHours)}</TableCell>
                    <TableCell>
                      {summary.overdueSubmissions > 0 ? (
                        <Badge variant="destructive">{summary.overdueSubmissions}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/timesheet/manager/member/${summary.user.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {memberSummaries.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No team members found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimesheetManagerDashboard;