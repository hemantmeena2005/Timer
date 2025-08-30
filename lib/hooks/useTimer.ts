import { useState, useEffect, useCallback } from 'react';
import { Task, TimeEntry, TimerState } from '@/types';

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    currentTask: null,
    startTime: null,
    elapsedTime: 0,
  });
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // Fetch time entries from database
  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch('/api/time-entries');
      if (response.ok) {
        const dbEntries = await response.json();
        const entriesWithDates = dbEntries.map((entry: { _id: string; startTime: string; endTime?: string; [key: string]: unknown }) => ({
          ...entry,
          id: entry._id,
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : undefined
        }));
        setTimeEntries(entriesWithDates);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

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

  const startTimer = useCallback((task: Task) => {
    const now = new Date();
    setTimerState({
      isRunning: true,
      currentTask: task,
      startTime: now,
      elapsedTime: 0,
    });
  }, []);

  const stopTimer = useCallback(async (onTaskTimeUpdate?: (taskId: string, duration: number) => void) => {
    if (!timerState.isRunning || !timerState.currentTask || !timerState.startTime) {
      return;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timerState.startTime.getTime()) / 1000);

    try {
      // Save time entry to database
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: timerState.currentTask.id,
          startTime: timerState.startTime,
          endTime,
          duration
        })
      });

      if (response.ok) {
        const newEntry = await response.json();
        const entryWithDates = {
          ...newEntry,
          startTime: new Date(newEntry.startTime),
          endTime: new Date(newEntry.endTime)
        };
        setTimeEntries(prev => [...prev, entryWithDates]);

        // Update task total time
        if (onTaskTimeUpdate) {
          onTaskTimeUpdate(timerState.currentTask.id, duration);
        }
      }
    } catch (error) {
      console.error('Error saving time entry:', error);
    }

    setTimerState({
      isRunning: false,
      currentTask: null,
      startTime: null,
      elapsedTime: 0,
    });

    return duration;
  }, [timerState]);

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