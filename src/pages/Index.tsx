import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-background to-muted">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            ITS
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Integrated Task and Time Management System
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <CheckSquare className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Task Management</CardTitle>
              <CardDescription className="text-base">
                Organize projects, create tasks, track progress with Kanban boards
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild size="lg" className="w-full">
                <Link to="/projects">
                  Enter Task Management
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Clock className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Time Tracker</CardTitle>
              <CardDescription className="text-base">
                Log time entries, generate reports, track productivity across projects
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild variant="secondary" size="lg" className="w-full">
                <Link to="/timesheet">
                  Enter Time Tracker
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;