import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './mmkv';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  baseDate: string; // ISO date string matching the selected date
  createdAt: number;
}

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, title: string) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      
      addTask: (taskData) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
            ...taskData,
            id: Date.now().toString(),
            completed: false,
            createdAt: Date.now(),
          }
        ]
      })),

      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      })),

      updateTask: (id, title) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, title } : t
        )
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
    }),
    {
      name: 'antyo-task-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
