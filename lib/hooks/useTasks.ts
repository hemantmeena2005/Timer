import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { storage, generateId, getRandomColor } from '@/lib/utils';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const savedTasks = storage.getTasks();
    setTasks(savedTasks);
  }, []);

  const addTask = (name: string, description?: string, color?: string) => {
    console.log('🔧 addTask called with:', { name, description, color });
    
    const newTask: Task = {
      id: generateId(),
      name,
      description,
      color: color || getRandomColor(),
      totalTime: 0,
      createdAt: new Date(),
      isActive: false,
    };

    console.log('🆕 New task created:', newTask);
    const updatedTasks = [...tasks, newTask];
    console.log('📝 Current tasks:', tasks.length, 'Updated tasks:', updatedTasks.length);
    
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
    
    console.log('✅ Task add completed');
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  const updateTaskTime = (id: string, additionalTime: number) => {
    const updatedTasks = tasks.map(task =>
      task.id === id 
        ? { ...task, totalTime: task.totalTime + additionalTime }
        : task
    );
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskTime,
  };
}