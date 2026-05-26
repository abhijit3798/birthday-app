import { useState } from 'react';

/**
 * A hook that syncs state to LocalStorage.
 * Handles empty arrays, JSON parsing errors, and browser restrictions safely.
 * 
 * @param {string} key - The key under which state is saved
 * @param {any} initialValue - The fallback value if storage is empty
 * @returns {[any, Function]} - The state and setter function
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      const parsed = JSON.parse(item);
      if (Array.isArray(initialValue)) {
        if (!Array.isArray(parsed)) {
          return initialValue;
        }
        // Safely filter out null, undefined, or primitive values from stored array
        return parsed.filter(x => x && typeof x === 'object');
      }
      return parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
export default useLocalStorage;
