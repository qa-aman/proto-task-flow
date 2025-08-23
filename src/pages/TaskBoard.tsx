import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, User, Calendar, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import TaskDetail from "@/components/TaskDetail";

const TaskBoard = () => {
  const { id, sid } = useParams();
  const navigate = useNavigate();
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    startDate: "",
    endDate: "",
    status: "open",
    priority: "medium",
    subProjectId: "",
    recurrence: {
      isDaily: false,
      isWeekly: false,
      isRecurring: false,
      time: "",
      weekday: 0
    }
  });

  const [columns] = useState([
    { id: "open", title: "Open", color: "kanban-open", tasks: [] },
    { id: "progress", title: "In Progress", color: "kanban-progress", tasks: [] },
    { id: "blocked", title: "Blocked", color: "kanban-blocked", tasks: [] },
    { id: "done", title: "Done", color: "kanban-done", tasks: [] }
  ]);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Design Homepage Wireframes",
      description: "Create detailed wireframes for the new homepage layout",
      assignee: { name: "Sarah Johnson", initials: "SJ", avatar: "" },
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      status: "progress",
      timeSpent: 8.5,
      priority: "high",
      comments: [],
      subProjectId: null,
      subtasks: [
        { id: 1, title: "Create wireframe mockups", assigneeId: 1, status: "done", dueDate: "2024-01-18" },
        { id: 2, title: "Design navigation flow", assigneeId: 1, status: "progress", dueDate: "2024-01-19" },
        { id: 3, title: "Review with stakeholders", assigneeId: 2, status: "open", dueDate: "2024-01-20" }
      ],
      recurrence: { isDaily: false, isWeekly: false, isRecurring: false, time: "", weekday: 0 }
    },
    {
      id: 2,
      title: "Implement User Authentication",
      description: "Set up login and registration functionality",
      assignee: { name: "John Doe", initials: "JD", avatar: "" },
      startDate: "2024-01-10",
      endDate: "2024-01-25",
      status: "open",
      timeSpent: 12.0,
      priority: "high",
      comments: [],
      subProjectId: null,
      subtasks: [],
      recurrence: { isDaily: false, isWeekly: false, isRecurring: false, time: "", weekday: 0 }
    },
    {
      id: 3,
      title: "Database Migration",
      description: "Migrate existing data to new database schema",
      assignee: { name: "Jane Smith", initials: "JS", avatar: "" },
      startDate: "2024-01-08",
      endDate: "2024-01-15",
      status: "blocked",
      timeSpent: 6.0,
      priority: "medium",
      comments: [],
      subProjectId: null,
      subtasks: [],
      recurrence: { isDaily: false, isWeekly: false, isRecurring: false, time: "", weekday: 0 }
    },
    {
      id: 4,
      title: "Write API Documentation",
      description: "Document all API endpoints and examples",
      assignee: { name: "Mike Wilson", initials: "MW", avatar: "" },
      startDate: "2024-01-05",
      endDate: "2024-01-12",
      status: "done",
      timeSpent: 16.0,
      priority: "low",
      comments: [],
      subProjectId: null,
      subtasks: [],
      recurrence: { isDaily: true, isWeekly: false, isRecurring: false, time: "09:00", weekday: 0 }
    }
  ]);

  // Load project and subprojects from localStorage
  const [project, setProject] = useState<any>(null);
  const [currentSubproject, setCurrentSubproject] = useState<any>(null);

  useState(() => {
    const savedProjects = localStorage.getItem("tm_projects");
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const foundProject = projects.find((p: any) => p.id === parseInt(id || "1"));
      if (foundProject) {
        setProject(foundProject);
        if (sid) {
          const subproject = foundProject.subProjects?.find((sp: any) => sp.id === parseInt(sid));
          setCurrentSubproject(subproject);
        }
      }
    } else {
      // Fallback data
      const fallbackProject = {
        id: parseInt(id || "1"),
        name: "Website Redesign",
        description: "Complete redesign of company website with modern UI/UX",
        subProjects: []
      };
      setProject(fallbackProject);
    }
  });

  const teamMembers = [
    { id: 1, name: "Sarah Johnson", initials: "SJ" },
    { id: 2, name: "John Doe", initials: "JD" },
    { id: 3, name: "Jane Smith", initials: "JS" },
    { id: 4, name: "Mike Wilson", initials: "MW" }
  ];

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: tasks.length + 1,
        ...newTask,
        assignee: teamMembers.find(m => m.id.toString() === newTask.assignee) ? 
          { ...teamMembers.find(m => m.id.toString() === newTask.assignee)!, avatar: "" } : 
          null,
        timeSpent: 0,
        priority: newTask.priority,
        comments: [],
        subProjectId: newTask.subProjectId ? parseInt(newTask.subProjectId) : (currentSubproject?.id || null),
        subtasks: [],
        recurrence: newTask.recurrence
      };
      setTasks([...tasks, task]);
      setNewTask({
        title: "",
        description: "",
        assignee: "",
        startDate: "",
        endDate: "",
        status: "open",
        priority: "medium",
        subProjectId: "",
        recurrence: {
          isDaily: false,
          isWeekly: false,
          isRecurring: false,
          time: "",
          weekday: 0
        }
      });
      setIsCreateDialogOpen(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    let filteredTasks = tasks;
    
    // Filter by subproject if in subproject context
    if (currentSubproject) {
      filteredTasks = tasks.filter(task => task.subProjectId === currentSubproject.id);
    }
    
    return filteredTasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "secondary";
    }
  };

  const handleTaskUpdate = (updatedTask: any) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    
    // Handle recurrence when task is marked as done
    if (updatedTask.status === 'done' && updatedTask.recurrence) {
      const { isDaily, isWeekly, isRecurring, time, weekday } = updatedTask.recurrence;
      
      if (isDaily || isWeekly || isRecurring) {
        // Create next occurrence
        const nextTask = {
          ...updatedTask,
          id: tasks.length + Math.random(),
          status: 'open',
          timeSpent: 0,
          comments: [],
          subtasks: updatedTask.subtasks.map((st: any) => ({ ...st, status: 'open' }))
        };
        
        // Calculate next dates based on recurrence type
        if (isDaily && time) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          nextTask.startDate = tomorrow.toISOString().split('T')[0];
        } else if (isWeekly && weekday !== undefined) {
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          nextTask.startDate = nextWeek.toISOString().split('T')[0];
        } else if (isRecurring) {
          const nextDay = new Date();
          nextDay.setDate(nextDay.getDate() + 1);
          nextTask.startDate = nextDay.toISOString().split('T')[0];
        }
        
        setTasks(prev => [...prev, nextTask]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => currentSubproject ? navigate(`/projects/${id}/subprojects`) : navigate("/")}
              className="hover:bg-surface"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentSubproject ? "Back to Subprojects" : "Back to Projects"}
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                {currentSubproject ? currentSubproject.name : project?.name}
              </h1>
              <p className="text-muted-foreground text-lg">
                {currentSubproject ? project?.name : project?.description}
              </p>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Select value={newTask.assignee} onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="progress">In Progress</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Subproject Selection */}
                {project?.subProjects && project.subProjects.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="subproject">Subproject</Label>
                    <Select value={newTask.subProjectId} onValueChange={(value) => setNewTask({ ...newTask, subProjectId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subproject (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {project.subProjects.map((subproject: any) => (
                          <SelectItem key={subproject.id} value={subproject.id.toString()}>
                            {subproject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Recurrence Section */}
                <div className="space-y-4 border-t pt-4">
                  <Label className="text-base font-medium">Recurrence</Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDaily"
                        checked={newTask.recurrence.isDaily}
                        onChange={(e) => setNewTask({
                          ...newTask,
                          recurrence: {
                            isDaily: e.target.checked,
                            isWeekly: false,
                            isRecurring: false,
                            time: newTask.recurrence.time,
                            weekday: 0
                          }
                        })}
                        className="rounded"
                      />
                      <Label htmlFor="isDaily">Is this a Daily task?</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isWeekly"
                        checked={newTask.recurrence.isWeekly}
                        onChange={(e) => setNewTask({
                          ...newTask,
                          recurrence: {
                            isDaily: false,
                            isWeekly: e.target.checked,
                            isRecurring: false,
                            time: newTask.recurrence.time,
                            weekday: newTask.recurrence.weekday
                          }
                        })}
                        className="rounded"
                      />
                      <Label htmlFor="isWeekly">Is this a Weekly task?</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        checked={newTask.recurrence.isRecurring}
                        onChange={(e) => setNewTask({
                          ...newTask,
                          recurrence: {
                            isDaily: false,
                            isWeekly: false,
                            isRecurring: e.target.checked,
                            time: newTask.recurrence.time,
                            weekday: 0
                          }
                        })}
                        className="rounded"
                      />
                      <Label htmlFor="isRecurring">Is this a Recurring task?</Label>
                    </div>

                    {(newTask.recurrence.isDaily || newTask.recurrence.isWeekly || newTask.recurrence.isRecurring) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="recurrenceTime">Time</Label>
                          <Input
                            id="recurrenceTime"
                            type="time"
                            value={newTask.recurrence.time}
                            onChange={(e) => setNewTask({
                              ...newTask,
                              recurrence: { ...newTask.recurrence, time: e.target.value }
                            })}
                          />
                        </div>
                        
                        {newTask.recurrence.isWeekly && (
                          <div className="space-y-2">
                            <Label htmlFor="weekday">Day of Week</Label>
                            <Select 
                              value={newTask.recurrence.weekday.toString()} 
                              onValueChange={(value) => setNewTask({
                                ...newTask,
                                recurrence: { ...newTask.recurrence, weekday: parseInt(value) }
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Sunday</SelectItem>
                                <SelectItem value="1">Monday</SelectItem>
                                <SelectItem value="2">Tuesday</SelectItem>
                                <SelectItem value="3">Wednesday</SelectItem>
                                <SelectItem value="4">Thursday</SelectItem>
                                <SelectItem value="5">Friday</SelectItem>
                                <SelectItem value="6">Saturday</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newTask.startDate}
                      onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newTask.endDate}
                      onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask}>
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${column.color}`} />
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                  <Badge variant="outline" className="ml-2">
                    {getTasksByStatus(column.id).length}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 min-h-[400px]">
                {getTasksByStatus(column.id).map((task) => (
                  <Card 
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-border/50 hover:border-primary/20"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {task.title}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Task</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-danger">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.assignee && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {task.assignee.initials}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        
                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.timeSpent}h
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span>•</span>
                              <span>{task.subtasks.filter((st: any) => st.status === 'done').length}/{task.subtasks.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                       <div className="flex items-center justify-between text-xs text-muted-foreground">
                         <div className="flex items-center gap-1">
                           <Calendar className="h-3 w-3" />
                           {task.startDate || "—"}
                         </div>
                         <div>
                           → {task.endDate || "—"}
                         </div>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
};

export default TaskBoard;