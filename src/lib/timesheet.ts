export interface TimeEntry {
  id: number;
  userId: number;
  role: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationSeconds: number;
  projectId: number;
  subprojectId?: number;
  taskId?: number;
  subtaskId?: number;
  notes: string;
  status: 'submitted' | 'approved' | 'requested_changes';
  billable: 'billable' | 'non_billable';
}

export interface TimesheetUser {
  id: number;
  name: string;
  role: 'owner' | 'manager' | 'team_member';
}

export interface TimesheetProject {
  id: number;
  name: string;
  subProjects?: TimesheetSubproject[];
}

export interface TimesheetSubproject {
  id: number;
  name: string;
  tasks?: TimesheetTask[];
}

export interface TimesheetTask {
  id: number;
  title: string;
  subtasks?: TimesheetSubtask[];
}

export interface TimesheetSubtask {
  id: number;
  title: string;
}

const STORAGE_KEY = 'its_timesheet_entries';
const USERS_KEY = 'its_timesheet_users';
const PROJECTS_KEY = 'its_timesheet_projects';

export const computeDuration = (start: string, end: string): number => {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const startSeconds = startHour * 3600 + startMin * 60;
  const endSeconds = endHour * 3600 + endMin * 60;
  
  return Math.max(0, endSeconds - startSeconds);
};

export const detectOverlaps = (entries: TimeEntry[], newEntry: Omit<TimeEntry, 'id'>): boolean => {
  const newStart = computeSeconds(newEntry.startTime);
  const newEnd = computeSeconds(newEntry.endTime);
  
  return entries.some(entry => {
    if (entry.userId !== newEntry.userId || entry.date !== newEntry.date) return false;
    
    const existingStart = computeSeconds(entry.startTime);
    const existingEnd = computeSeconds(entry.endTime);
    
    // Check if [newStart, newEnd) overlaps with [existingStart, existingEnd)
    return newStart < existingEnd && newEnd > existingStart;
  });
};

const computeSeconds = (time: string): number => {
  const [hour, min] = time.split(':').map(Number);
  return hour * 3600 + min * 60;
};

export const isLockedDay = (date: string): boolean => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  
  // Weekend (Saturday = 6, Sunday = 0)
  if (dayOfWeek === 0 || dayOfWeek === 6) return true;
  
  // Sample holidays and org holiday (Wednesday for demo)
  const holidays = ['2025-01-01', '2025-12-25', '2025-01-22']; // Wednesday as org holiday
  return holidays.includes(date);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const hhmmToSeconds = (hhmm: string): number => {
  if (!hhmm || !hhmm.includes(':')) return 0;
  const [hours, minutes] = hhmm.split(':').map(Number);
  return (hours || 0) * 3600 + (minutes || 0) * 60;
};

export const secondsToHHMM = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const clearUserEntriesForDate = (userId: number, date: string): void => {
  const entries = loadTimeEntries();
  const filteredEntries = entries.filter(e => !(e.userId === userId && e.date === date));
  saveTimeEntries(filteredEntries);
};

