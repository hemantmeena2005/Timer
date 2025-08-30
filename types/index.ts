export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  description?: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  color: string;
  totalTime: number; // in seconds
  createdAt: Date;
  isActive: boolean;
}

export interface TimerState {
  isRunning: boolean;
  currentTask: Task | null;
  startTime: Date | null;
  elapsedTime: number; // in seconds
}

export interface DailyStats {
  date: string;
  totalTime: number;
  tasks: Array<{
    taskId: string;
    taskName: string;
    time: number;
  }>;
}

export interface WeeklyStats {
  week: string;
  totalTime: number;
  dailyBreakdown: DailyStats[];
}