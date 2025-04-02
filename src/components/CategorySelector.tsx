import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  allowClear?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  allowClear = false,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Load saved categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const savedCategories = await AsyncStorage.getItem('categories');
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          // Default categories
          const defaultCategories = [
            'Work',
            'Personal',
            'Shopping',
            'Health',
            'Finance',
          ];
          setCategories(defaultCategories);
          await AsyncStorage.setItem(
            'categories',
            JSON.stringify(defaultCategories),
          );
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      return;
    }

    const trimmedCategory = newCategory.trim();

    // Check if category already exists
    if (categories.includes(trimmedCategory)) {
      onSelectCategory(trimmedCategory);
      setNewCategory('');
      setModalVisible(false);
      return;
    }

    const updatedCategories = [...categories, trimmedCategory];

    try {
      await AsyncStorage.setItem(
        'categories',
        JSON.stringify(updatedCategories),
      );
      setCategories(updatedCategories);
      onSelectCategory(trimmedCategory);
      setNewCategory('');
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const renderCategoryItem = ({item}: {item: string}) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategoryItem,
      ]}
      onPress={() => {
        onSelectCategory(item);
        setModalVisible(false);
      }}>
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.selectorButtonText}>
          {selectedCategory || 'Select a category'}
        </Text>
      </TouchableOpacity>

      {allowClear && selectedCategory ? (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => onSelectCategory('')}>
          <Text style={styles.clearButtonText}>Clear category</Text>
        </TouchableOpacity>
      ) : null}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Category</Text>

            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={item => item}
              numColumns={2}
              contentContainerStyle={styles.categoriesList}
            />

            <View style={styles.addCategoryContainer}>
              <TextInput
                style={styles.input}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="Add new category"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddCategory}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    borderWidth: 1,
    borderColor: '#dfe4ea',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  selectorButtonText: {
    fontSize: 16,
    color: '#4b7bec',
  },
  clearButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    color: '#e84118',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  categoriesList: {
    flexGrow: 1,
  },
  categoryItem: {
    flex: 1,
    margin: 5,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f2f6',
    alignItems: 'center',
    maxWidth: '45%',
  },
  selectedCategoryItem: {
    backgroundColor: '#4b7bec',
  },
  categoryText: {
    fontSize: 14,
    color: '#576574',
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addCategoryContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dfe4ea',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#4b7bec',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#a5b1c2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CategorySelector;
