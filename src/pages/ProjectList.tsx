import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, User, Calendar, MoreHorizontal, Building, FolderPlus, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const ProjectList = () => {
  const navigate = useNavigate();
  
  // Load projects from localStorage or use default data
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem("tm_projects");
    if (savedProjects) {
      return JSON.parse(savedProjects);
    }
    return [
      {
      id: 1,
      name: "Website Redesign",
      description: "Complete redesign of company website with modern UI/UX",
      owner: { name: "Sarah Johnson", avatar: "/avatars/sarah.jpg", initials: "SJ" },
      members: [
        { id: 1, name: "John Doe", initials: "JD" },
        { id: 2, name: "Jane Smith", initials: "JS" },
        { id: 3, name: "Mike Wilson", initials: "MW" }
      ],
      status: "active",
      tasks: { total: 24, completed: 12 },
      deadline: "2024-02-15",
      subProjects: [
        { id: 11, name: "Frontend Redesign", status: "active", tasks: { total: 12, completed: 8 } },
        { id: 12, name: "Backend API", status: "planning", tasks: { total: 12, completed: 4 } }
      ]
    },
    {
      id: 2,
      name: "Mobile App Development",
      description: "Native mobile application for iOS and Android",
      owner: { name: "David Chen", avatar: "/avatars/david.jpg", initials: "DC" },
      members: [
        { id: 4, name: "Emma Brown", initials: "EB" },
        { id: 5, name: "Alex Turner", initials: "AT" }
      ],
      status: "active",
      tasks: { total: 18, completed: 8 },
      deadline: "2024-03-20",
      subProjects: [
        { id: 21, name: "iOS App", status: "active", tasks: { total: 9, completed: 4 } },
        { id: 22, name: "Android App", status: "active", tasks: { total: 9, completed: 4 } }
      ]
    },
    {
      id: 3,
      name: "Marketing Campaign",
      description: "Q1 digital marketing campaign for product launch",
      owner: { name: "Lisa Rodriguez", avatar: "/avatars/lisa.jpg", initials: "LR" },
      members: [
        { id: 6, name: "Tom Anderson", initials: "TA" },
        { id: 7, name: "Sophie Lee", initials: "SL" },
        { id: 8, name: "Chris Martin", initials: "CM" },
        { id: 9, name: "Anna Davis", initials: "AD" }
      ],
      status: "planning",
      tasks: { total: 15, completed: 3 },
      deadline: "2024-01-30",
      subProjects: []
    }
    ];
  });

  // Save to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem("tm_projects", JSON.stringify(projects));
  }, [projects]);

  const teamMembers = [
    { id: 1, name: "John Doe", initials: "JD", role: "Frontend Developer" },
    { id: 2, name: "Jane Smith", initials: "JS", role: "Backend Developer" },
    { id: 3, name: "Mike Wilson", initials: "MW", role: "UI/UX Designer" },
    { id: 4, name: "Emma Brown", initials: "EB", role: "Mobile Developer" },
    { id: 5, name: "Alex Turner", initials: "AT", role: "QA Engineer" },
    { id: 6, name: "Tom Anderson", initials: "TA", role: "Marketing Specialist" },
    { id: 7, name: "Sophie Lee", initials: "SL", role: "Content Creator" },
    { id: 8, name: "Chris Martin", initials: "CM", role: "SEO Specialist" },
    { id: 9, name: "Anna Davis", initials: "AD", role: "Social Media Manager" }
  ];

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ 
    name: "", 
    description: "", 
    deadline: "",
    members: [] as string[]
  });

  const handleCreateProject = () => {
    if (newProject.name.trim()) {
      const selectedMembers = teamMembers.filter(member => 
        newProject.members.includes(member.id.toString())
      );
      const project = {
        id: projects.length + 1,
        name: newProject.name,
        description: newProject.description,
        owner: { name: "Current User", initials: "CU", avatar: "" },
        members: selectedMembers,
        status: "planning",
        tasks: { total: 0, completed: 0 },
        deadline: newProject.deadline || "",
        subProjects: []
      };
      setProjects([...projects, project]);
      setNewProject({ name: "", description: "", deadline: "", members: [] });
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
              onClick={() => navigate("/owner-dashboard")}
              className="hover:bg-surface"
            >
              <Crown className="mr-2 h-4 w-4" />
              Owner View
            </Button>
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
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newProject.deadline}
                      onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Team Members</Label>
                    <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={newProject.members.includes(member.id.toString())}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewProject({
                                  ...newProject,
                                  members: [...newProject.members, member.id.toString()]
                                });
                              } else {
                                setNewProject({
                                  ...newProject,
                                  members: newProject.members.filter(id => id !== member.id.toString())
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`member-${member.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {member.name} - {member.role}
                          </label>
                        </div>
                      ))}
                    </div>
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
                onClick={() => navigate(`/projects/${project.id}/subprojects`)}
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
                          {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}
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

                  {/* Sub-projects */}
                  {project.subProjects && project.subProjects.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sub-projects ({project.subProjects.length})</p>
                      <div className="space-y-1">
                        {project.subProjects.map((subProject) => (
                          <div key={subProject.id} className="flex items-center justify-between text-xs p-2 bg-surface rounded">
                            <span className="font-medium">{subProject.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(subProject.status) as any} className="text-xs">
                                {subProject.status}
                              </Badge>
                              <span className="text-muted-foreground">
                                {subProject.tasks.completed}/{subProject.tasks.total}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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