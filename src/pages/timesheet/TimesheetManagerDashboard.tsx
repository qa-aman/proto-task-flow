import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Clock, TrendingUp, Home, Filter, ChevronDown, Download, Lock } from "lucide-react";
import { 
  loadTimeEntries, 
  getUsers,
  getTimesheetProjects,
  formatDuration,
  isLockedDay,
  type TimeEntry,
  type TimesheetUser 
} from "@/lib/timesheet";

const TimesheetManagerDashboard = () => {
  const [searchParams] = useSearchParams();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [users, setUsers] = useState<TimesheetUser[]>([]);
  const [projects, setProjects] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    period: 'weekly',
    project: ''
  });
  
  useEffect(() => {
    setEntries(loadTimeEntries());
    setUsers(getUsers());
    setProjects(getTimesheetProjects());
    
    // Apply query params from navigation
    const membersParam = searchParams.get('members');
    const periodParam = searchParams.get('period');
    
    if (membersParam) {
      setSelectedMembers(membersParam.split(','));
    }
    if (periodParam) {
      setFilters(prev => ({ ...prev, period: periodParam }));
    }
  }, [searchParams]);
  
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
    
    const matchesMembers = selectedMembers.length === 0 || selectedMembers.includes(entry.userId.toString());
    const matchesProject = !filters.project || entry.projectId.toString() === filters.project;
    
    return inDateRange && matchesMembers && matchesProject;
  });
  
  const teamMembers = users.filter(user => user.role !== 'owner');
  
  // Group entries by member, then by project/subproject/task
  const groupedData = teamMembers.map(user => {
    const userEntries = filteredEntries.filter(e => e.userId === user.id);
    const totalHours = userEntries.reduce((sum, e) => sum + e.durationSeconds, 0);
    const billableHours = userEntries.filter(e => e.billable === 'billable').reduce((sum, e) => sum + e.durationSeconds, 0);
    const nonBillableHours = totalHours - billableHours;
    
    // Group by project
    const projectGroups = userEntries.reduce((acc, entry) => {
      const key = `${entry.projectId}-${entry.subprojectId || 'none'}-${entry.taskId || 'none'}`;
      if (!acc[key]) {
        acc[key] = {
          projectId: entry.projectId,
          subprojectId: entry.subprojectId,
          taskId: entry.taskId,
          billable: entry.billable,
          entries: [],
          totalTime: 0
        };
      }
      acc[key].entries.push(entry);
      acc[key].totalTime += entry.durationSeconds;
      return acc;
    }, {} as Record<string, any>);
    
    return {
      user,
      totalHours,
      billableHours,
      nonBillableHours,
      projectGroups: Object.values(projectGroups),
      entryCount: userEntries.length
    };
  });
  
  const getProjectName = (projectId: number) => {
    return projects.find((p: any) => p.id === projectId)?.name || 'Unknown Project';
  };
  
  const getSubprojectName = (projectId: number, subprojectId?: number) => {
    if (!subprojectId) return '';
    const project = projects.find((p: any) => p.id === projectId);
    return project?.subProjects?.find((sp: any) => sp.id === subprojectId)?.name || '';
  };
  
  const getTaskName = (projectId: number, subprojectId?: number, taskId?: number) => {
    if (!taskId || !subprojectId) return '';
    const project = projects.find((p: any) => p.id === projectId);
    const subproject = project?.subProjects?.find((sp: any) => sp.id === subprojectId);
    return subproject?.tasks?.find((t: any) => t.id === taskId)?.title || '';
  };
  
  const handleMemberSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, userId]);
    } else {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    }
  };
  
  const handleSelectAll = () => {
    if (selectedMembers.length === teamMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(teamMembers.map(u => u.id.toString()));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Team Overview</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Members</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedMembers.length === 0 
                        ? "All members" 
                        : selectedMembers.length === teamMembers.length 
                        ? "All members"
                        : `${selectedMembers.length} selected`
                      }
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-background border shadow-lg">
                    <DropdownMenuItem onClick={handleSelectAll} className="flex items-center space-x-2">
                      <Checkbox 
                        checked={selectedMembers.length === teamMembers.length}
                      />
                      <span>All members</span>
                    </DropdownMenuItem>
                    {teamMembers.map((user) => (
                      <DropdownMenuItem 
                        key={user.id} 
                        onClick={() => handleMemberSelect(user.id.toString(), !selectedMembers.includes(user.id.toString()))}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox 
                          checked={selectedMembers.includes(user.id.toString())}
                        />
                        <span>{user.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <div className="text-2xl font-bold">{groupedData.length}</div>
              <p className="text-xs text-muted-foreground">
                {groupedData.filter(m => m.entryCount > 0).length} active this period
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

        {/* Team Overview Table - 5 Column Format */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team Time Breakdown</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Sub-project</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Billable</TableHead>
                  <TableHead>Time spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedData.map((memberData) => (
                  memberData.projectGroups.map((group: any, groupIndex: number) => {
                    const hasLockedEntries = group.entries.some((entry: TimeEntry) => isLockedDay(entry.date));
                    return (
                      <TableRow 
                        key={`${memberData.user.id}-${groupIndex}`}
                        className={`${hasLockedEntries ? 'bg-muted/50' : ''} hover:bg-muted/30`}
                      >
                        <TableCell className="font-medium">
                          {groupIndex === 0 ? memberData.user.name : ''}
                          {hasLockedEntries && groupIndex === 0 && <Lock className="w-4 h-4 inline ml-2 text-muted-foreground" />}
                        </TableCell>
                        <TableCell>{getProjectName(group.projectId)}</TableCell>
                        <TableCell>
                          {group.subprojectId ? getSubprojectName(group.projectId, group.subprojectId) : '-'}
                        </TableCell>
                        <TableCell>
                          {group.taskId ? getTaskName(group.projectId, group.subprojectId, group.taskId) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={group.billable === 'billable' ? 'default' : 'secondary'}>
                            {group.billable === 'billable' ? 'Billable' : 'Non-billable'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatDuration(group.totalTime)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ))}
                
                {/* Member Subtotals */}
                {groupedData.map((memberData) => (
                  <TableRow key={`${memberData.user.id}-subtotal`} className="border-t-2 bg-muted/20">
                    <TableCell className="font-bold">{memberData.user.name} Subtotal</TableCell>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      Billable: {formatDuration(memberData.billableHours)} | 
                      Non-billable: {formatDuration(memberData.nonBillableHours)}
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatDuration(memberData.totalHours)}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Grand Total */}
                <TableRow className="border-t-4 bg-primary/10">
                  <TableCell className="font-bold text-lg">Grand Total</TableCell>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    All team members for {filters.period} period
                  </TableCell>
                  <TableCell className="font-bold text-lg">
                    {formatDuration(filteredEntries.reduce((sum, e) => sum + e.durationSeconds, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            {groupedData.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No data found</h3>
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