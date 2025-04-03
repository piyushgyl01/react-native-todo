import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Task} from '../models/Task';

const API_URL = 'http://10.0.2.2:5002/api/tasks';

// Helper function to normalize MongoDB _id to id
const normalizeTask = (task: any): Task => {
  if (!task) return {} as Task;

  return {
    id: task._id, // Use MongoDB's _id as client-side id
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    deadline: task.deadline ? new Date(task.deadline) : undefined,
    category: task.category,
    createdAt: new Date(task.createdAt),
  };
};

// Helper function to normalize an array of tasks
const normalizeTasks = (tasks: any[]): Task[] => {
  if (!tasks || !Array.isArray(tasks)) return [];
  return tasks.map(normalizeTask);
};

export const taskService = {
  async getTasks(): Promise<Task[]> {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Fetching tasks from API...');
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`Received ${response.data.data.length} tasks from API`);
      return normalizeTasks(response.data.data);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      throw error.response?.data?.message || 'Failed to fetch tasks';
    }
  },

  async getTask(id: string): Promise<Task> {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token');
      }

      console.log(`Fetching task with ID: ${id}`);
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return normalizeTask(response.data.data);
    } catch (error: any) {
      console.error(`Error fetching task ${id}:`, error);
      throw error.response?.data?.message || 'Failed to fetch task';
    }
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Creating new task:', task);
      const response = await axios.post(API_URL, task, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return normalizeTask(response.data.data);
    } catch (error: any) {
      console.error('Error creating task:', error);
      throw error.response?.data?.message || 'Failed to create task';
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token');
      }

      // Clone and remove client-side id from updates
      const apiUpdates = {...updates};
      if ('id' in apiUpdates) {
        delete apiUpdates.id;
      }

      console.log(`Updating task ${id} with:`, apiUpdates);
      const response = await axios.put(`${API_URL}/${id}`, apiUpdates, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return normalizeTask(response.data.data);
    } catch (error: any) {
      console.error(`Error updating task ${id}:`, error);
      throw error.response?.data?.message || 'Failed to update task';
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token');
      }

      console.log(`Deleting task with ID: ${id}`);
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error(`Error deleting task ${id}:`, error);
      throw error.response?.data?.message || 'Failed to delete task';
    }
  },

  // Improved filter function with more robust handling of filter values
  filterTasks(
    tasks: Task[],
    filters: {
      category?: string;
      completed?: boolean;
      priority?: 'low' | 'medium' | 'high';
    },
  ): Task[] {
    console.log('Filtering tasks with:', filters);
    console.log('Original task count:', tasks.length);

    // Return all tasks if no filters are applied
    if (!filters || Object.keys(filters).length === 0) {
      return tasks;
    }

    const filteredTasks = tasks.filter(task => {
      // Category filter - only apply if category filter exists and is not empty
      if (filters.category && filters.category.trim() !== '') {
        if (task.category !== filters.category) {
          return false;
        }
      }

      // Completed filter - only apply if completed filter is not undefined
      if (filters.completed !== undefined) {
        if (task.completed !== filters.completed) {
          return false;
        }
      }

      // Priority filter - only apply if priority filter exists
      if (filters.priority) {
        if (task.priority !== filters.priority) {
          return false;
        }
      }

      return true;
    });

    console.log('Filtered task count:', filteredTasks.length);
    return filteredTasks;
  },

  // Enhanced sorting function with better handling of undefined values and detailed logging
  sortTasks(
    tasks: Task[],
    sortBy: 'priority' | 'deadline' | 'createdAt' | 'title',
  ): Task[] {
    if (!tasks || tasks.length === 0) {
      console.log('No tasks to sort');
      return [];
    }

    console.log(`Sorting ${tasks.length} tasks by: ${sortBy}`);

    // Create a copy to avoid mutating the original array
    const tasksCopy = [...tasks];

    try {
      const sorted = tasksCopy.sort((a, b) => {
        switch (sortBy) {
          case 'priority':
            const priorityValues = {high: 3, medium: 2, low: 1};
            return priorityValues[b.priority] - priorityValues[a.priority];

          case 'deadline':
            // Handle undefined deadlines - put them at the end
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1; // a comes after b
            if (!b.deadline) return -1; // a comes before b

            const aDeadline = new Date(a.deadline).getTime();
            const bDeadline = new Date(b.deadline).getTime();
            return aDeadline - bDeadline;

          case 'createdAt':
            // Both should have createdAt, but handle the edge case
            if (!a.createdAt || !b.createdAt) {
              console.warn('Task missing createdAt during sort');
              return 0;
            }

            // Sort newest first (descending)
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

          case 'title':
            // Case insensitive title sort
            return a.title.toLowerCase().localeCompare(b.title.toLowerCase());

          default:
            console.warn(`Unknown sort type: ${sortBy}`);
            return 0;
        }
      });

      console.log(`Sorting complete: ${sortBy}`);
      return sorted;
    } catch (error) {
      console.error('Error during sorting:', error);
      return tasksCopy; // Return the unsorted copy on error
    }
  },
};
