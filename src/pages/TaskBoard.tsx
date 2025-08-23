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
  const { id } = useParams();
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
    priority: "medium"
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
      comments: []
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
      comments: []
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
      comments: []
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
      comments: []
    }
  ]);

  const project = {
    id: parseInt(id || "1"),
    name: "Website Redesign",
    description: "Complete redesign of company website with modern UI/UX"
  };

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
        comments: []
      };
      setTasks([...tasks, task]);
      setNewTask({
        title: "",
        description: "",
        assignee: "",
        startDate: "",
        endDate: "",
        status: "open",
        priority: "medium"
      });
      setIsCreateDialogOpen(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
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
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="hover:bg-surface"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground">{project.name}</h1>
              <p className="text-muted-foreground text-lg">{project.description}</p>
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
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.timeSpent}h
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