import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

interface PrioritySelectorProps {
  selectedPriority: 'low' | 'medium' | 'high' | undefined;
  onSelectPriority: (priority: 'low' | 'medium' | 'high') => void;
  allowClear?: boolean;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  selectedPriority,
  onSelectPriority,
  allowClear = false,
}) => {
  const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'No Priority';
    }
  };

  return (
    <View>
      <View style={styles.container}>
        {priorities.map(priority => (
          <TouchableOpacity
            key={priority}
            style={[
              styles.priorityButton,
              {backgroundColor: getPriorityColor(priority)},
              selectedPriority === priority && styles.selectedPriority,
            ]}
            onPress={() => onSelectPriority(priority)}>
            <Text style={styles.priorityText}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {allowClear && selectedPriority && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => onSelectPriority('medium')}>
          <Text style={styles.clearButtonText}>Reset to Medium</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.priorityDescription}>
        {selectedPriority
          ? getPriorityLabel(selectedPriority)
          : 'Select a priority'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedPriority: {
    borderWidth: 2,
    borderColor: '#2f3542',
  },
  priorityText: {
    color: 'white',
    fontWeight: 'bold',
  },
  priorityDescription: {
    fontSize: 14,
    color: '#a5b1c2',
    textAlign: 'center',
    marginTop: 5,
  },
  clearButton: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  clearButtonText: {
    color: '#576574',
    fontSize: 14,
  },
});

export default PrioritySelector;
