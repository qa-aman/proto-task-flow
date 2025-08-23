import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Clock, Calendar, TrendingUp, Edit3, Home } from "lucide-react";
import { 
  loadTimeEntries, 
  getCurrentUser, 
  formatDuration, 
  getTimesheetProjects,
  seedDemoData,
  type TimeEntry 
} from "@/lib/timesheet";

const TimesheetMemberDashboard = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  
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
  
  const handleSaveNotes = () => {
    if (!selectedEntry) return;
    
    const updatedEntries = entries.map(e => 
      e.id === selectedEntry.id ? { ...e, notes: editNotes } : e
    );
    setEntries(updatedEntries);
    
    // Save to localStorage
    const allEntries = loadTimeEntries();
    const otherUserEntries = allEntries.filter(e => e.userId !== currentUser.id);
    const updatedAllEntries = [...otherUserEntries, ...updatedEntries];
    localStorage.setItem('its_timesheet_entries', JSON.stringify(updatedAllEntries));
    
    setIsEditingNotes(false);
  };
  
  const openEntryDetail = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setEditNotes(entry.notes);
    setIsEditingNotes(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Time Tracker</h1>
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

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
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

          <Card>
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

          <Card>
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

        {/* Today's Entries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Entries</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/timesheet/summary">View Summary</Link>
            </Button>
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
              <div className="space-y-3">
                {todayEntries.map((entry) => (
                  <Drawer key={entry.id}>
                    <DrawerTrigger asChild>
                      <div 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => openEntryDetail(entry)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{getProjectName(entry.projectId)}</span>
                            {entry.subprojectId && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">
                                  {getSubprojectName(entry.projectId, entry.subprojectId)}
                                </span>
                              </>
                            )}
                            {entry.taskId && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">
                                  {getTaskName(entry.projectId, entry.subprojectId, entry.taskId)}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{entry.startTime} - {entry.endTime}</span>
                            <Badge variant={entry.status === 'approved' ? 'default' : 'secondary'}>
                              {entry.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatDuration(entry.durationSeconds)}</div>
                        </div>
                      </div>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Time Entry Details</DrawerTitle>
                      </DrawerHeader>
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Project</label>
                            <p className="text-sm text-muted-foreground">{getProjectName(entry.projectId)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Duration</label>
                            <p className="text-sm text-muted-foreground">{formatDuration(entry.durationSeconds)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Time</label>
                            <p className="text-sm text-muted-foreground">{entry.startTime} - {entry.endTime}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Badge variant={entry.status === 'approved' ? 'default' : 'secondary'}>
                              {entry.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setIsEditingNotes(!isEditingNotes)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </div>
                          {isEditingNotes ? (
                            <div className="space-y-2">
                              <Textarea 
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Add notes about this time entry..."
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveNotes}>Save</Button>
                                <Button size="sm" variant="outline" onClick={() => setIsEditingNotes(false)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {entry.notes || 'No notes added'}
                            </p>
                          )}
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimesheetMemberDashboard;