import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import CategorySelector from './CategorySelector';
import PrioritySelector from './PrioritySelector';
import {useTasks} from '../context/TaskContext';

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
  // Use context to sync with global filter and sort state
  const {activeFilters, currentSortBy} = useTasks();

  // Local state for filter UI
  const [category, setCategory] = useState<string | undefined>(
    activeFilters.category,
  );
  const [priority, setPriority] = useState<
    'low' | 'medium' | 'high' | undefined
  >(activeFilters.priority);
  const [completed, setCompleted] = useState<boolean | undefined>(
    activeFilters.completed,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<
    'priority' | 'deadline' | 'createdAt' | 'title' | undefined
  >(currentSortBy || undefined);

  // Sync local state with context when activeFilters change
  useEffect(() => {
    setCategory(activeFilters.category);
    setPriority(activeFilters.priority);
    setCompleted(activeFilters.completed);
  }, [activeFilters]);

  // Sync sort state with context
  useEffect(() => {
    setSortBy(currentSortBy || undefined);
  }, [currentSortBy]);

  const applyFilters = () => {
    console.log('Applying filters from FilterBar modal:', {
      category,
      completed,
      priority,
    });

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

    // Apply sorting if selected
    if (sortBy) {
      onSort(sortBy);
    }

    setModalVisible(false);
  };

  const clearFilters = () => {
    console.log('Clearing all filters from FilterBar');
    setCategory(undefined);
    setPriority(undefined);
    setCompleted(undefined);
    onClear();
    setModalVisible(false);
    // Note: We don't clear the sort when clearing filters
  };

  const handleSort = (
    sort: 'priority' | 'deadline' | 'createdAt' | 'title',
  ) => {
    console.log(`Setting sort to: ${sort}`);
    setSortBy(sort);
    onSort(sort);
  };

  // Helper to determine if any filters are active
  const isFiltering = () => {
    return completed !== undefined || !!category || !!priority;
  };

  // Helper to show active sort in button text
  const getSortLabel = () => {
    if (!sortBy) {
      return 'Advanced Filters';
    }

    let filterStatus = isFiltering() ? 'Filters' : '';
    let sortStatus = `Sort: ${
      sortBy.charAt(0).toUpperCase() + sortBy.slice(1)
    }`;

    return filterStatus ? `${filterStatus} + ${sortStatus}` : sortStatus;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          (isFiltering() || sortBy) && styles.activeFilterButton,
        ]}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.filterButtonText}>
          {isFiltering() || sortBy ? getSortLabel() : 'Advanced Filters'}
        </Text>
      </TouchableOpacity>

      <View style={styles.quickFilters}>
        <TouchableOpacity
          style={[styles.chip, completed === true && styles.activeChip]}
          onPress={() => {
            console.log('Toggling completed filter. Current:', completed);
            const newValue = completed === true ? undefined : true;
            setCompleted(newValue);
            onFilter({
              category,
              completed: newValue,
              priority,
            });
          }}>
          <Text
            style={[
              styles.chipText,
              completed === true && styles.activeChipText,
            ]}>
            Done
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, completed === false && styles.activeChip]}
          onPress={() => {
            console.log('Toggling active filter. Current:', completed);
            const newValue = completed === false ? undefined : false;
            setCompleted(newValue);
            onFilter({
              category,
              completed: newValue,
              priority,
            });
          }}>
          <Text
            style={[
              styles.chipText,
              completed === false && styles.activeChipText,
            ]}>
            Active
          </Text>
        </TouchableOpacity>

        {(isFiltering() || sortBy) && (
          <TouchableOpacity
            style={[styles.chip, styles.clearChip]}
            onPress={() => {
              clearFilters();
              setSortBy(undefined);
              onClear();
            }}>
            <Text style={styles.clearChipText}>Reset All</Text>
          </TouchableOpacity>
        )}
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
                  onPress={() => {
                    console.log(
                      'Setting completed filter to:',
                      completed === true ? undefined : true,
                    );
                    setCompleted(completed === true ? undefined : true);
                  }}>
                  <Text
                    style={[
                      styles.buttonText,
                      completed === true && styles.activeButtonText,
                    ]}>
                    Completed
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    completed === false && styles.activeButton,
                  ]}
                  onPress={() => {
                    console.log(
                      'Setting active filter to:',
                      completed === false ? undefined : false,
                    );
                    setCompleted(completed === false ? undefined : false);
                  }}>
                  <Text
                    style={[
                      styles.buttonText,
                      completed === false && styles.activeButtonText,
                    ]}>
                    Active
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter by Priority</Text>
              <PrioritySelector
                selectedPriority={priority}
                onSelectPriority={p => {
                  console.log('Setting priority filter to:', p);
                  setPriority(p);
                }}
                allowClear
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter by Category</Text>
              <CategorySelector
                selectedCategory={category || ''}
                onSelectCategory={c => {
                  console.log('Setting category filter to:', c);
                  setCategory(c);
                }}
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
                  <Text
                    style={[
                      styles.buttonText,
                      sortBy === 'deadline' && styles.activeButtonText,
                    ]}>
                    Deadline
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    sortBy === 'priority' && styles.activeButton,
                  ]}
                  onPress={() => handleSort('priority')}>
                  <Text
                    style={[
                      styles.buttonText,
                      sortBy === 'priority' && styles.activeButtonText,
                    ]}>
                    Priority
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    sortBy === 'createdAt' && styles.activeButton,
                  ]}
                  onPress={() => handleSort('createdAt')}>
                  <Text
                    style={[
                      styles.buttonText,
                      sortBy === 'createdAt' && styles.activeButtonText,
                    ]}>
                    Date Created
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    sortBy === 'title' && styles.activeButton,
                  ]}
                  onPress={() => handleSort('title')}>
                  <Text
                    style={[
                      styles.buttonText,
                      sortBy === 'title' && styles.activeButtonText,
                    ]}>
                    Title
                  </Text>
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
                <Text style={styles.applyButtonText}>Apply</Text>
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
  activeFilterButton: {
    backgroundColor: '#1e56c2', // Darker to show it's active
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
    color: '#576574',
  },
  activeChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  clearChip: {
    backgroundColor: '#ff6b6b',
  },
  clearChipText: {
    fontSize: 12,
    color: 'white',
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
    color: '#576574',
  },
  activeButtonText: {
    color: 'white',
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
