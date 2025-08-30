'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { taskColors } from '@/lib/utils';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description?: string, color?: string) => void;
  task?: Task | null;
}

export function TaskForm({ isOpen, onClose, onSubmit, task }: TaskFormProps) {
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [selectedColor, setSelectedColor] = useState(task?.color || taskColors[0]);
  const [errors, setErrors] = useState<{ name?: string }>({});

  React.useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || '');
      setSelectedColor(task.color);
    } else {
      setName('');
      setDescription('');
      setSelectedColor(taskColors[0]);
    }
    setErrors({});
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 TaskForm handleSubmit called:', { name, description, selectedColor });
    
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Task name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Form validation errors:', newErrors);
      setErrors(newErrors);
      return;
    }

    console.log('✅ Form validation passed, calling onSubmit');
    onSubmit(name.trim(), description.trim() || undefined, selectedColor);
    console.log('🚀 TaskForm onSubmit completed');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={task ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter task name"
          error={errors.name}
          autoFocus
        />
        
        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Color
          </label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {taskColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all ${
                  selectedColor === color
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="order-2 sm:order-1">
            Cancel
          </Button>
          <Button type="submit" className="order-1 sm:order-2">
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}