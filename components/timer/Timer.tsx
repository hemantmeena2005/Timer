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

  const handleTaskSelect = (taskId: string) => {
    console.log('📝 Task selected:', taskId);
    setSelectedTaskId(taskId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
      <div className="text-center">
        <div className="mb-6">
          <div className="text-6xl font-mono font-bold text-gray-900 mb-2">
            {formatTime(elapsedTime)}
          </div>
          {currentTask && (
            <div className="flex items-center justify-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentTask.color }}
              />
              <span className="text-lg text-gray-600">{currentTask.name}</span>
            </div>
          )}
        </div>

        {!isRunning && !currentTask && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a task to track
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => handleTaskSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a task...</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          {!isRunning && !currentTask && (
            <Button
              onClick={handleStart}
              disabled={!selectedTaskId}
              size="lg"
              className="px-8"
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
                className="px-6"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause
              </Button>
              <Button
                onClick={onStop}
                variant="danger"
                size="lg"
                className="px-6"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop
              </Button>
            </>
          )}

          {!isRunning && currentTask && (
            <>
              <Button
                onClick={onResume}
                size="lg"
                className="px-6"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Resume
              </Button>
              <Button
                onClick={onStop}
                variant="danger"
                size="lg"
                className="px-6"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}