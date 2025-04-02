import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import CategorySelector from './CategorySelector';
import PrioritySelector from './PrioritySelector';

interface FilterBarProps {
  onFilter: (filters: {
    category?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
  }) => void;
  onClear: () => void;
  onSort: (sortBy: 'priority' | 'deadline' | 'createdAt' | 'title') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({onFilter, onClear, onSort}) => {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<
    'low' | 'medium' | 'high' | undefined
  >(undefined);
  const [completed, setCompleted] = useState<boolean | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<
    'priority' | 'deadline' | 'createdAt' | 'title' | undefined
  >(undefined);

  const applyFilters = () => {
    const filters: {
      category?: string;
      completed?: boolean;
      priority?: 'low' | 'medium' | 'high';
    } = {};

    if (category) {
      filters.category = category;
    }
    if (completed !== undefined) {
      filters.completed = completed;
}
    if (priority) {
      filters.priority = priority;
    }

    onFilter(filters);
    setModalVisible(false);
  };

  const clearFilters = () => {
    setCategory(undefined);
    setPriority(undefined);
    setCompleted(undefined);
    setSortBy(undefined);
    onClear();
    setModalVisible(false);
  };

  const handleSort = (
    sort: 'priority' | 'deadline' | 'createdAt' | 'title',
  ) => {
    setSortBy(sort);
    onSort(sort);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.filterButtonText}>Advanced Filters</Text>
      </TouchableOpacity>

      <View style={styles.quickFilters}>
        <TouchableOpacity
          style={[styles.chip, completed === true && styles.activeChip]}
          onPress={() => {
            const newValue = completed === true ? undefined : true;
            setCompleted(newValue);
            onFilter({category, completed: newValue, priority});
          }}>
          <Text style={styles.chipText}>Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, completed === false && styles.activeChip]}
          onPress={() => {
            const newValue = completed === false ? undefined : false;
            setCompleted(newValue);
            onFilter({category, completed: newValue, priority});
          }}>
          <Text style={styles.chipText}>Active</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filters & Sorting</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter by Status</Text>
              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    completed === true && styles.activeButton,
                  ]}
                  onPress={() =>
                    setCompleted(completed === true ? undefined : true)
                  }>
                  <Text style={styles.buttonText}>Completed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    completed === false && styles.activeButton,
                  ]}
                  onPress={() =>
                    setCompleted(completed === false ? undefined : false)
                  }>
                  <Text style={styles.buttonText}>Active</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter by Priority</Text>
              <PrioritySelector
                selectedPriority={priority}
                onSelectPriority={p => setPriority(p)}
                allowClear
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter by Category</Text>
              <CategorySelector
                selectedCategory={category || ''}
                onSelectCategory={setCategory}
                allowClear
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    sortBy === 'deadline' && styles.activeButton,
                  ]}
                  onPress={() => handleSort('deadline')}>
                  <Text style={styles.buttonText}>Deadline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    sortBy === 'priority' && styles.activeButton,
                  ]}
                  onPress={() => handleSort('priority')}>
                  <Text style={styles.buttonText}>Priority</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    sortBy === 'createdAt' && styles.activeButton,
                  ]}
                  onPress={() => handleSort('createdAt')}>
                  <Text style={styles.buttonText}>Date Created</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    sortBy === 'title' && styles.activeButton,
                  ]}
                  onPress={() => handleSort('title')}>
                  <Text style={styles.buttonText}>Title</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
  },
  filterButton: {
    backgroundColor: '#4b7bec',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 10,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quickFilters: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: '#f1f2f6',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  activeChip: {
    backgroundColor: '#4b7bec',
  },
  chipText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#4b7bec',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    paddingVertical: 12,
    borderRadius: 5,
    marginRight: 5,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#576574',
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#4b7bec',
    paddingVertical: 12,
    borderRadius: 5,
    marginLeft: 5,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FilterBar;
