import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Task} from '../models/Task';

const API_URL = 'http://10.0.2.2:5000/api/tasks'; // Use 10.0.2.2 for Android emulator to access localhost

export const taskService = {
  async getTasks(): Promise<Task[]> {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to fetch tasks';
    }
  },

  async getTask(id: string): Promise<Task> {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to fetch task';
    }
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await axios.post(API_URL, task, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to create task';
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await axios.put(`${API_URL}/${id}`, updates, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to update task';
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token');
      }

      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to delete task';
    }
  },

  // Utility methods for client-side operations
  sortTasks(
    tasks: Task[],
    sortBy: 'priority' | 'deadline' | 'createdAt' | 'title',
  ): Task[] {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityValues = {high: 3, medium: 2, low: 1};
          return priorityValues[b.priority] - priorityValues[a.priority];

        case 'deadline':
          const aDeadline = a.deadline
            ? new Date(a.deadline).getTime()
            : Infinity;
          const bDeadline = b.deadline
            ? new Date(b.deadline).getTime()
            : Infinity;
          return aDeadline - bDeadline;

        case 'createdAt':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        case 'title':
          return a.title.localeCompare(b.title);

        default:
          return 0;
      }
    });
  },

  // Advanced sorting with multiple criteria (BONUS FEATURE)
  advancedSort(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      // First sort by completion (incomplete first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Then by deadline (closer deadlines first)
      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;

      if (aDeadline !== bDeadline) {
        return aDeadline - bDeadline;
      }

      // Then by priority (high priority first)
      const priorityValues = {high: 3, medium: 2, low: 1};
      return priorityValues[b.priority] - priorityValues[a.priority];
    });
  },

  // Filter tasks by various criteria (BONUS FEATURE)
  filterTasks(
    tasks: Task[],
    filters: {
      category?: string;
      completed?: boolean;
      priority?: 'low' | 'medium' | 'high';
    },
  ): Task[] {
    return tasks.filter(task => {
      if (filters.category && task.category !== filters.category) {
        return false;
      }

      if (
        filters.completed !== undefined &&
        task.completed !== filters.completed
      ) {
        return false;
      }

      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      return true;
    });
  },
};
