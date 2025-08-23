import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  loadTimeEntries, 
  saveTimeEntry,
  getCurrentUser, 
  getTimesheetProjects,
  computeDuration,
  detectOverlaps,
  isLockedDay,
  type TimesheetProject,
  type TimesheetSubproject,
  type TimesheetTask
} from "@/lib/timesheet";

const TimesheetDailyLog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    projectId: '',
    subprojectId: '',
    taskId: '',
    subtaskId: '',
    notes: ''
  });
  
  const [projects, setProjects] = useState<TimesheetProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<TimesheetProject | null>(null);
  const [selectedSubproject, setSelectedSubproject] = useState<TimesheetSubproject | null>(null);
  const [selectedTask, setSelectedTask] = useState<TimesheetTask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentUser = getCurrentUser();
  const isLocked = isLockedDay(formData.date);
  
  useEffect(() => {
    setProjects(getTimesheetProjects());
  }, []);
  
  useEffect(() => {
    const project = projects.find(p => p.id.toString() === formData.projectId);
    setSelectedProject(project || null);
    if (!project) {
      setFormData(prev => ({ ...prev, subprojectId: '', taskId: '', subtaskId: '' }));
      setSelectedSubproject(null);
      setSelectedTask(null);
    }
  }, [formData.projectId, projects]);
  
  useEffect(() => {
    if (!selectedProject) return;
    const subproject = selectedProject.subProjects?.find(sp => sp.id.toString() === formData.subprojectId);
    setSelectedSubproject(subproject || null);
    if (!subproject) {
      setFormData(prev => ({ ...prev, taskId: '', subtaskId: '' }));
      setSelectedTask(null);
    }
  }, [formData.subprojectId, selectedProject]);
  
  useEffect(() => {
    if (!selectedSubproject) return;
    const task = selectedSubproject.tasks?.find(t => t.id.toString() === formData.taskId);
    setSelectedTask(task || null);
    if (!task) {
      setFormData(prev => ({ ...prev, subtaskId: '' }));
    }
  }, [formData.taskId, selectedSubproject]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validation
      if (!formData.projectId) {
        toast({ title: "Error", description: "Please select a project", variant: "destructive" });
        return;
      }
      
      if (!isLocked) {
        if (!formData.startTime || !formData.endTime) {
          toast({ title: "Error", description: "Please enter start and end times", variant: "destructive" });
          return;
        }
        
        const duration = computeDuration(formData.startTime, formData.endTime);
        if (duration <= 0) {
          toast({ title: "Error", description: "End time must be after start time", variant: "destructive" });
          return;
        }
        
        // Check for overlaps
        const existingEntries = loadTimeEntries();
        const newEntry = {
          userId: currentUser.id,
          role: currentUser.role,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          durationSeconds: duration,
          projectId: parseInt(formData.projectId),
          subprojectId: formData.subprojectId ? parseInt(formData.subprojectId) : undefined,
          taskId: formData.taskId ? parseInt(formData.taskId) : undefined,
          subtaskId: formData.subtaskId ? parseInt(formData.subtaskId) : undefined,
          notes: formData.notes,
          status: 'submitted' as const
        };
        
        if (detectOverlaps(existingEntries, newEntry)) {
          toast({ 
            title: "Error", 
            description: "This time entry overlaps with an existing entry", 
            variant: "destructive" 
          });
          return;
        }
        
        saveTimeEntry(newEntry);
      } else {
        // Locked day - notes only
        const newEntry = {
          userId: currentUser.id,
          role: currentUser.role,
          date: formData.date,
          startTime: '00:00',
          endTime: '00:00',
          durationSeconds: 0,
          projectId: parseInt(formData.projectId),
          subprojectId: formData.subprojectId ? parseInt(formData.subprojectId) : undefined,
          taskId: formData.taskId ? parseInt(formData.taskId) : undefined,
          subtaskId: formData.subtaskId ? parseInt(formData.subtaskId) : undefined,
          notes: formData.notes,
          status: 'submitted' as const
        };
        
        saveTimeEntry(newEntry);
      }
      
      toast({ title: "Success", description: "Time entry saved successfully" });
      navigate('/timesheet');
    } catch (error) {
      toast({ title: "Error", description: "Failed to save time entry", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold">Log Time Entry</h1>
            <p className="text-muted-foreground">Record your work time</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {isLocked && (
            <Alert className="mb-6">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Timesheet is locked for {new Date(formData.date).toLocaleDateString()} due to weekend/holiday. 
                Only notes can be added.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Time Entry Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div /> {/* Empty div for grid alignment */}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      disabled={isLocked}
                      required={!isLocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      disabled={isLocked}
                      required={!isLocked}
                    />
                  </div>
                </div>

                {!isLocked && formData.startTime && formData.endTime && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Duration:</strong> {Math.floor(computeDuration(formData.startTime, formData.endTime) / 3600)}h {Math.floor((computeDuration(formData.startTime, formData.endTime) % 3600) / 60)}m
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project *</Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProject?.subProjects && selectedProject.subProjects.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="subproject">Subproject</Label>
                      <Select
                        value={formData.subprojectId || "none"}
                        onValueChange={(value) => setFormData({ ...formData, subprojectId: value === "none" ? "" : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subproject (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {selectedProject.subProjects.map((subproject) => (
                            <SelectItem key={subproject.id} value={subproject.id.toString()}>
                              {subproject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedSubproject?.tasks && selectedSubproject.tasks.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="task">Task</Label>
                      <Select
                        value={formData.taskId || "none"}
                        onValueChange={(value) => setFormData({ ...formData, taskId: value === "none" ? "" : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select task (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {selectedSubproject.tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id.toString()}>
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedTask?.subtasks && selectedTask.subtasks.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="subtask">Subtask</Label>
                      <Select
                        value={formData.subtaskId || "none"}
                        onValueChange={(value) => setFormData({ ...formData, subtaskId: value === "none" ? "" : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subtask (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {selectedTask.subtasks.map((subtask) => (
                            <SelectItem key={subtask.id} value={subtask.id.toString()}>
                              {subtask.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes about this work..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Entry'}
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