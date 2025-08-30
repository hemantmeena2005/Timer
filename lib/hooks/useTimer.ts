import { useState, useEffect, useCallback } from 'react';
import { Task, TimeEntry, TimerState } from '@/types';
import { storage, generateId } from '@/lib/utils';

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    currentTask: null,
    startTime: null,
    elapsedTime: 0,
  });

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const savedEntries = storage.getTimeEntries();
    setTimeEntries(savedEntries);

    // Restore timer state if it exists
    const savedTimerState = storage.getTimerState();
    if (savedTimerState && savedTimerState.isRunning) {
      setTimerState(savedTimerState);
    }
  }, []);

  // Update elapsed time every second when timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerState.isRunning && timerState.startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - timerState.startTime!.getTime()) / 1000);
        setTimerState(prev => ({ ...prev, elapsedTime: elapsed }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.startTime]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (timerState.isRunning) {
      storage.saveTimerState(timerState);
    } else {
      storage.clearTimerState();
    }
  }, [timerState]);

  const startTimer = useCallback((task: Task) => {
    const now = new Date();
    setTimerState({
      isRunning: true,
      currentTask: task,
      startTime: now,
      elapsedTime: 0,
    });
  }, []);

  const stopTimer = useCallback((onTaskTimeUpdate?: (taskId: string, duration: number) => void) => {
    if (!timerState.isRunning || !timerState.currentTask || !timerState.startTime) {
      return;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timerState.startTime.getTime()) / 1000);

    // Create new time entry
    const newEntry: TimeEntry = {
      id: generateId(),
      taskId: timerState.currentTask.id,
      startTime: timerState.startTime,
      endTime,
      duration,
    };

    const updatedEntries = [...timeEntries, newEntry];
    setTimeEntries(updatedEntries);
    storage.saveTimeEntries(updatedEntries);

    // Update task total time
    if (onTaskTimeUpdate) {
      onTaskTimeUpdate(timerState.currentTask.id, duration);
    }

    // Reset timer state
    setTimerState({
      isRunning: false,
      currentTask: null,
      startTime: null,
      elapsedTime: 0,
    });

    storage.clearTimerState();

    return duration;
  }, [timerState, timeEntries]);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resumeTimer = useCallback(() => {
    if (timerState.currentTask && timerState.startTime) {
      // Adjust start time to account for elapsed time
      const now = new Date();
      const adjustedStartTime = new Date(now.getTime() - (timerState.elapsedTime * 1000));
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        startTime: adjustedStartTime,
      }));
    }
  }, [timerState]);

  const getTaskTimeEntries = useCallback((taskId: string) => {
    return timeEntries.filter(entry => entry.taskId === taskId);
  }, [timeEntries]);

  const getTotalTimeForTask = useCallback((taskId: string) => {
    return timeEntries
      .filter(entry => entry.taskId === taskId)
      .reduce((total, entry) => total + entry.duration, 0);
  }, [timeEntries]);

  const getTodayTimeEntries = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= today && entryDate < tomorrow;
    });
  }, [timeEntries]);

  return {
    timerState,
    timeEntries,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    getTaskTimeEntries,
    getTotalTimeForTask,
    getTodayTimeEntries,
  };
}