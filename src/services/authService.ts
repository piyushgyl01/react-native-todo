import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '../models/User';

const API_URL = 'http://10.0.2.2:5002/api/auth'; // Use 10.0.2.2 for Android emulator to access localhost

export const authService = {
  async register(email: string, password: string): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        email,
        password,
      });

      // Store JWT token
      await AsyncStorage.setItem('token', response.data.token);

      return response.data.user;
    } catch (error: any) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      // Store JWT token
      await AsyncStorage.setItem('token', response.data.token);

      return response.data.user;
    } catch (error: any) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        return null;
      }

      const response = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.user;
    } catch (error) {
      await AsyncStorage.removeItem('token');
      return null;
    }
  },
};
