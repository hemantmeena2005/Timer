'use client';

import React from 'react';
import { Task } from '@/types';
import { formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface TimerProps {
  isRunning: boolean;
  currentTask: Task | null;
  elapsedTime: number;
  onStart: (task: Task) => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  tasks: Task[];
}

export function Timer({
  isRunning,
  currentTask,
  elapsedTime,
  onStart,
  onStop,
  onPause,
  onResume,
  tasks
}: TimerProps) {
  const [selectedTaskId, setSelectedTaskId] = React.useState<string>('');
  const [timerDuration, setTimerDuration] = React.useState<number | null>(null);
  const [isTimerMode, setIsTimerMode] = React.useState(false);

  // Timer presets in seconds
  const timerPresets = [
    { label: '30 min', value: 30 * 60 },
    { label: '1 hour', value: 60 * 60 },
    { label: '2 hours', value: 120 * 60 }
  ];

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {
      // Fallback to system beep if audio file not available
      console.log('🔔 Timer completed!');
    });
  };

  // Check if timer duration is reached
  React.useEffect(() => {
    if (isTimerMode && timerDuration && elapsedTime >= timerDuration) {
      playNotificationSound();
      onStop();
      setIsTimerMode(false);
      setTimerDuration(null);
      alert('⏰ Timer completed!');
    }
  }, [elapsedTime, timerDuration, isTimerMode, onStop]);

  // Timer progress calculation
  const getTimerProgress = () => {
    if (!isTimerMode || !timerDuration) return 0;
    const remaining = timerDuration - elapsedTime;
    return Math.max(0, remaining / timerDuration) * 100;
  };

  const getRemainingTime = () => {
    if (!isTimerMode || !timerDuration) return elapsedTime;
    return Math.max(0, timerDuration - elapsedTime);
  };

  const formatCountdownTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Debug logging for tasks
  React.useEffect(() => {
    console.log('⏱️ Timer component - tasks updated:', tasks.length, 'tasks');
    console.log('📋 Tasks array:', tasks.map(t => ({ id: t.id, name: t.name })));
  }, [tasks]);

  const handleStart = () => {
    console.log('🚀 Timer handleStart - selectedTaskId:', selectedTaskId);
    const task = tasks.find(t => t.id === selectedTaskId);
    console.log('🔍 Found task:', task);
    if (task) {
      onStart(task);
    }
  };

  const handleTimerStart = (duration: number) => {
    if (tasks.length > 0) {
      const task = tasks.find(t => t.id === selectedTaskId) || tasks[0];
      setTimerDuration(duration);
      setIsTimerMode(true);
      onStart(task);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    console.log('📝 Task selected:', taskId);
    setSelectedTaskId(taskId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <div className="mb-4 sm:mb-6 relative">
          {/* Circular Progress Indicator */}
          {isTimerMode && timerDuration && (
            <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - getTimerProgress() / 100)}`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl sm:text-4xl font-mono font-bold text-gray-900 dark:text-white">
                  {formatCountdownTime(getRemainingTime())}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Timer
                </div>
              </div>
            </div>
          )}
          
          {/* Regular Timer Display */}
          {(!isTimerMode || !timerDuration) && (
            <div className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-gray-900 dark:text-white mb-2">
              {formatTime(elapsedTime)}
            </div>
          )}
          {currentTask && (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentTask.color }}
                />
                <span className="text-base sm:text-lg text-gray-600 dark:text-gray-400 truncate max-w-xs sm:max-w-sm">{currentTask.name}</span>
              </div>
              {isTimerMode && timerDuration && (
                <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  Target: {Math.floor(timerDuration / 60)} min
                </div>
              )}
            </div>
          )}
        </div>

        {!isRunning && !currentTask && (
          <div className="mb-4 sm:mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select a task to track
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => handleTaskSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm sm:text-base"
              >
                <option value="">Choose a task...</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Timer Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timerPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    onClick={() => handleTimerStart(preset.value)}
                    disabled={tasks.length === 0}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 sm:space-x-0">
          {!isRunning && !currentTask && (
            <Button
              onClick={handleStart}
              disabled={!selectedTaskId}
              size="lg"
              className="px-6 sm:px-8 w-full sm:w-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Timer
            </Button>
          )}

          {isRunning && (
            <>
              <Button
                onClick={onPause}
                variant="secondary"
                size="lg"
                className="px-4 sm:px-6 w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className=" sm:inline">Pause</span>
              </Button>
              <Button
                onClick={onStop}
                variant="danger"
                size="lg"
                className="px-4 sm:px-6 w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                <span className=" sm:inline">Stop</span>
              </Button>
            </>
          )}

          {!isRunning && currentTask && (
            <>
              <Button
                onClick={onResume}
                size="lg"
                className="px-4 sm:px-6 w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span className=" sm:inline">Resume</span>
              </Button>
              <Button
                onClick={onStop}
                variant="danger"
                size="lg"
                className="px-4 sm:px-6 w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                <span className=" sm:inline">Stop</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}