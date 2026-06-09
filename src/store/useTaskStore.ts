import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './mmkv';

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  baseDate: string; // ISO date string matching the selected date
  createdAt: number;
  projectId?: string;
  planId?: string; // Relation to Timeblock (Plan)
}

interface TaskState {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, title: string) => void;
  deleteTask: (id: string) => void;
  addProject: (name: string, color: string) => void;
  deleteProject: (id: string) => void;
  assignTaskToPlan: (taskId: string, planId: string | undefined) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      projects: [],
      
      addProject: (name, color) => set((state) => ({
        projects: [
          ...state.projects,
          { id: Date.now().toString(), name, color }
        ]
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        tasks: state.tasks.map(t => t.projectId === id ? { ...t, projectId: undefined } : t)
      })),

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

      assignTaskToPlan: (taskId, planId) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId ? { ...t, planId } : t
        )
      })),
    }),
    {
      name: 'antyo-task-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
