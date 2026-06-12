import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './mmkv';
import { scheduleMilestoneNotification, cancelMilestoneNotification } from '@/utils/notifications';

export interface Project {
  id: string;
  name: string;
  color: string;
  skillId?: string; // Relation to Mastery Skill
  targetDate?: string; // Optional deadline for the whole project
}

export interface Milestone {
  id: string;
  title: string;
  startDate?: string; // ISO date string for the start of this milestone
  date: string; // ISO date string for the deadline / end date
  isCompleted: boolean;
  projectId?: string;
  isReminderEnabled?: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  baseDate: string; // ISO date string matching the selected date
  createdAt: number;
  projectId?: string;
  milestoneId?: string; // Relation to a Milestone within a Project
  planId?: string; // Relation to Timeblock (Plan)
}

interface TaskState {
  tasks: Task[];
  projects: Project[];
  milestones: Milestone[];
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, title: string) => void;
  deleteTask: (id: string) => void;
  addProject: (name: string, color: string, skillId?: string, targetDate?: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  assignTaskToPlan: (taskId: string, planId: string | undefined) => void;
  assignTaskToMilestone: (taskId: string, milestoneId: string | undefined) => void;
  addMilestone: (milestone: Omit<Milestone, 'id' | 'isCompleted'>) => void;
  addMilestoneWithDates: (milestone: Omit<Milestone, 'id' | 'isCompleted'>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  toggleMilestone: (id: string) => void;
  deleteMilestone: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      projects: [],
      milestones: [],
      
      addProject: (name, color, skillId, targetDate) => set((state) => ({
        projects: [
          ...state.projects,
          { id: Date.now().toString(), name, color, skillId, targetDate }
        ]
      })),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        tasks: state.tasks.map(t => t.projectId === id ? { ...t, projectId: undefined } : t),
        milestones: state.milestones.map(m => m.projectId === id ? { ...m, projectId: undefined } : m)
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

      assignTaskToMilestone: (taskId, milestoneId) => set((state) => ({
        tasks: state.tasks.map(t =>
          t.id === taskId ? { ...t, milestoneId } : t
        )
      })),

      addMilestone: (milestoneData) => {
        const newMilestone = {
          ...milestoneData,
          id: Date.now().toString(),
          isCompleted: false,
        };
        set((state) => ({
          milestones: [...state.milestones, newMilestone]
        }));
        scheduleMilestoneNotification(newMilestone as Milestone);
      },

      addMilestoneWithDates: (milestoneData) => {
        const newMilestone = {
          ...milestoneData,
          id: Date.now().toString(),
          isCompleted: false,
        };
        set((state) => ({
          milestones: [...state.milestones, newMilestone]
        }));
        scheduleMilestoneNotification(newMilestone as Milestone);
      },

      updateMilestone: (id, updates) => {
        set((state) => {
          const newMilestones = state.milestones.map((m) => (m.id === id ? { ...m, ...updates } : m));
          const updated = newMilestones.find(m => m.id === id);
          if (updated) {
            if (updated.isReminderEnabled) {
              scheduleMilestoneNotification(updated);
            } else {
              cancelMilestoneNotification(id);
            }
          }
          return { milestones: newMilestones };
        });
      },

      toggleMilestone: (id) => set((state) => ({
        milestones: state.milestones.map(m => 
          m.id === id ? { ...m, isCompleted: !m.isCompleted } : m
        )
      })),

      deleteMilestone: (id) => {
        set((state) => ({ milestones: state.milestones.filter((m) => m.id !== id) }));
        cancelMilestoneNotification(id);
      },
    }),
    {
      name: 'antyo-task-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
