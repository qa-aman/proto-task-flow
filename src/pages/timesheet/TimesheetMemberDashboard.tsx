import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Clock, Calendar, TrendingUp, Home } from "lucide-react";
import { 
  loadTimeEntries, 
  getCurrentUser, 
  formatDuration, 
  getTimesheetProjects,
  seedDemoData,
  type TimeEntry 
} from "@/lib/timesheet";

const TimesheetMemberDashboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  
  const currentUser = getCurrentUser();
  const projects = getTimesheetProjects();
  
  useEffect(() => {
    seedDemoData();
    const allEntries = loadTimeEntries();
    setEntries(allEntries.filter(e => e.userId === currentUser.id));
  }, []);
  
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter(e => e.date === today);
  
  // Calculate totals
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.durationSeconds, 0);
  
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const thisWeekEntries = entries.filter(e => {
    const entryDate = new Date(e.date);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });
  const weekTotal = thisWeekEntries.reduce((sum, e) => sum + e.durationSeconds, 0);
  
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(0);
  
  const thisMonthEntries = entries.filter(e => {
    const entryDate = new Date(e.date);
    return entryDate >= monthStart && entryDate <= monthEnd;
  });
  const monthTotal = thisMonthEntries.reduce((sum, e) => sum + e.durationSeconds, 0);
  
  const getProjectName = (projectId: number) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };
  
  const getSubprojectName = (projectId: number, subprojectId?: number) => {
    if (!subprojectId) return '';
    const project = projects.find(p => p.id === projectId);
    return project?.subProjects?.find(sp => sp.id === subprojectId)?.name || '';
  };
  
  const getTaskName = (projectId: number, subprojectId?: number, taskId?: number) => {
    if (!taskId || !subprojectId) return '';
    const project = projects.find(p => p.id === projectId);
    const subproject = project?.subProjects?.find(sp => sp.id === subprojectId);
    return subproject?.tasks?.find(t => t.id === taskId)?.title || '';
  };
  
  const handleCardClick = (period: 'daily' | 'weekly' | 'monthly') => {
    // Navigate to Manager view with filters applied
    navigate(`/timesheet/manager?members=${currentUser.id}&period=${period}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Timesheet</h1>
            <p className="text-muted-foreground">Welcome back, {currentUser.name}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button asChild>
              <Link to="/timesheet/log">
                <Plus className="w-4 h-4 mr-2" />
                Log Time
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards - Clickable */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleCardClick('daily')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(todayTotal)}</div>
              <p className="text-xs text-muted-foreground">
                {todayEntries.length} {todayEntries.length === 1 ? 'entry' : 'entries'}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleCardClick('weekly')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(weekTotal)}</div>
              <p className="text-xs text-muted-foreground">
                {thisWeekEntries.length} {thisWeekEntries.length === 1 ? 'entry' : 'entries'}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleCardClick('monthly')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(monthTotal)}</div>
              <p className="text-xs text-muted-foreground">
                {thisMonthEntries.length} {thisMonthEntries.length === 1 ? 'entry' : 'entries'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Entries - 5 Column Table */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {todayEntries.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No time logged today</h3>
                <p className="text-muted-foreground mb-4">Start tracking your time to see your progress</p>
                <Button asChild>
                  <Link to="/timesheet/log">Log Time</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Sub-project</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead>Time spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {getProjectName(entry.projectId)}
                      </TableCell>
                      <TableCell>
                        {entry.subprojectId ? getSubprojectName(entry.projectId, entry.subprojectId) : '-'}
                      </TableCell>
                      <TableCell>
                        {entry.taskId ? getTaskName(entry.projectId, entry.subprojectId, entry.taskId) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.billable === 'billable' ? 'default' : 'secondary'}>
                          {entry.billable === 'billable' ? 'Billable' : 'Non-billable'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatDuration(entry.durationSeconds)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimesheetMemberDashboard;