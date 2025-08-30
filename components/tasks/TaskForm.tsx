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
      <form onSubmit={handleSubmit} className="space-y-4  text-black">
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
          <label className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {taskColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color
                    ? 'border-gray-900 scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}