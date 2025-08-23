import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import { 
  loadTimeEntries, 
  getUsers,
  getTimesheetProjects,
  formatDuration,
  type TimeEntry,
  type TimesheetUser 
} from "@/lib/timesheet";

const TimesheetMemberDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [user, setUser] = useState<TimesheetUser | null>(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('daily');
  
  useEffect(() => {
    if (!userId) return;
    
    const allEntries = loadTimeEntries();
    const userEntries = allEntries.filter(e => e.userId === parseInt(userId));
    setEntries(userEntries);
    
    const allUsers = getUsers();
    const foundUser = allUsers.find(u => u.id === parseInt(userId));
    setUser(foundUser || null);
    
    setProjects(getTimesheetProjects());
  }, [userId]);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">User not found</h2>
            <Button asChild>
              <Link to="/timesheet/manager">Back to Manager Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Get date ranges for different periods
  const today = new Date();
  const getEntriesForPeriod = (period: string) => {
    const start = new Date(today);
    const end = new Date(today);
    
    switch (period) {
      case 'daily':
        // Today only
        break;
      case 'weekly':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'monthly':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
    }
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
  };
  
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
  
  const renderEntriesTable = (periodEntries: TimeEntry[]) => {
    // Group entries by project/subproject/task
    const groupedEntries = periodEntries.reduce((acc, entry) => {
      const projectName = getProjectName(entry.projectId);
      const subprojectName = getSubprojectName(entry.projectId, entry.subprojectId);
      const taskName = getTaskName(entry.projectId, entry.subprojectId, entry.taskId);
      
      const key = `${projectName}${subprojectName ? ` > ${subprojectName}` : ''}${taskName ? ` > ${taskName}` : ''}`;
      
      if (!acc[key]) {
        acc[key] = {
          entries: [],
          totalDuration: 0
        };
      }
      
      acc[key].entries.push(entry);
      acc[key].totalDuration += entry.durationSeconds;
      
      return acc;
    }, {} as Record<string, { entries: TimeEntry[], totalDuration: number }>);
    
    const totalDuration = periodEntries.reduce((sum, e) => sum + e.durationSeconds, 0);
    
    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="font-medium">Total Time: {formatDuration(totalDuration)}</span>
          <span className="text-muted-foreground">{periodEntries.length} entries</span>
        </div>
        
        {/* Grouped Entries */}
        {Object.entries(groupedEntries).map(([groupName, group]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{groupName}</span>
                <Badge variant="outline">{formatDuration(group.totalDuration)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.startTime} - {entry.endTime}
                      </TableCell>
                      <TableCell>{formatDuration(entry.durationSeconds)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {entry.notes || <span className="text-muted-foreground">No notes</span>}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            entry.status === 'approved' ? 'default' : 
                            entry.status === 'requested_changes' ? 'destructive' : 'secondary'
                          }
                        >
                          {entry.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {entry.status === 'submitted' && (
                            <>
                              <Button size="sm" variant="outline">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline">
                                <XCircle className="w-4 h-4 mr-1" />
                                Request Changes
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
        
        {periodEntries.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No entries found</h3>
            <p className="text-muted-foreground">This member hasn't logged any time for this period</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/timesheet/manager')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Manager Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">
              {user.role.replace('_', ' ')} • Time tracking details
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            {renderEntriesTable(getEntriesForPeriod('daily'))}
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            {renderEntriesTable(getEntriesForPeriod('weekly'))}
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            {renderEntriesTable(getEntriesForPeriod('monthly'))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TimesheetMemberDetail;