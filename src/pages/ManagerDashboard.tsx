import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, AlertTriangle, Clock, TrendingUp, Calendar, User, CheckCircle, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  
  const [selectedView, setSelectedView] = useState("overview");
  
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      initials: "SJ",
      role: "Frontend Developer",
      capacity: 40,
      logged: 38,
      activeTasks: 3,
      completedTasks: 12,
      avatar: ""
    },
    {
      id: 2,
      name: "John Doe",
      initials: "JD",
      role: "Backend Developer",
      capacity: 40,
      logged: 42,
      activeTasks: 4,
      completedTasks: 8,
      avatar: ""
    },
    {
      id: 3,
      name: "Jane Smith",
      initials: "JS",
      role: "Full Stack Developer",
      capacity: 40,
      logged: 35,
      activeTasks: 2,
      completedTasks: 15,
      avatar: ""
    },
    {
      id: 4,
      name: "Mike Wilson",
      initials: "MW",
      role: "UI/UX Designer",
      capacity: 40,
      logged: 40,
      activeTasks: 3,
      completedTasks: 10,
      avatar: ""
    }
  ];

  const teamTasks = [
    {
      id: 1,
      title: "Design Homepage Wireframes",
      project: "Website Redesign",
      assignee: "Sarah Johnson",
      status: "progress",
      priority: "high",
      deadline: "2024-01-20",
      timeSpent: 8.5,
      estimatedTime: 12,
      isOverdue: false
    },
    {
      id: 2,
      title: "Database Migration",
      project: "Website Redesign",
      assignee: "Jane Smith",
      status: "blocked",
      priority: "high",
      deadline: "2024-01-15",
      timeSpent: 6.0,
      estimatedTime: 10,
      isOverdue: true
    },
    {
      id: 3,
      title: "API Integration",
      project: "Mobile App Development",
      assignee: "John Doe",
      status: "progress",
      priority: "medium",
      deadline: "2024-01-25",
      timeSpent: 15.0,
      estimatedTime: 20,
      isOverdue: false
    },
    {
      id: 4,
      title: "User Testing Preparation",
      project: "Mobile App Development",
      assignee: "Mike Wilson",
      status: "open",
      priority: "low",
      deadline: "2024-01-30",
      timeSpent: 0,
      estimatedTime: 8,
      isOverdue: false
    }
  ];

  const overdueTasks = teamTasks.filter(task => task.isOverdue);
  const blockedTasks = teamTasks.filter(task => task.status === "blocked");
  
  const teamStats = {
    totalMembers: teamMembers.length,
    totalCapacity: teamMembers.reduce((sum, member) => sum + member.capacity, 0),
    totalLogged: teamMembers.reduce((sum, member) => sum + member.logged, 0),
    activeTasks: teamMembers.reduce((sum, member) => sum + member.activeTasks, 0),
    completedTasks: teamMembers.reduce((sum, member) => sum + member.completedTasks, 0)
  };

  const utilizationRate = (teamStats.totalLogged / teamStats.totalCapacity) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "border-l-kanban-open";
      case "progress": return "border-l-kanban-progress";
      case "blocked": return "border-l-kanban-blocked";
      case "done": return "border-l-kanban-done";
      default: return "border-l-muted";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "secondary";
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 95) return "text-success";
    if (utilization >= 80) return "text-warning";
    return "text-danger";
  };

  const handleTaskClick = (task: any) => {
    navigate(`/projects/${task.project === "Website Redesign" ? "1" : "2"}/board`);
  };

  const handleMemberClick = (member: any) => {
    navigate("/employee-dashboard");
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
              <h1 className="text-4xl font-bold text-foreground">Manager Dashboard</h1>
              <p className="text-muted-foreground text-lg">Team oversight and performance tracking</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/owner-dashboard")}
              className="hover:bg-surface"
            >
              Owner View
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold text-foreground">{teamStats.totalMembers}</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-kanban-blocked">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{overdueTasks.length}</p>
                </div>
                <div className="h-8 w-8 bg-kanban-blocked/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-kanban-blocked" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Utilization</p>
                  <p className={`text-2xl font-bold ${getUtilizationColor(utilizationRate)}`}>
                    {Math.round(utilizationRate)}%
                  </p>
                </div>
                <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-kanban-done">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{teamStats.completedTasks}</p>
                </div>
                <div className="h-8 w-8 bg-kanban-done/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-kanban-done" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList className="grid w-full grid-cols-4 lg:w-2/3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="project-board">Project Board</TabsTrigger>
            <TabsTrigger value="member-board">Member Board</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Team Utilization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Team Utilization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {teamMembers.map((member) => {
                      const utilization = (member.logged / member.capacity) * 100;
                      return (
                        <div 
                          key={member.id} 
                          className="cursor-pointer hover:bg-surface/50 p-3 rounded-lg transition-colors"
                          onClick={() => handleMemberClick(member)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {member.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{member.logged}h / {member.capacity}h</p>
                              <p className={`text-xs ${getUtilizationColor(utilization)}`}>
                                {Math.round(utilization)}%
                              </p>
                            </div>
                          </div>
                          <Progress value={utilization} className="h-1" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Priority Issues */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Priority Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">Overdue Tasks</h4>
                      {overdueTasks.map((task) => (
                        <Card 
                          key={task.id}
                          className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-kanban-blocked"
                          onClick={() => handleTaskClick(task)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-sm">{task.title}</p>
                                <p className="text-xs text-muted-foreground">{task.assignee}</p>
                              </div>
                              <Badge variant="danger" className="text-xs">
                                Overdue
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">Blocked Tasks</h4>
                      {blockedTasks.map((task) => (
                        <Card 
                          key={task.id}
                          className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-kanban-blocked"
                          onClick={() => handleTaskClick(task)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-sm">{task.title}</p>
                                <p className="text-xs text-muted-foreground">{task.assignee}</p>
                              </div>
                              <Badge variant="warning" className="text-xs">
                                Blocked
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {overdueTasks.length === 0 && blockedTasks.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
                        <p className="text-sm text-muted-foreground">No priority issues!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamMembers.map((member) => {
                  const utilization = (member.logged / member.capacity) * 100;
                  return (
                    <Card 
                      key={member.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200"
                      onClick={() => handleMemberClick(member)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{member.name}</CardTitle>
                            <p className="text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{member.activeTasks}</p>
                            <p className="text-xs text-muted-foreground">Active Tasks</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{member.completedTasks}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Weekly Hours</span>
                            <span className="font-medium">
                              {member.logged}h / {member.capacity}h
                            </span>
                          </div>
                          <Progress value={utilization} className="h-2" />
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

            <TabsContent value="project-board" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {["Website Redesign", "Mobile App Development"].map((projectName) => {
                  const projectTasks = teamTasks.filter(task => task.project === projectName);
                  return (
                    <Card key={projectName}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          {projectName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {["open", "progress", "blocked", "done"].map((status) => {
                            const statusTasks = projectTasks.filter(task => task.status === status);
                            return (
                              <div key={status} className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full bg-kanban-${status}`} />
                                  <h4 className="font-medium capitalize">{status.replace("-", " ")}</h4>
                                  <Badge variant="outline">{statusTasks.length}</Badge>
                                </div>
                                <div className="space-y-2">
                                  {statusTasks.map((task) => (
                                    <Card 
                                      key={task.id}
                                      className="cursor-pointer hover:shadow-sm transition-all duration-200 text-xs"
                                      onClick={() => handleTaskClick(task)}
                                    >
                                      <CardContent className="p-3">
                                        <p className="font-medium mb-1">{task.title}</p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                          <span>{task.assignee}</span>
                                          <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                                            {task.priority}
                                          </Badge>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="member-board" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {teamMembers.map((member) => {
                  const memberTasks = teamTasks.filter(task => task.assignee === member.name);
                  return (
                    <Card key={member.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{member.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <div className="ml-auto">
                            <Badge variant="outline">{memberTasks.length} tasks</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {["open", "progress", "blocked", "done"].map((status) => {
                            const statusTasks = memberTasks.filter(task => task.status === status);
                            return (
                              <div key={status} className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full bg-kanban-${status}`} />
                                  <h4 className="font-medium capitalize text-sm">{status.replace("-", " ")}</h4>
                                  <Badge variant="outline" className="text-xs">{statusTasks.length}</Badge>
                                </div>
                                <div className="space-y-2">
                                  {statusTasks.map((task) => (
                                    <Card 
                                      key={task.id}
                                      className="cursor-pointer hover:shadow-sm transition-all duration-200 text-xs"
                                      onClick={() => handleTaskClick(task)}
                                    >
                                      <CardContent className="p-2">
                                        <p className="font-medium mb-1 text-xs">{task.title}</p>
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-muted-foreground">{task.project}</span>
                                          <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                                            {task.priority}
                                          </Badge>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamMembers.map((member) => {
                  const utilization = (member.logged / member.capacity) * 100;
                  return (
                    <Card 
                      key={member.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200"
                      onClick={() => handleMemberClick(member)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{member.name}</CardTitle>
                            <p className="text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{member.activeTasks}</p>
                            <p className="text-xs text-muted-foreground">Active Tasks</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{member.completedTasks}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Weekly Hours</span>
                            <span className="font-medium">
                              {member.logged}h / {member.capacity}h
                            </span>
                          </div>
                          <Progress value={utilization} className="h-2" />
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

export default ManagerDashboard;