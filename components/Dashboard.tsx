'use client';

import React from 'react';
import { Task, TimeEntry } from '@/types';
import { formatDuration } from '@/lib/utils';

interface DashboardProps {
  tasks: Task[];
  timeEntries: TimeEntry[];
  todayEntries: TimeEntry[];
}

export function Dashboard({ tasks, timeEntries, todayEntries }: DashboardProps) {
  const totalTime = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const todayTime = todayEntries.reduce((sum, entry) => sum + entry.duration, 0);
  
  const taskStats = tasks.map(task => {
    const taskEntries = timeEntries.filter(entry => entry.taskId === task.id);
    const totalDuration = taskEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const todayDuration = todayEntries
      .filter(entry => entry.taskId === task.id)
      .reduce((sum, entry) => sum + entry.duration, 0);
    
    return {
      ...task,
      totalDuration,
      todayDuration,
      percentage: totalTime > 0 ? (totalDuration / totalTime) * 100 : 0,
    };
  }).sort((a, b) => b.totalDuration - a.totalDuration);

  const thisWeekEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return entryDate >= startOfWeek;
  });
  
  const thisWeekTime = thisWeekEntries.reduce((sum, entry) => sum + entry.duration, 0);

  const stats = [
    {
      label: 'Today',
      value: formatDuration(todayTime),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      label: 'This Week',
      value: formatDuration(thisWeekTime),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Total Time',
      value: formatDuration(totalTime),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'Active Tasks',
      value: tasks.length.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Breakdown */}
      {taskStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Breakdown</h3>
          <div className="space-y-4">
            {taskStats.map((task) => (
              <div key={task.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: task.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {task.name}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDuration(task.totalDuration)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Today: {formatDuration(task.todayDuration)}
                    </div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(task.percentage, 100)}%`,
                        backgroundColor: task.color,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {task.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {todayEntries.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Activity</h3>
          <div className="space-y-3">
            {todayEntries.slice(-5).reverse().map((entry) => {
              const task = tasks.find(t => t.id === entry.taskId);
              return (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: task?.color || '#6B7280' }}
                    />
                    <span className="text-sm text-gray-900">{task?.name || 'Unknown Task'}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDuration(entry.duration)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.startTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}