import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Lock, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  loadTimeEntries, 
  saveTimeEntries,
  getCurrentUser, 
  getTimesheetProjects,
  hhmmToSeconds,
  detectOverlaps,
  isLockedDay,
  clearUserEntriesForDate,
  type TimesheetProject,
  type TimesheetSubproject,
  type TimesheetTask,
  type TimeEntry
} from "@/lib/timesheet";

interface TimeRow {
  id: string;
  projectId: string;
  subprojectId: string;
  taskId: string;
  billable: 'billable' | 'non_billable';
  timeSpentHHMM: string;
}

const TimesheetDailyLog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<TimeRow[]>([]);
  const [notes, setNotes] = useState('');
  const [projects, setProjects] = useState<TimesheetProject[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentUser = getCurrentUser();
  const isLocked = isLockedDay(selectedDate);
  
  useEffect(() => {
    setProjects(getTimesheetProjects());
    // Initialize with 5 default rows
    setRows(Array.from({ length: 5 }, (_, i) => ({
      id: `row-${i}`,
      projectId: 'none',
      subprojectId: 'none',
      taskId: 'none',
      billable: 'billable' as const,
      timeSpentHHMM: ''
    })));
  }, []);
  
  const addRow = () => {
    const newRow: TimeRow = {
      id: `row-${Date.now()}`,
      projectId: 'none',
      subprojectId: 'none',
      taskId: 'none',
      billable: 'billable',
      timeSpentHHMM: ''
    };
    setRows([...rows, newRow]);
  };
  
  const removeRow = (rowId: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== rowId));
    }
  };
  
  const updateRow = (rowId: string, field: keyof TimeRow, value: string) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        const updated = { ...row, [field]: value };
        // Reset cascading selects when parent changes
        if (field === 'projectId') {
          updated.subprojectId = 'none';
          updated.taskId = 'none';
        } else if (field === 'subprojectId') {
          updated.taskId = 'none';
        }
        return updated;
      }
      return row;
    }));
  };
  
  const getProject = (projectId: string) => {
    return projects.find(p => p.id.toString() === projectId);
  };
  
  const getSubproject = (projectId: string, subprojectId: string) => {
    const project = getProject(projectId);
    return project?.subProjects?.find(sp => sp.id.toString() === subprojectId);
  };
  
  const getTask = (projectId: string, subprojectId: string, taskId: string) => {
    const subproject = getSubproject(projectId, subprojectId);
    return subproject?.tasks?.find(t => t.id.toString() === taskId);
  };
  
  const isValidRow = (row: TimeRow) => {
    return row.projectId !== 'none' && row.timeSpentHHMM && hhmmToSeconds(row.timeSpentHHMM) > 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const validRows = rows.filter(isValidRow);
      
      if (isLocked) {
        // Locked day - only notes allowed
        if (notes.trim()) {
          const newEntry: Omit<TimeEntry, 'id'> = {
            userId: currentUser.id,
            role: currentUser.role,
            date: selectedDate,
            startTime: '00:00',
            endTime: '00:00',
            durationSeconds: 0,
            projectId: validRows[0]?.projectId !== 'none' ? parseInt(validRows[0].projectId) : 1,
            notes,
            status: 'submitted',
            billable: 'non_billable'
          };
          
          const entries = loadTimeEntries();
          const newId = Date.now();
          entries.push({ ...newEntry, id: newId });
          saveTimeEntries(entries);
        }
      } else {
        // Normal day - validate and save time entries
        if (validRows.length === 0) {
          toast({ title: "Error", description: "Please add at least one valid time entry", variant: "destructive" });
          return;
        }
        
        // Check for overlaps (simplified - assuming each row is a separate time block)
        const entries = loadTimeEntries();
        const newEntries: TimeEntry[] = [];
        
        for (const row of validRows) {
          const durationSeconds = hhmmToSeconds(row.timeSpentHHMM);
          
          // Create a simple time entry (assuming sequential blocks for demo)
          const newEntry: TimeEntry = {
            id: Date.now() + Math.random(),
            userId: currentUser.id,
            role: currentUser.role,
            date: selectedDate,
            startTime: '09:00', // Simplified for demo
            endTime: '17:00',   // Simplified for demo
            durationSeconds,
            projectId: parseInt(row.projectId),
            subprojectId: row.subprojectId !== 'none' ? parseInt(row.subprojectId) : undefined,
            taskId: row.taskId !== 'none' ? parseInt(row.taskId) : undefined,
            notes: notes,
            status: 'submitted',
            billable: row.billable
          };
          
          newEntries.push(newEntry);
        }
        
        saveTimeEntries([...entries, ...newEntries]);
      }
      
      toast({ title: "Success", description: "Time entries saved successfully" });
      navigate('/timesheet');
    } catch (error) {
      toast({ title: "Error", description: "Failed to save time entries", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClearDay = () => {
    clearUserEntriesForDate(currentUser.id, selectedDate);
    toast({ title: "Success", description: "Day cleared successfully" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/timesheet')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Daily Timesheet Entry</h1>
            <p className="text-muted-foreground">Log your time with the 5-column table format</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {isLocked && (
            <Alert className="mb-6">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Timesheet is locked for {new Date(selectedDate).toLocaleDateString()} due to weekend/holiday. 
                Only notes can be added.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Time Entry</CardTitle>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-48"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLocked && (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Sub-project</TableHead>
                          <TableHead>Task</TableHead>
                          <TableHead>Billable / Non-billable</TableHead>
                          <TableHead>Time spent (hh:mm)</TableHead>
                          <TableHead className="w-16">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <Select
                                value={row.projectId}
                                onValueChange={(value) => updateRow(row.id, 'projectId', value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Select project</SelectItem>
                                  {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id.toString()}>
                                      {project.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={row.subprojectId}
                                onValueChange={(value) => updateRow(row.id, 'subprojectId', value)}
                                disabled={row.projectId === 'none'}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select sub-project" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {getProject(row.projectId)?.subProjects?.map((subproject) => (
                                    <SelectItem key={subproject.id} value={subproject.id.toString()}>
                                      {subproject.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={row.taskId}
                                onValueChange={(value) => updateRow(row.id, 'taskId', value)}
                                disabled={row.subprojectId === 'none'}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select task" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {getSubproject(row.projectId, row.subprojectId)?.tasks?.map((task) => (
                                    <SelectItem key={task.id} value={task.id.toString()}>
                                      {task.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={row.billable}
                                onValueChange={(value: 'billable' | 'non_billable') => updateRow(row.id, 'billable', value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="billable">Billable</SelectItem>
                                  <SelectItem value="non_billable">Non-billable</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                placeholder="00:00"
                                pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                                value={row.timeSpentHHMM}
                                onChange={(e) => updateRow(row.id, 'timeSpentHHMM', e.target.value)}
                                className={`w-full ${!isValidRow(row) && row.timeSpentHHMM ? 'border-destructive' : ''}`}
                              />
                            </TableCell>
                            <TableCell>
                              {rows.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRow(row.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <Button type="button" variant="outline" onClick={addRow} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Row
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes {isLocked ? "(required for locked days)" : "(optional)"}</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about your work..."
                    rows={3}
                    required={isLocked}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || (isLocked && !notes.trim())} 
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Entries'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClearDay}>
                    Clear Day
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/timesheet')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimesheetDailyLog;