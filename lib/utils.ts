import { Task, TimeEntry, TimerState } from '@/types';

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Local storage utilities
export const storage = {
  getTasks(): Task[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('timetracker_tasks');
      if (!stored) return [];
      const parsedTasks = JSON.parse(stored);
      return parsedTasks.map((task: Task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  saveTasks(tasks: Task[]): void {
    console.log('💾 Attempting to save tasks:', tasks.length, 'tasks');
    console.log('📍 Save called from:', new Error().stack?.split('\n')[2]?.trim());
    if (typeof window === 'undefined') {
      console.log('⚠️ Window is undefined, not saving');
      return;
    }
    try {
      const jsonString = JSON.stringify(tasks);
      console.log('📝 JSON string length:', jsonString.length);
      localStorage.setItem('timetracker_tasks', jsonString);
      console.log('✅ Tasks saved to localStorage successfully');
      
      // Verify save
      const saved = localStorage.getItem('timetracker_tasks');
      console.log('🔍 Verification - saved data exists:', !!saved);
    } catch (error) {
      console.error('❌ Error saving tasks:', error);
    }
  },

  getTimeEntries(): TimeEntry[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('timetracker_entries');
    return stored ? JSON.parse(stored).map((entry: TimeEntry) => ({
      ...entry,
      startTime: new Date(entry.startTime),
      endTime: entry.endTime ? new Date(entry.endTime) : undefined,
    })) : [];
  },

  saveTimeEntries(entries: TimeEntry[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('timetracker_entries', JSON.stringify(entries));
  },

  getTimerState(): TimerState | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('timetracker_timer_state');
    if (!stored) return null;
    
    const state = JSON.parse(stored);
    return {
      ...state,
      startTime: state.startTime ? new Date(state.startTime) : null,
    };
  },

  saveTimerState(state: TimerState): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('timetracker_timer_state', JSON.stringify(state));
  },

  clearTimerState(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('timetracker_timer_state');
  },

  // Debug function to clear all data
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('timetracker_tasks');
    localStorage.removeItem('timetracker_entries');
    localStorage.removeItem('timetracker_timer_state');
    console.log('All localStorage data cleared');
  }
};

export const taskColors = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#F97316', // orange
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#6366F1', // indigo
];

export function getRandomColor(): string {
  return taskColors[Math.floor(Math.random() * taskColors.length)];
}