import React, {useState} from 'react';
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
} from 'react-native';
import {useTasks} from '../context/TaskContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {TaskStackParamList} from '../navigation/AppNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';
import CategorySelector from '../components/CategorySelector';
import PrioritySelector from '../components/PrioritySelector';

type CreateTaskScreenNavigationProp = StackNavigationProp<
  TaskStackParamList,
  'CreateTask'
>;

interface CreateTaskScreenProps {
  navigation: CreateTaskScreenNavigationProp;
}

const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({navigation}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false); // Add state for time picker
  const [isLoading, setIsLoading] = useState(false);

  const {createTask} = useTasks();

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the task');
      return;
    }

    try {
      setIsLoading(true);
      await createTask({
        title,
        description: description || undefined,
        deadline: deadline || undefined,
        priority,
        category: category || undefined,
        completed: false,
      });
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to create task');
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
    if (selectedDate) {
      if (Platform.OS === 'android') {
        // On Android, after selecting the date, show the time picker
        setDeadline(selectedDate);
        setShowDatePicker(false);
        setShowTimePicker(true); // Show time picker next
      } else {
        setDeadline(selectedDate); // On iOS, set the full datetime
      }
    } else {
      setShowDatePicker(false); // Close if no date is selected
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios'); // Keep open on iOS
    if (selectedTime && deadline) {
      const updatedDate = new Date(deadline);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setDeadline(updatedDate);
    }
    setShowTimePicker(false); // Close time picker on Android
  };

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
                {deadline
                  ? deadline.toLocaleString() // Show both date and time
                  : 'Select a deadline'}
              </Text>
            </TouchableOpacity>
          </View> */}

          {showDatePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="date" // Use "date" mode for the date picker
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="time" // Use "time" mode for the time picker
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}>
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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

export default CreateTaskScreen;