export const saveTimeEntries = (entries: TimeEntry[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const loadTimeEntries = (): TimeEntry[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTimeEntry = (entry: Omit<TimeEntry, 'id'>): void => {
  const entries = loadTimeEntries();
  const newEntry = { ...entry, id: Date.now() };
  entries.push(newEntry);
  saveTimeEntries(entries);
};

export const getUsers = (): TimesheetUser[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) return JSON.parse(stored);
  
  // Default users
  const defaultUsers: TimesheetUser[] = [
    { id: 1, name: 'Alice Johnson', role: 'owner' },
    { id: 2, name: 'Bob Smith', role: 'manager' },
    { id: 3, name: 'Carol Davis', role: 'team_member' },
    { id: 4, name: 'David Wilson', role: 'team_member' },
    { id: 5, name: 'Eva Brown', role: 'team_member' },
  ];
  
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const getTimesheetProjects = (): TimesheetProject[] => {
  // Try to read from Task Management first
  const tmProjects = localStorage.getItem('tm_projects');
  if (tmProjects) {
    const parsed = JSON.parse(tmProjects);
    return parsed.map((p: any) => ({
      id: p.id,
      name: p.name,
      subProjects: p.subProjects?.map((sp: any) => ({
        id: sp.id,
        name: sp.name,
        tasks: [] // We'll load tasks separately if needed
      }))
    }));
  }
  
  // Fallback to timesheet-specific projects
  const stored = localStorage.getItem(PROJECTS_KEY);
  if (stored) return JSON.parse(stored);
  
  // Default demo projects
  const defaultProjects: TimesheetProject[] = [
    {
      id: 1,
      name: 'Website Redesign',
      subProjects: [
        {
          id: 1,
          name: 'Frontend Development',
          tasks: [
            { id: 1, title: 'Create React Components', subtasks: [{ id: 1, title: 'Header Component' }] },
            { id: 2, title: 'Implement Responsive Design' }
          ]
        },
        {
          id: 2,
          name: 'Backend API',
          tasks: [
            { id: 3, title: 'User Authentication' },
            { id: 4, title: 'Database Schema' }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Mobile App',
      subProjects: [
        {
          id: 3,
          name: 'iOS Development',
          tasks: [{ id: 5, title: 'UI Implementation' }]
        }
      ]
    },
    {
      id: 3,
      name: 'Marketing Campaign',
      subProjects: []
    }
  ];
  
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(defaultProjects));
  return defaultProjects;
};

export const getCurrentUser = (): TimesheetUser => {
  // For demo, return first team member
  return getUsers().find(u => u.role === 'team_member') || getUsers()[0];
};

export const seedDemoData = (): void => {
  const entries = loadTimeEntries();
  if (entries.length > 0) return; // Already has data
  
  const users = getUsers();
  const projects = getTimesheetProjects();
  
  const demoEntries: TimeEntry[] = [
    // Today's entries for demo
    {
      id: 1,
      userId: 3,
      role: 'team_member',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '12:00',
      durationSeconds: 10800,
      projectId: 1,
      subprojectId: 1,
      taskId: 1,
      notes: 'Worked on header component design',
      status: 'submitted',
      billable: 'billable'
    },
    {
      id: 2,
      userId: 3,
      role: 'team_member', 
      date: new Date().toISOString().split('T')[0],
      startTime: '13:00',
      endTime: '17:00',
      durationSeconds: 14400,
      projectId: 1,
      subprojectId: 1,
      taskId: 2,
      notes: 'Mobile responsive layouts',
      status: 'approved',
      billable: 'billable'
    },
    // Mix of billable/non-billable entries across the week
    {
      id: 3,
      userId: 4,
      role: 'team_member',
      date: '2025-01-20',
      startTime: '10:00',
      endTime: '16:00',
      durationSeconds: 21600,
      projectId: 2,
      subprojectId: 3,
      taskId: 5,
      notes: 'iOS development work',
      status: 'approved',
      billable: 'billable'
    },
    {
      id: 4,
      userId: 5,
      role: 'team_member',
      date: '2025-01-21',
      startTime: '09:30',
      endTime: '12:30',
      durationSeconds: 10800,
      projectId: 3,
      notes: 'Team meeting and planning',
      status: 'submitted',
      billable: 'non_billable'
    },
    // Org holiday entry (locked day with notes only)
    {
      id: 5,
      userId: 3,
      role: 'team_member',
      date: '2025-01-22', // Org holiday
      startTime: '00:00',
      endTime: '00:00',
      durationSeconds: 0,
      projectId: 1,
      notes: 'Company holiday - New Year celebration',
      status: 'submitted',
      billable: 'non_billable'
    },
    // Member on leave simulation
    {
      id: 6,
      userId: 4,
      role: 'team_member',
      date: '2025-01-23',
      startTime: '00:00',
      endTime: '00:00',
      durationSeconds: 0,
      projectId: 2,
      notes: 'Personal leave day',
      status: 'approved',
      billable: 'non_billable'
    }
  ];
  
  saveTimeEntries(demoEntries);
};