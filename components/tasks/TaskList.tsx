'use client';

import React from 'react';
import { Task } from '@/types';
import { formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStart: (task: Task) => void;
  currentTaskId?: string;
}

export function TaskList({ tasks, onEdit, onDelete, onStart, currentTaskId }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Create your first task to start tracking time</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Tasks</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.color }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {task.name}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 gap-1 sm:gap-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Total: {formatDuration(task.totalTime)}
                    </span>
                    {currentTaskId === task.id && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 w-fit">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:ml-4 justify-end">
                <Button
                  onClick={() => onStart(task)}
                  size="sm"
                  variant="outline"
                  disabled={currentTaskId === task.id}
                  className="px-2 sm:px-3"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button
                  onClick={() => onEdit(task)}
                  size="sm"
                  variant="ghost"
                  className="px-2 sm:px-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
                <Button
                  onClick={() => onDelete(task.id)}
                  size="sm"
                  variant="ghost"
                  className="px-2 sm:px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}