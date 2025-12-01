import AsyncStorage from '@react-native-async-storage/async-storage';

const RUNS_STORAGE_KEY = '@pack_runs';

// Save runs to device storage
export const saveRuns = async (runs) => {
  try {
    const jsonValue = JSON.stringify(runs);
    await AsyncStorage.setItem(RUNS_STORAGE_KEY, jsonValue);
    console.log('Runs saved to storage:', runs.length);
  } catch (e) {
    console.error('Failed to save runs:', e);
  }
};

// Load runs from device storage
export const loadRuns = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(RUNS_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load runs:', e);
    return [];
  }
};

// Add a single run
export const addRun = async (newRun) => {
  try {
    const currentRuns = await loadRuns();
    const updatedRuns = [newRun, ...currentRuns];
    await saveRuns(updatedRuns);
    return updatedRuns;
  } catch (e) {
    console.error('Failed to add run:', e);
    return [];
  }
};

// Clear all runs
export const clearRuns = async () => {
  try {
    await AsyncStorage.removeItem(RUNS_STORAGE_KEY);
    console.log('All runs cleared');
    return [];
  } catch (e) {
    console.error('Failed to clear runs:', e);
    return [];
  }
};