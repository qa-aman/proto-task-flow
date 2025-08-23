import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building, Users, CheckCircle, AlertTriangle, Calendar, Clock, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState("overview");

  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      manager: "Sarah Johnson",
      deadline: "2024-02-15",
      status: "active",
      tasks: { total: 24, completed: 12, pending: 8, overdue: 4 },
      progress: 50
    },
    {
      id: 2,
      name: "Mobile App Development",
      manager: "David Chen",
      deadline: "2024-03-20",
      status: "active",
      tasks: { total: 18, completed: 8, pending: 7, overdue: 3 },
      progress: 44
    },
    {
      id: 3,
      name: "Marketing Campaign",
      manager: "Lisa Rodriguez",
      deadline: "2024-01-30",
      status: "planning",
      tasks: { total: 15, completed: 3, pending: 10, overdue: 2 },
      progress: 20
    }
  ];

  const managers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Development Manager",
      initials: "SJ",
      teamSize: 5,
      activeProjects: 2,
      overdueTasks: 4,
      utilization: 92,
      performance: "excellent"
    },
    {
      id: 2,
      name: "David Chen",
      role: "Technical Lead",
      initials: "DC",
      teamSize: 3,
      activeProjects: 1,
      overdueTasks: 3,
      utilization: 88,
      performance: "good"
    },
    {
      id: 3,
      name: "Lisa Rodriguez",
      role: "Marketing Manager",
      initials: "LR",
      teamSize: 4,
      activeProjects: 1,
      overdueTasks: 2,
      utilization: 75,
      performance: "good"
    }
  ];

  const employees = [
    {
      id: 1,
      name: "John Doe",
      role: "Frontend Developer",
      manager: "Sarah Johnson",
      initials: "JD",
      activeTasks: 4,
      completedTasks: 12,
      overdueTasks: 1,
      timeSpent: 38,
      capacity: 40
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Backend Developer",
      manager: "Sarah Johnson",
      initials: "JS",
      activeTasks: 3,
      completedTasks: 15,
      overdueTasks: 2,
      timeSpent: 35,
      capacity: 40
    },
    {
      id: 3,
      name: "Mike Wilson",
      role: "UI/UX Designer",
      manager: "David Chen",
      initials: "MW",
      activeTasks: 2,
      completedTasks: 8,
      overdueTasks: 0,
      timeSpent: 40,
      capacity: 40
    }
  ];

  const totalStats = {
    projects: projects.length,
    activeProjects: projects.filter(p => p.status === "active").length,
    totalTasks: projects.reduce((sum, p) => sum + p.tasks.total, 0),
    completedTasks: projects.reduce((sum, p) => sum + p.tasks.completed, 0),
    pendingTasks: projects.reduce((sum, p) => sum + p.tasks.pending, 0),
    overdueTasks: projects.reduce((sum, p) => sum + p.tasks.overdue, 0),
    totalManagers: managers.length,
    totalEmployees: employees.length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "planning": return "warning";
      case "completed": return "primary";
      case "on-hold": return "secondary";
      default: return "secondary";
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent": return "success";
      case "good": return "primary";
      case "needs-improvement": return "warning";
      default: return "secondary";
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-success";
    if (utilization >= 75) return "text-primary";
    if (utilization >= 60) return "text-warning";
    return "text-danger";
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
              <h1 className="text-4xl font-bold text-foreground">Owner Dashboard</h1>
              <p className="text-muted-foreground text-lg">360° business overview and insights</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/manager-dashboard")}
              className="hover:bg-surface"
            >
              Manager View
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/employee-dashboard")}
              className="hover:bg-surface"
            >
              Employee View
            </Button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold text-foreground">{totalStats.activeProjects}</p>
                  <p className="text-xs text-muted-foreground">of {totalStats.projects} total</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-kanban-done">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{totalStats.completedTasks}</p>
                  <p className="text-xs text-muted-foreground">of {totalStats.totalTasks} total</p>
                </div>
                <div className="h-8 w-8 bg-kanban-done/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-kanban-done" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-kanban-blocked">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{totalStats.overdueTasks}</p>
                  <p className="text-xs text-danger">Needs attention</p>
                </div>
                <div className="h-8 w-8 bg-kanban-blocked/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-kanban-blocked" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Size</p>
                  <p className="text-2xl font-bold text-foreground">{totalStats.totalEmployees}</p>
                  <p className="text-xs text-muted-foreground">{totalStats.totalManagers} managers</p>
                </div>
                <div className="h-8 w-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList className="grid w-full grid-cols-4 lg:w-2/3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="managers">Managers</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Status Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Project Status Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {projects.map((project) => (
                      <div 
                        key={project.id}
                        className="cursor-pointer hover:bg-surface/50 p-3 rounded-lg transition-colors"
                        onClick={() => navigate(`/projects/${project.id}/board`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{project.name}</p>
                            <p className="text-xs text-muted-foreground">Manager: {project.manager}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(project.status) as any} className="text-xs">
                              {project.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(project.deadline).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                          <div className="text-kanban-done">✓ {project.tasks.completed}</div>
                          <div className="text-kanban-progress">⊙ {project.tasks.pending}</div>
                          <div className="text-kanban-blocked">⚠ {project.tasks.overdue}</div>
                        </div>
                        <Progress value={project.progress} className="h-1" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Team Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Team Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-surface rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{Math.round((totalStats.completedTasks / totalStats.totalTasks) * 100)}%</p>
                        <p className="text-xs text-muted-foreground">Task Completion Rate</p>
                      </div>
                      <div className="text-center p-3 bg-surface rounded-lg">
                        <p className="text-2xl font-bold text-foreground">
                          {Math.round(employees.reduce((sum, emp) => sum + (emp.timeSpent / emp.capacity), 0) / employees.length * 100)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Team Utilization</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">Manager Performance</h4>
                      {managers.map((manager) => (
                        <div 
                          key={manager.id}
                          className="cursor-pointer hover:bg-surface/50 p-3 rounded-lg transition-colors"
                          onClick={() => navigate("/manager-dashboard")}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {manager.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{manager.name}</p>
                                <p className="text-xs text-muted-foreground">{manager.teamSize} team members</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getPerformanceColor(manager.performance) as any} className="text-xs">
                                {manager.performance}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {manager.overdueTasks} overdue
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {projects.map((project) => (
                  <Card 
                    key={project.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => navigate(`/projects/${project.id}/board`)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">{project.name}</CardTitle>
                          <p className="text-muted-foreground">Managed by {project.manager}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(project.status) as any}>
                            {project.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {new Date(project.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-kanban-done">{project.tasks.completed}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-kanban-progress">{project.tasks.pending}</p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-kanban-blocked">{project.tasks.overdue}</p>
                          <p className="text-xs text-muted-foreground">Overdue</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{project.tasks.total}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="managers" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {managers.map((manager) => (
                  <Card 
                    key={manager.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => navigate("/manager-dashboard")}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {manager.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{manager.name}</CardTitle>
                          <p className="text-muted-foreground">{manager.role}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{manager.teamSize}</p>
                          <p className="text-xs text-muted-foreground">Team Size</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">{manager.activeProjects}</p>
                          <p className="text-xs text-muted-foreground">Projects</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-kanban-blocked">{manager.overdueTasks}</p>
                          <p className="text-xs text-muted-foreground">Overdue</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant={getPerformanceColor(manager.performance) as any}>
                          {manager.performance}
                        </Badge>
                        <div className={`text-sm font-medium ${getUtilizationColor(manager.utilization)}`}>
                          {manager.utilization}% utilization
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="employees" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => {
                  const utilization = (employee.timeSpent / employee.capacity) * 100;
                  return (
                    <Card 
                      key={employee.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200"
                      onClick={() => navigate("/employee-dashboard")}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {employee.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{employee.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{employee.role}</p>
                            <p className="text-xs text-muted-foreground">Reports to {employee.manager}</p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 bg-surface rounded">
                            <p className="text-lg font-bold text-kanban-progress">{employee.activeTasks}</p>
                            <p className="text-xs text-muted-foreground">Active</p>
                          </div>
                          <div className="text-center p-2 bg-surface rounded">
                            <p className="text-lg font-bold text-kanban-done">{employee.completedTasks}</p>
                            <p className="text-xs text-muted-foreground">Done</p>
                          </div>
                        </div>
                        
                        {employee.overdueTasks > 0 && (
                          <div className="text-center p-2 bg-kanban-blocked/10 rounded">
                            <p className="text-sm font-bold text-kanban-blocked">{employee.overdueTasks} overdue tasks</p>
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Weekly Hours</span>
                            <span className="font-medium">{employee.timeSpent}h / {employee.capacity}h</span>
                          </div>
                          <Progress value={utilization} className="h-1" />
                          <p className={`text-xs ${getUtilizationColor(utilization)}`}>
                            {Math.round(utilization)}% utilization
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;