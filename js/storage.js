class LocalStorageManager {

    // Method to add item to local storage
    setItem(key, value) {
      try {
        const serializedValue = JSON.stringify(value); // Convert value to a string
        localStorage.setItem(key, serializedValue);     // Save it in localStorage
        console.log(`Item with key "${key}" added to local storage.`);
      } catch (error) {
        console.error('Error saving to local storage:', error);
      }
    }

    // Method to get item from local storage
    getItem(key) {
      try {
        const serializedValue = localStorage.getItem(key); // Retrieve item from localStorage
        if (serializedValue === null) {
          console.log(`No item found with key "${key}".`);
          return null;
        }
        return JSON.parse(serializedValue); // Convert it back to its original form
      } catch (error) {
        console.error('Error retrieving from local storage:', error);
        return null;
      }
    }

    // Method to remove item from local storage
    removeItem(key) {
      try {
        localStorage.removeItem(key);
        console.log(`Item with key "${key}" removed from local storage.`);
      } catch (error) {
        console.error('Error removing from local storage:', error);
      }
    }

    // Method to rename a key in local storage
    renameKey(oldKey, newKey) {
      const value = this.getItem(oldKey);
      if (value !== null) {
        this.setItem(newKey, value);
        this.removeItem(oldKey);
      }
    }

    // Set field in an item from local storage
    setField(field, value, projectName) {
      const project = this.getItem(projectName);
      project[field] = value;
      this.setItem(projectName, project);
    }

  }


