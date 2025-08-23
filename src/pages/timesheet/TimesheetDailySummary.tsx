import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Calendar, Clock, AlertTriangle } from "lucide-react";
import { 
  loadTimeEntries, 
  getCurrentUser, 
  formatDuration, 
  getTimesheetProjects,
  type TimeEntry 
} from "@/lib/timesheet";

const TimesheetDailySummary = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  
  const currentUser = getCurrentUser();
  const projects = getTimesheetProjects();
  
  useEffect(() => {
    const allEntries = loadTimeEntries();
    const userEntries = allEntries.filter(e => e.userId === currentUser.id && e.date === selectedDate);
    
    // Sort by start time
    userEntries.sort((a, b) => {
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      return 0;
    });
    
    setEntries(userEntries);
  }, [selectedDate, currentUser.id]);
  
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
  
  // Calculate totals by project/subproject/task
  const projectTotals = entries.reduce((acc, entry) => {
    const projectName = getProjectName(entry.projectId);
    const subprojectName = getSubprojectName(entry.projectId, entry.subprojectId);
    const taskName = getTaskName(entry.projectId, entry.subprojectId, entry.taskId);
    
    const key = `${projectName}${subprojectName ? ` > ${subprojectName}` : ''}${taskName ? ` > ${taskName}` : ''}`;
    
    if (!acc[key]) acc[key] = 0;
    acc[key] += entry.durationSeconds;
    
    return acc;
  }, {} as Record<string, number>);
  
  // Detect gaps and overlaps
  const timelineIssues = [];
  for (let i = 0; i < entries.length - 1; i++) {
    const current = entries[i];
    const next = entries[i + 1];
    
    if (current.endTime > next.startTime) {
      timelineIssues.push({
        type: 'overlap',
        entry1: current,
        entry2: next,
        message: `Overlap between ${current.startTime}-${current.endTime} and ${next.startTime}-${next.endTime}`
      });
    } else if (current.endTime < next.startTime) {
      const gapStart = current.endTime;
      const gapEnd = next.startTime;
      const [gapStartHour, gapStartMin] = gapStart.split(':').map(Number);
      const [gapEndHour, gapEndMin] = gapEnd.split(':').map(Number);
      const gapMinutes = (gapEndHour * 60 + gapEndMin) - (gapStartHour * 60 + gapStartMin);
      
      if (gapMinutes > 30) { // Show gaps longer than 30 minutes
        timelineIssues.push({
          type: 'gap',
          entry1: current,
          entry2: next,
          message: `${Math.floor(gapMinutes / 60)}h ${gapMinutes % 60}m gap between ${gapStart} and ${gapEnd}`
        });
      }
    }
  }
  
  const totalDuration = entries.reduce((sum, e) => sum + e.durationSeconds, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/timesheet')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Daily Summary</h1>
            <p className="text-muted-foreground">Review your day's work</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Date Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
                <div className="text-sm text-muted-foreground">
                  Total: <span className="font-medium">{formatDuration(totalDuration)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Issues */}
          {timelineIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Timeline Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timelineIssues.map((issue, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-warning-muted rounded-lg">
                      <Badge variant={issue.type === 'overlap' ? 'destructive' : 'secondary'}>
                        {issue.type}
                      </Badge>
                      <span className="text-sm">{issue.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {entries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No entries for this date</h3>
                <p className="text-muted-foreground mb-4">Select a different date or log some time</p>
                <Button asChild>
                  <Link to="/timesheet/log">Log Time</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Timeline View */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {entries.map((entry, index) => (
                      <div key={entry.id} className="flex items-center gap-4 p-4 border-l-4 border-primary">
                        <div className="w-24 text-sm font-mono">
                          {entry.startTime}
                        </div>
                        <div className="w-24 text-sm font-mono text-muted-foreground">
                          {entry.endTime}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{getProjectName(entry.projectId)}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {entry.subprojectId && (
                              <span>{getSubprojectName(entry.projectId, entry.subprojectId)}</span>
                            )}
                            {entry.taskId && (
                              <>
                                <span>•</span>
                                <span>{getTaskName(entry.projectId, entry.subprojectId, entry.taskId)}</span>
                              </>
                            )}
                          </div>
                          {entry.notes && (
                            <div className="text-sm text-muted-foreground mt-1">{entry.notes}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatDuration(entry.durationSeconds)}</div>
                          <Badge variant={entry.status === 'approved' ? 'default' : 'secondary'} className="mt-1">
                            {entry.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Totals */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(projectTotals).map(([project, duration]) => (
                      <div key={project} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{project}</span>
                        <span className="text-sm font-mono">{formatDuration(duration)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimesheetDailySummary;