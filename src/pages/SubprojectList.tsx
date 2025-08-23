import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, Users, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SubprojectList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSubproject, setNewSubproject] = useState({
    name: "",
    description: "",
    deadline: "",
    members: [] as string[]
  });

  // Load project from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem("tm_projects");
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const foundProject = projects.find((p: any) => p.id === parseInt(id || "1"));
      if (foundProject) {
        // Initialize subprojects if not exists
        if (!foundProject.subProjects) {
          foundProject.subProjects = [];
        }
        setProject(foundProject);
      }
    }
  }, [id]);

  const teamMembers = [
    { id: 1, name: "John Doe", initials: "JD", role: "Frontend Developer" },
    { id: 2, name: "Jane Smith", initials: "JS", role: "Backend Developer" },
    { id: 3, name: "Mike Wilson", initials: "MW", role: "UI/UX Designer" },
    { id: 4, name: "Emma Brown", initials: "EB", role: "Mobile Developer" },
    { id: 5, name: "Alex Turner", initials: "AT", role: "QA Engineer" }
  ];

  const handleCreateSubproject = () => {
    if (newSubproject.name.trim() && project) {
      const selectedMembers = teamMembers.filter(member => 
        newSubproject.members.includes(member.id.toString())
      );
      
      const subproject = {
        id: Date.now(),
        name: newSubproject.name,
        description: newSubproject.description,
        deadline: newSubproject.deadline || null,
        members: selectedMembers,
        status: "planning",
        tasks: { total: 0, completed: 0 }
      };

      const updatedProject = {
        ...project,
        subProjects: [...(project.subProjects || []), subproject]
      };
      
      setProject(updatedProject);
      
      // Update localStorage
      const savedProjects = localStorage.getItem("tm_projects");
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const updatedProjects = projects.map((p: any) => 
          p.id === project.id ? updatedProject : p
        );
        localStorage.setItem("tm_projects", JSON.stringify(updatedProjects));
      }

      setNewSubproject({ name: "", description: "", deadline: "", members: [] });
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

  if (!project) {
    return <div>Loading...</div>;
  }

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
              <p className="text-muted-foreground text-lg">Subprojects</p>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Subproject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Subproject</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Subproject Name</Label>
                  <Input
                    id="name"
                    value={newSubproject.name}
                    onChange={(e) => setNewSubproject({ ...newSubproject, name: e.target.value })}
                    placeholder="Enter subproject name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSubproject.description}
                    onChange={(e) => setNewSubproject({ ...newSubproject, description: e.target.value })}
                    placeholder="Enter subproject description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newSubproject.deadline}
                    onChange={(e) => setNewSubproject({ ...newSubproject, deadline: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Team Members</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={newSubproject.members.includes(member.id.toString())}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewSubproject({
                                ...newSubproject,
                                members: [...newSubproject.members, member.id.toString()]
                              });
                            } else {
                              setNewSubproject({
                                ...newSubproject,
                                members: newSubproject.members.filter(id => id !== member.id.toString())
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
                  <Button onClick={handleCreateSubproject}>
                    Create Subproject
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subprojects Grid */}
        {!project.subProjects || project.subProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-surface rounded-full flex items-center justify-center">
              <FolderPlus className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No subprojects yet</h3>
            <p className="text-muted-foreground mb-6">Break down this project into manageable subprojects</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subproject
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.subProjects.map((subproject: any) => (
              <Card 
                key={subproject.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-border/50 hover:border-primary/20"
                onClick={() => navigate(`/projects/${project.id}/subprojects/${subproject.id}/board`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {subproject.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getStatusColor(subproject.status) as any} className="capitalize">
                          {subproject.status}
                        </Badge>
                        {subproject.deadline && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(subproject.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {subproject.description && (
                    <p className="text-sm text-muted-foreground">{subproject.description}</p>
                  )}

                  {/* Team Members */}
                  {subproject.members && subproject.members.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Team Members ({subproject.members.length})</p>
                      <div className="flex -space-x-2">
                        {subproject.members.slice(0, 4).map((member: any, index: number) => (
                          <Avatar key={index} className="h-7 w-7 border-2 border-card">
                            <AvatarFallback className="bg-surface text-surface-foreground text-xs">
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {subproject.members.length > 4 && (
                          <div className="h-7 w-7 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{subproject.members.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {subproject.tasks.completed}/{subproject.tasks.total} tasks
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${subproject.tasks.total > 0 ? (subproject.tasks.completed / subproject.tasks.total) * 100 : 0}%` 
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

export default SubprojectList;