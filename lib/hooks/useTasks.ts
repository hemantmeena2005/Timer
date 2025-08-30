import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { getRandomColor } from '@/lib/utils';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks from database
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const dbTasks = await response.json();
        const tasksWithDates = dbTasks.map((task: { _id: string; createdAt: string; [key: string]: unknown }) => ({
          ...task,
          id: task._id,
          createdAt: new Date(task.createdAt)
        }));
        setTasks(tasksWithDates);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (name: string, description?: string, color?: string) => {
    console.log('🔧 addTask called with:', { name, description, color });
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          color: color || getRandomColor()
        })
      });

      if (response.ok) {
        const newTask = await response.json();
        const taskWithDate = {
          ...newTask,
          createdAt: new Date(newTask.createdAt)
        };
        setTasks(prev => [...prev, taskWithDate]);
        console.log('✅ Task add completed');
        return taskWithDate;
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setTasks(prev => prev.map(task =>
          task.id === id ? { ...task, ...updates } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const updateTaskTime = async (taskId: string, duration: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalTime: task.totalTime + duration })
      });

      if (response.ok) {
        setTasks(prev => prev.map(task =>
          task.id === taskId
            ? { ...task, totalTime: task.totalTime + duration }
            : task
        ));
      }
    } catch (error) {
      console.error('Error updating task time:', error);
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    updateTaskTime,
  };
}