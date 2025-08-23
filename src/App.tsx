import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProjectList from "./pages/ProjectList";
import SubprojectList from "./pages/SubprojectList";
import TaskBoard from "./pages/TaskBoard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import TimesheetMemberDashboard from "./pages/timesheet/TimesheetMemberDashboard";
import TimesheetDailyLog from "./pages/timesheet/TimesheetDailyLog";
import TimesheetManagerDashboard from "./pages/timesheet/TimesheetManagerDashboard";
import TimesheetOwnerDashboard from "./pages/timesheet/TimesheetOwnerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:id/subprojects" element={<SubprojectList />} />
          <Route path="/projects/:id/board" element={<TaskBoard />} />
          <Route path="/projects/:id/subprojects/:sid/board" element={<TaskBoard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/timesheet" element={<TimesheetMemberDashboard />} />
          <Route path="/timesheet/log" element={<TimesheetDailyLog />} />
          <Route path="/timesheet/manager" element={<TimesheetManagerDashboard />} />
          <Route path="/timesheet/owner" element={<TimesheetOwnerDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
