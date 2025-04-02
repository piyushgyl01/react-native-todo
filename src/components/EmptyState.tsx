// src/components/EmptyState.tsx
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

interface EmptyStateProps {
  message: string;
  buttonTitle?: string;
  onPress?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  buttonTitle,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {buttonTitle && onPress && (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{buttonTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: '#a5b1c2',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4b7bec',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EmptyState;
