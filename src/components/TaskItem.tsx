import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Task} from '../models/Task';
import {useTasks} from '../context/TaskContext';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({task, onPress}) => {
  const {updateTask} = useTasks();

  const toggleComplete = async () => {
    try {
      await updateTask(task.id, {completed: !task.completed});
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

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
    if (!task.deadline) {
      return false;
    }
    const deadlineDate = new Date(task.deadline);
    return !task.completed && deadlineDate < new Date();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.completed && styles.completedContainer,
        isOverdue() && styles.overdueContainer,
      ]}
      onPress={onPress}>
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checked]}
        onPress={toggleComplete}>
        {task.completed && <View style={styles.checkmark} />}
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, task.completed && styles.completedText]}
            numberOfLines={1}>
            {task.title}
          </Text>
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
          <Text
            style={[styles.description, task.completed && styles.completedText]}
            numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          {task.deadline ? (
            <Text style={[styles.deadline, isOverdue() && styles.overdueText]}>
              {new Date(task.deadline).toLocaleDateString()}
            </Text>
          ) : null}

          {task.category ? (
            <Text style={styles.category}>#{task.category}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: '#f5f5f5',
    opacity: 0.8,
  },
  overdueContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#e84118',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4b7bec',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#4b7bec',
  },
  checkmark: {
    width: 12,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'white',
    transform: [{rotate: '-45deg'}],
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#a5b1c2',
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deadline: {
    fontSize: 12,
    color: '#a5b1c2',
  },
  overdueText: {
    color: '#e84118',
    fontWeight: 'bold',
  },
  category: {
    fontSize: 12,
    color: '#4b7bec',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TaskItem;
