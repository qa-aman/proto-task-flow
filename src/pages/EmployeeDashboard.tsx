import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Calendar, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  
  const currentUser = {
    name: "Sarah Johnson",
    initials: "SJ",
    role: "Frontend Developer",
    avatar: ""
  };

  const myTasks = [
    {
      id: 1,
      title: "Design Homepage Wireframes",
      project: "Website Redesign",
      status: "progress",
      priority: "high",
      deadline: "2024-01-20",
      timeSpent: 8.5,
      estimatedTime: 12
    },
    {
      id: 2,
      title: "Implement User Dashboard",
      project: "Mobile App Development",
      status: "open",
      priority: "medium",
      deadline: "2024-01-25",
      timeSpent: 0,
      estimatedTime: 16
    },
    {
      id: 3,
      title: "Fix Login Bug",
      project: "Website Redesign",
      status: "blocked",
      priority: "high",
      deadline: "2024-01-18",
      timeSpent: 3.5,
      estimatedTime: 6
    },
    {
      id: 4,
      title: "Code Review - API Integration",
      project: "Mobile App Development",
      status: "done",
      priority: "low",
      deadline: "2024-01-15",
      timeSpent: 2.0,
      estimatedTime: 2
    }
  ];

  const timeData = {
    day: { logged: 6.5, target: 8, tasks: 3 },
    week: { logged: 28.5, target: 40, tasks: 12 },
    month: { logged: 120, target: 160, tasks: 45 }
  };

  const getStatusStats = () => {
    const stats = {
      open: myTasks.filter(t => t.status === "open").length,
      progress: myTasks.filter(t => t.status === "progress").length,
      blocked: myTasks.filter(t => t.status === "blocked").length,
      done: myTasks.filter(t => t.status === "done").length
    };
    return stats;
  };

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

  const stats = getStatusStats();
  const currentTimeData = timeData[selectedPeriod as keyof typeof timeData];
  const completionRate = currentTimeData.target > 0 ? (currentTimeData.logged / currentTimeData.target) * 100 : 0;

  const handleTaskClick = (task: any) => {
    // Navigate to the project board and highlight the task
    navigate(`/projects/${task.project === "Website Redesign" ? "1" : "2"}/board`);
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
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-bold text-foreground">{currentUser.name}</h1>
                <p className="text-muted-foreground text-lg">{currentUser.role}</p>
              </div>
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
              onClick={() => navigate("/manager-dashboard")}
              className="hover:bg-surface"
            >
              Manager View
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-kanban-open">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{stats.open}</p>
                </div>
                <div className="h-8 w-8 bg-kanban-open/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-kanban-open" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-kanban-progress">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">{stats.progress}</p>
                </div>
                <div className="h-8 w-8 bg-kanban-progress/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-kanban-progress" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-kanban-blocked">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Blocked</p>
                  <p className="text-2xl font-bold text-foreground">{stats.blocked}</p>
                </div>
                <div className="h-8 w-8 bg-kanban-blocked/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-kanban-blocked" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-kanban-done">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{stats.done}</p>
                </div>
                <div className="h-8 w-8 bg-kanban-done/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-kanban-done" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Time Tracking */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
                
                <TabsContent value={selectedPeriod} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time Logged</span>
                      <span className="font-medium">
                        {currentTimeData.logged}h / {currentTimeData.target}h
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(completionRate)}% of target achieved
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tasks Worked On</span>
                      <span className="text-sm font-medium">{currentTimeData.tasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. per Task</span>
                      <span className="text-sm font-medium">
                        {(currentTimeData.logged / currentTimeData.tasks).toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* My Tasks */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                My Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myTasks.map((task) => (
                  <Card 
                    key={task.id}
                    className={`cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 ${getStatusColor(task.status)} hover:border-primary/20`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{task.project}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                            {task.priority}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              task.status === "open" ? "border-kanban-open text-kanban-open" :
                              task.status === "progress" ? "border-kanban-progress text-kanban-progress" :
                              task.status === "blocked" ? "border-kanban-blocked text-kanban-blocked" :
                              "border-kanban-done text-kanban-done"
                            }`}
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.timeSpent}h / {task.estimatedTime}h
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {Math.round((task.timeSpent / task.estimatedTime) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(task.timeSpent / task.estimatedTime) * 100} 
                          className="h-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {myTasks.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No tasks assigned</h3>
                  <p className="text-muted-foreground">You don't have any tasks assigned yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;