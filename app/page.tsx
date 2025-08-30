'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types';
import { useTasks } from '@/lib/hooks/useTasks';
import { useTimer } from '@/lib/hooks/useTimer';
import { useToast } from '@/lib/hooks/useToast';
import { Header } from '@/components/Header';
import { Timer } from '@/components/timer/Timer';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Dashboard } from '@/components/Dashboard';
import { Leaderboard } from '@/components/Leaderboard';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { tasks, addTask, updateTask, deleteTask, updateTaskTime } = useTasks();
  const {
    timerState,
    timeEntries,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    getTodayTimeEntries,
  } = useTimer();
  const { showToast } = useToast();

  const [activeView, setActiveView] = useState<'dashboard' | 'timer' | 'tasks' | 'leaderboard'>('timer');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayEntries = getTodayTimeEntries();

  // Debug: Track tasks state changes
  React.useEffect(() => {
    console.log('📊 Main page - tasks state updated:', tasks.length, 'tasks');
    console.log('📋 Main tasks:', tasks.map(t => ({ id: t.id, name: t.name })));
  }, [tasks]);

  // Redirect to signin if not authenticated
  React.useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      console.log('🔒 User not authenticated, redirecting to signin');
      router.push('/auth/signin');
      return;
    }
    
    if (session?.user) {
      console.log('✅ User authenticated:', session.user.email);
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null;
  }

  const handleAddTask = (name: string, description?: string, color?: string) => {
    console.log('🎯 handleAddTask called:', { name, description, color });
    addTask(name, description, color);
    showToast(`Task "${name}" created successfully!`, 'success');
    console.log('🆕 Task added from main page');
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleUpdateTask = (name: string, description?: string, color?: string) => {
    if (editingTask) {
      updateTask(editingTask.id, { name, description, color });
      showToast(`Task "${name}" updated successfully!`, 'success');
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (window.confirm('Are you sure you want to delete this task? This will also delete all associated time entries.')) {
      deleteTask(taskId);
      showToast(`Task "${task?.name}" deleted successfully!`, 'success');
    }
  };

  const handleStopTimer = () => {
    const duration = stopTimer(updateTaskTime);
    return duration;
  };

  const handleStartFromTask = (task: Task) => {
    if (timerState.isRunning && timerState.currentTask?.id !== task.id) {
      if (window.confirm('This will stop the current timer and start a new one. Continue?')) {
        handleStopTimer();
        startTimer(task);
      }
    } else if (!timerState.isRunning) {
      startTimer(task);
    }
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            tasks={tasks} 
            timeEntries={timeEntries} 
            todayEntries={todayEntries}
          />
        );
      case 'timer':
        console.log('🖥️ Rendering timer view with tasks:', tasks.length, 'tasks');
        console.log('📋 Timer tasks:', tasks.map(t => ({ id: t.id, name: t.name })));
        return (
          <div className="space-y-4 sm:space-y-6">
            <Timer
              isRunning={timerState.isRunning}
              currentTask={timerState.currentTask}
              elapsedTime={timerState.elapsedTime}
              onStart={startTimer}
              onStop={handleStopTimer}
              onPause={pauseTimer}
              onResume={resumeTimer}
              tasks={tasks}
            />
            {tasks.length > 0 && (
              <TaskList
                tasks={tasks}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStart={handleStartFromTask}
                currentTaskId={timerState.currentTask?.id}
              />
            )}
          </div>
        );
      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStart={handleStartFromTask}
            currentTaskId={timerState.currentTask?.id}
          />
        );
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        onNewTask={() => setShowTaskForm(true)}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {renderContent()}
      </main>

      <TaskForm
        isOpen={showTaskForm}
        onClose={handleCloseTaskForm}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        task={editingTask}
      />
    </div>
  );
}
