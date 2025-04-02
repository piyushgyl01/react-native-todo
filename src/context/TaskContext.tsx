import React, {createContext, useState, useEffect, useContext, useCallback} from 'react';
import {Task} from '../models/Task';
import {taskService} from '../services/taskService';
import {useAuth} from './AuthContext';

interface FilterOptions {
  category?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  sortTasks: (sortBy: 'priority' | 'deadline' | 'createdAt' | 'title') => void;
  filterTasks: (filters: FilterOptions) => void;
  clearFilters: () => void;
  refreshTasks: () => Promise<void>;
  activeFilters: FilterOptions;
  currentSortBy: 'priority' | 'deadline' | 'createdAt' | 'title' | null;
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
  activeFilters: {},
  currentSortBy: null,
});

export const TaskProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {user} = useAuth();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [currentSortBy, setCurrentSortBy] = useState<'priority' | 'deadline' | 'createdAt' | 'title' | null>(null);

  // Helper function to process tasks (apply filters and sorting)
  const processTasks = useCallback((tasks: Task[]): Task[] => {
    console.log('Processing tasks with filters:', activeFilters);
    console.log('Current sort:', currentSortBy);
    
    // Start with all tasks
    let result = [...tasks];
    
    // Apply filters if there are any active filters
    if (Object.keys(activeFilters).length > 0) {
      result = taskService.filterTasks(result, activeFilters);
    }
    
    // Apply sorting if there is one set
    if (currentSortBy) {
      console.log(`Applying sort by ${currentSortBy}`);
      result = taskService.sortTasks(result, currentSortBy);
    }
    
    return result;
  }, [activeFilters, currentSortBy]);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    if (!user) {
      setAllTasks([]);
      setFilteredTasks([]);
      return;
    }

    try {
      setIsLoading(true);
      const fetchedTasks = await taskService.getTasks();
      console.log(`Fetched ${fetchedTasks.length} tasks from API`);
      
      // Store the unfiltered tasks
      setAllTasks(fetchedTasks);
      
      // Process and set the filtered tasks
      const processed = processTasks(fetchedTasks);
      setFilteredTasks(processed);
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, processTasks]);

  // Initial fetch on mount and when user changes
  useEffect(() => {
    fetchTasks();
  }, [user, fetchTasks]);

  // Create a new task
  const createTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const newTask = await taskService.createTask(task);
      const updatedTasks = [...allTasks, newTask];
      setAllTasks(updatedTasks);
      
      // Process all tasks with current filters and sorting
      setFilteredTasks(processTasks(updatedTasks));
      
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  // Update an existing task
  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      console.log(`Updating task ${id} with:`, updates);
      const updatedTask = await taskService.updateTask(id, updates);
      
      const updatedTasks = allTasks.map(task =>
        task.id === id ? updatedTask : task,
      );
      
      setAllTasks(updatedTasks);
      
      // Process all tasks with current filters and sorting
      setFilteredTasks(processTasks(updatedTasks));
      
      return updatedTask;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      const updatedTasks = allTasks.filter(task => task.id !== id);
      setAllTasks(updatedTasks);
      
      // Process all tasks with current filters and sorting
      setFilteredTasks(processTasks(updatedTasks));
      
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  };

  // Sort tasks by a specific field
  const sortTasks = (sortBy: 'priority' | 'deadline' | 'createdAt' | 'title') => {
    console.log(`Setting sort to: ${sortBy}`);
    
    // Save the current sort
    setCurrentSortBy(sortBy);
    
    // Apply the sort to the current filtered tasks
    const sorted = taskService.sortTasks([...filteredTasks], sortBy);
    setFilteredTasks(sorted);
  };

  // Set active filters and apply them
  const filterTasks = (filters: FilterOptions) => {
    console.log('Setting filters:', filters);
    
    // Save the filters
    setActiveFilters(filters);
    
    // Apply filters and current sort to all tasks
    const filtered = taskService.filterTasks(allTasks, filters);
    
    // Apply current sort if there is one
    let result = filtered;
    if (currentSortBy) {
      result = taskService.sortTasks(filtered, currentSortBy);
    }
    
    setFilteredTasks(result);
  };

  // Clear all filters but keep sorting
  const clearFilters = () => {
    console.log('Clearing all filters, keeping sort:', currentSortBy);
    
    // Clear filters
    setActiveFilters({});
    
    // Get all tasks but keep the current sort
    let result = [...allTasks];
    if (currentSortBy) {
      result = taskService.sortTasks(result, currentSortBy);
    }
    
    setFilteredTasks(result);
  };

  // Manually refresh tasks
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
        activeFilters,
        currentSortBy,
      }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);