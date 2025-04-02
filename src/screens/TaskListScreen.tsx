import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {useTasks} from '../context/TaskContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {TaskStackParamList} from '../navigation/AppNavigator';
import TaskItem from '../components/TaskItem';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';

type TaskListScreenNavigationProp = StackNavigationProp<
  TaskStackParamList,
  'TaskList'
>;

interface TaskListScreenProps {
  navigation: TaskListScreenNavigationProp;
}

const TaskListScreen: React.FC<TaskListScreenProps> = ({navigation}) => {
  const { logout} = useAuth();
  const {tasks, isLoading, sortTasks, filterTasks, clearFilters, refreshTasks} =
    useTasks();
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    // Set up header right button
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => setFilterVisible(!filterVisible)}
            style={styles.headerButton}>
            <Text style={styles.headerButtonText}>
              {filterVisible ? 'Hide Filters' : 'Filters'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, filterVisible]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshTasks();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      {filterVisible && (
        <FilterBar
          onFilter={filterTasks}
          onClear={clearFilters}
          onSort={sortBy => sortTasks(sortBy)}
        />
      )}

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TaskItem
            task={item}
            onPress={() => navigation.navigate('TaskDetail', {taskId: item.id})}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centerContainer}>
              <Text>Loading tasks...</Text>
            </View>
          ) : (
            <EmptyState
              message="No tasks yet. Create your first task!"
              buttonTitle="Add Task"
              onPress={() => navigation.navigate('CreateTask')}
            />
          )
        }
        contentContainerStyle={{flexGrow: 1}}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateTask')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginRight: 15,
  },
  headerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4b7bec',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonText: {
    fontSize: 30,
    color: 'white',
  },
});

export default TaskListScreen;
