// src/screens/TaskDetailScreen.tsx (partial)
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {TaskStackParamList} from '../navigation/AppNavigator';
import {useTasks} from '../context/TaskContext';
import {Task} from '../models/Task';

type TaskDetailScreenNavigationProp = StackNavigationProp<
  TaskStackParamList,
  'TaskDetail'
>;
type TaskDetailScreenRouteProp = RouteProp<TaskStackParamList, 'TaskDetail'>;

interface TaskDetailScreenProps {
  navigation: TaskDetailScreenNavigationProp;
  route: TaskDetailScreenRouteProp;
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const {taskId} = route.params;
  const {tasks, updateTask, deleteTask} = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Find the task from the tasks array
    const foundTask = tasks.find(t => t.id === taskId);

    if (foundTask) {
      setTask(foundTask);
      console.log(`Found task with ID: ${taskId}`, foundTask);
    } else {
      console.error(`Task not found with ID: ${taskId}`);
      Alert.alert('Error', 'Task not found');
      navigation.goBack();
    }

    setIsLoading(false);
  }, [taskId, tasks, navigation]);

  useEffect(() => {
    // Set up header right button
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, task]);

  const handleToggleComplete = async () => {
    if (!task) return;

    try {
      console.log(`Toggling completion for task with ID: ${task.id}`);
      await updateTask(task.id, {completed: !task.completed});
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`Deleting task with ID: ${task.id}`);
              await deleteTask(task.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    if (task) {
      navigation.navigate('EditTask', {taskId: task.id});
    }
  };

  // Rest of component remains the same...
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#e84118';
      case 'medium':
        return '#fbc531';
      case 'low':
        return '#4cd137';
      default:
        return '#a5b1c2';
    }
  };

  const isOverdue = () => {
    if (!task?.deadline) return false;
    const deadlineDate = new Date(task.deadline);
    return !task.completed && deadlineDate < new Date();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b7bec" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Task not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{task.title}</Text>
          <View
            style={[
              styles.priorityBadge,
              {backgroundColor: getPriorityColor(task.priority)},
            ]}>
            <Text style={styles.priorityText}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Text>
          </View>
        </View>

        {task.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        ) : null}

        <View style={styles.detailsContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Text
              style={[
                styles.status,
                {color: task.completed ? '#4cd137' : '#e84118'},
              ]}>
              {task.completed ? 'Completed' : 'Pending'}
            </Text>
          </View>

          {task.deadline ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deadline</Text>
              <Text
                style={[styles.deadline, isOverdue() && styles.overdueText]}>
                {new Date(task.deadline).toLocaleDateString()} at{' '}
                {new Date(task.deadline).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ) : null}

          {task.category ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Text style={styles.category}>#{task.category}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Created</Text>
            <Text style={styles.created}>
              {new Date(task.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Task ID</Text>
            <Text style={styles.created}>{task.id}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            task.completed ? styles.incompleteButton : styles.completeButton,
          ]}
          onPress={handleToggleComplete}>
          <Text style={styles.buttonText}>
            {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  priorityText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#a5b1c2',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deadline: {
    fontSize: 16,
  },
  overdueText: {
    color: '#e84118',
    fontWeight: 'bold',
  },
  category: {
    fontSize: 16,
    color: '#4b7bec',
  },
  created: {
    fontSize: 16,
    color: '#576574',
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  completeButton: {
    backgroundColor: '#4cd137',
  },
  incompleteButton: {
    backgroundColor: '#fbc531',
  },
  deleteButton: {
    backgroundColor: '#e84118',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerButton: {
    marginRight: 15,
  },
  headerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TaskDetailScreen;
