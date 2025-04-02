import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {TaskStackParamList} from '../navigation/AppNavigator';
import {useTasks} from '../context/TaskContext';
import {Task} from '../models/Task';
import DateTimePicker from '@react-native-community/datetimepicker';
import CategorySelector from '../components/CategorySelector';
import PrioritySelector from '../components/PrioritySelector';

type EditTaskScreenNavigationProp = StackNavigationProp<
  TaskStackParamList,
  'EditTask'
>;
type EditTaskScreenRouteProp = RouteProp<TaskStackParamList, 'EditTask'>;

interface EditTaskScreenProps {
  navigation: EditTaskScreenNavigationProp;
  route: EditTaskScreenRouteProp;
}

const EditTaskScreen: React.FC<EditTaskScreenProps> = ({navigation, route}) => {
  const {taskId} = route.params;
  const {tasks, updateTask} = useTasks();

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Find the task from the tasks array
    const foundTask = tasks.find(t => t.id === taskId);

    if (foundTask) {
      setTask(foundTask);
      setTitle(foundTask.title);
      setDescription(foundTask.description || '');
      setDeadline(foundTask.deadline ? new Date(foundTask.deadline) : null);
      setPriority(foundTask.priority);
      setCategory(foundTask.category || '');
    } else {
      Alert.alert('Error', 'Task not found');
      navigation.goBack();
    }

    setIsLoading(false);
  }, [taskId, tasks]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the task');
      return;
    }

    if (!task) return;

    try {
      setIsSaving(true);
      await updateTask(task.id, {
        title,
        description: description || undefined,
        deadline: deadline || undefined,
        priority,
        category: category || undefined,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
      setIsSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b7bec" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Priority</Text>
            <PrioritySelector
              selectedPriority={priority}
              onSelectPriority={setPriority}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <CategorySelector
              selectedCategory={category}
              onSelectCategory={setCategory}
            />
          </View>

          {/* <View style={styles.inputContainer}>
            <Text style={styles.label}>Deadline</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                {deadline ? deadline.toLocaleDateString() : 'Select a deadline'}
              </Text>
            </TouchableOpacity>
            {deadline && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setDeadline(null)}>
                <Text style={styles.clearButtonText}>Clear deadline</Text>
              </TouchableOpacity>
            )}
          </View> */}

          {showDatePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSaving}>
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#a5b1c2',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dfe4ea',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#dfe4ea',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#4b7bec',
  },
  clearButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    color: '#e84118',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#4b7bec',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditTaskScreen;
