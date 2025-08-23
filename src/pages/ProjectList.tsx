import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, User, Calendar, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Website Redesign",
      owner: { name: "Sarah Johnson", avatar: "/avatars/sarah.jpg", initials: "SJ" },
      members: [
        { name: "John Doe", initials: "JD" },
        { name: "Jane Smith", initials: "JS" },
        { name: "Mike Wilson", initials: "MW" }
      ],
      status: "active",
      tasks: { total: 24, completed: 12 },
      deadline: "2024-02-15"
    },
    {
      id: 2,
      name: "Mobile App Development",
      owner: { name: "David Chen", avatar: "/avatars/david.jpg", initials: "DC" },
      members: [
        { name: "Emma Brown", initials: "EB" },
        { name: "Alex Turner", initials: "AT" }
      ],
      status: "active",
      tasks: { total: 18, completed: 8 },
      deadline: "2024-03-20"
    },
    {
      id: 3,
      name: "Marketing Campaign",
      owner: { name: "Lisa Rodriguez", avatar: "/avatars/lisa.jpg", initials: "LR" },
      members: [
        { name: "Tom Anderson", initials: "TA" },
        { name: "Sophie Lee", initials: "SL" },
        { name: "Chris Martin", initials: "CM" },
        { name: "Anna Davis", initials: "AD" }
      ],
      status: "planning",
      tasks: { total: 15, completed: 3 },
      deadline: "2024-01-30"
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  const handleCreateProject = () => {
    if (newProject.name.trim()) {
      const project = {
        id: projects.length + 1,
        name: newProject.name,
        owner: { name: "Current User", initials: "CU", avatar: "" },
        members: [],
        status: "planning",
        tasks: { total: 0, completed: 0 },
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setProjects([...projects, project]);
      setNewProject({ name: "", description: "" });
      setIsCreateDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "planning": return "warning";
      case "completed": return "primary";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Projects</h1>
            <p className="text-muted-foreground text-lg">Manage your projects and track progress</p>
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/employee-dashboard")}
              className="hover:bg-surface"
            >
              <User className="mr-2 h-4 w-4" />
              Employee View
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/manager-dashboard")}
              className="hover:bg-surface"
            >
              <Users className="mr-2 h-4 w-4" />
              Manager View
            </Button>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Enter project description"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject}>
                      Create Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-surface rounded-full flex items-center justify-center">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">Get started by creating your first project</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-border/50 hover:border-primary/20"
                onClick={() => navigate(`/projects/${project.id}/board`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getStatusColor(project.status) as any} className="capitalize">
                          {project.status}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(project.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem>Manage Members</DropdownMenuItem>
                        <DropdownMenuItem className="text-danger">Delete Project</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Owner */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={project.owner.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {project.owner.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{project.owner.name}</p>
                      <p className="text-xs text-muted-foreground">Project Owner</p>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Team Members ({project.members.length})</p>
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 5).map((member, index) => (
                        <Avatar key={index} className="h-7 w-7 border-2 border-card">
                          <AvatarFallback className="bg-surface text-surface-foreground text-xs">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 5 && (
                        <div className="h-7 w-7 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">+{project.members.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {project.tasks.completed}/{project.tasks.total} tasks
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${project.tasks.total > 0 ? (project.tasks.completed / project.tasks.total) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;