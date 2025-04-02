import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useAuth} from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TaskListScreen from '../screens/TaskListScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen';
import SplashScreen from '../screens/SplashScreen';

// Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: {taskId: string};
  CreateTask: undefined;
  EditTask: {taskId: string};
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const TaskStack = createStackNavigator<TaskStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4b7bec',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{title: 'Login'}}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{title: 'Create Account'}}
      />
    </AuthStack.Navigator>
  );
};

const TaskNavigator = () => {
  return (
    <TaskStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4b7bec',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <TaskStack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{title: 'My Tasks'}}
      />
      <TaskStack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{title: 'Task Details'}}
      />
      <TaskStack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{title: 'Add New Task'}}
      />
      <TaskStack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{title: 'Edit Task'}}
      />
    </TaskStack.Navigator>
  );
};

const AppNavigator = () => {
  const {user, isLoading} = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <TaskNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
