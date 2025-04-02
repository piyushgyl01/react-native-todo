import React, {createContext, useState, useEffect, useContext} from 'react';
import {Task} from '../models/Task';
import {taskService} from '../services/taskService';
import {useAuth} from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  sortTasks: (sortBy: 'priority' | 'deadline' | 'createdAt' | 'title') => void;
  filterTasks: (filters: {
    category?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
  }) => void;
  clearFilters: () => void;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  isLoading: false,
  createTask: async () => ({
    id: '',
    title: '',
    completed: false,
    priority: 'medium',
    createdAt: new Date(),
  }),
  updateTask: async () => ({
    id: '',
    title: '',
    completed: false,
    priority: 'medium',
    createdAt: new Date(),
  }),
  deleteTask: async () => {},
  sortTasks: () => {},
  filterTasks: () => {},
  clearFilters: () => {},
  refreshTasks: async () => {},
});

export const TaskProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {user} = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    category?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
  }>({});

  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      setFilteredTasks([]);
      return;
    }

    try {
      setIsLoading(true);
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
      applyFilters(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const createTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const newTask = await taskService.createTask(task);
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      applyFilters(updatedTasks);
      return newTask;
    } catch (error) {
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskService.updateTask(id, updates);
      const updatedTasks = tasks.map(task =>
        task.id === id ? updatedTask : task,
      );
      setTasks(updatedTasks);
      applyFilters(updatedTasks);
      return updatedTask;
    } catch (error) {
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      applyFilters(updatedTasks);
    } catch (error) {
      throw error;
    }
  };

  const sortTasks = (
    sortBy: 'priority' | 'deadline' | 'createdAt' | 'title',
  ) => {
    const sorted = taskService.sortTasks(filteredTasks, sortBy);
    setFilteredTasks(sorted);
  };

  const applyFilters = (taskList: Task[]) => {
    if (Object.keys(activeFilters).length === 0) {
      setFilteredTasks(taskList);
      return;
    }

    const filtered = taskService.filterTasks(taskList, activeFilters);
    setFilteredTasks(filtered);
  };

  const filterTasks = (filters: {
    category?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    setActiveFilters(filters);
    applyFilters(tasks);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setFilteredTasks(tasks);
  };

  const refreshTasks = async () => {
    await fetchTasks();
  };

  return (
    <TaskContext.Provider
      value={{
        tasks: filteredTasks,
        isLoading,
        createTask,
        updateTask,
        deleteTask,
        sortTasks,
        filterTasks,
        clearFilters,
        refreshTasks,
      }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
