// MainApp.js
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Button, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TestPanel from './TestPanel';
import RunHistory from './RunHistory';
import { SafeAreaView } from 'react-native-safe-area-context';

// Change this to your server IP/URL
const SERVER_URL = 'http://192.168.1.6:3001';

// Storage keys
const RUNS_STORAGE_KEY = '@pack_runs';

export default function MainApp({ navigation }) {
  const [userLocation, setUserLocation] = useState(null);
  const [runners, setRunners] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [runId, setRunId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'tracking', 'history'
  const [completedRuns, setCompletedRuns] = useState([]);
  const socketRef = useRef(null);
  const locationSubscriptionRef = useRef(null);
  const runStartTimeRef = useRef(null);

  // Load saved runs on app start
  useEffect(() => {
    const loadSavedRuns = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(RUNS_STORAGE_KEY);
        if (jsonValue !== null) {
          const savedRuns = JSON.parse(jsonValue);
          setCompletedRuns(savedRuns);
          console.log('Loaded', savedRuns.length, 'saved runs');
        }
      } catch (e) {
        console.error('Failed to load runs:', e);
      }
    };
    
    loadSavedRuns();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ['websocket'],
      forceNew: true,
    });
    
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events for debugging
    newSocket.on('connect', () => {
      console.log('Connected to server!');
    });

    newSocket.on('connect_error', (error) => {
      console.log('Connection error:', error.message);
    });

    // Listen for other runners joining
    newSocket.on('runner-joined', (data) => {
      console.log('Runner joined:', data.runnerName);
      Alert.alert('Runner Joined', `${data.runnerName} joined the run!`);
    });

    // Listen for position updates from other runners
    newSocket.on('runner-updated', (data) => {
      updateRunnerFromServer(data);
    });

    // Listen for gap calculations
    newSocket.on('gaps-info', (data) => {
      console.log('Gaps info:', data);
      if (data.largestGap) {
        Alert.alert(
          'Largest Gap', 
          `${data.largestGap.runner1} ↔ ${data.largestGap.runner2}: ${data.largestGap.distance}m`
        );
      }
    });

    // Listen for runners leaving
    newSocket.on('runner-left', (data) => {
      console.log('Runner left:', data.runnerName);
      Alert.alert('Runner Left', `${data.runnerName} left the run`);
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // Calculate run duration
  const calculateRunDuration = () => {
    if (!runStartTimeRef.current) return '00:00';
    
    const endTime = new Date();
    const startTime = runStartTimeRef.current;
    const durationMs = endTime - startTime;
    
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Generate run summary
  const generateRunSummary = () => {
    if (runners.length < 2) return 'Solo run - great job staying consistent!';
    
    const gap = calculateLargestGap();
    if (gap && gap.distance !== '0') {
      return `Group of ${runners.length} runners. Largest gap was ${gap.distance}m between ${gap.between}.`;
    }
    return `Great group run with ${runners.length} runners staying close together!`;
  };

  // Save run data when ending a run
  const saveRunData = async () => {
    if (runners.length > 0) {
      const duration = calculateRunDuration();
      const runData = {
        id: runId || `run-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: duration,
        distance: `${(3 + Math.random() * 7).toFixed(1)} km`, // Simulated distance
        runners: runners.map(r => r.name),
        runnerCount: runners.length,
        avgSpeed: calculateAverageSpeed(),
        largestGap: calculateLargestGap()?.distance || '0m',
        gapBetween: calculateLargestGap()?.between || 'No gap',
        summary: generateRunSummary(),
        timestamp: new Date().toISOString()
      };
      
      try {
        // Get existing runs
        const jsonValue = await AsyncStorage.getItem(RUNS_STORAGE_KEY);
        const existingRuns = jsonValue ? JSON.parse(jsonValue) : [];
        
        // Add new run at beginning
        const updatedRuns = [runData, ...existingRuns];
        
        // Save back to storage
        await AsyncStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(updatedRuns));
        
        // Update state
        setCompletedRuns(updatedRuns);
        
        Alert.alert(
          'Run Saved! 🏃‍♂️',
          `Your ${duration} run with ${runners.length} runner${runners.length !== 1 ? 's' : ''} has been saved to history.`,
          [{ text: 'OK' }]
        );
        
        console.log('Run saved:', runData);
      } catch (e) {
        console.error('Failed to save run:', e);
        Alert.alert('Error', 'Failed to save run data. Please try again.');
      }
    }
  };

  // Clear all run history
  const clearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all run history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(RUNS_STORAGE_KEY);
              setCompletedRuns([]);
              Alert.alert('History Cleared', 'All run history has been cleared.');
            } catch (e) {
              console.error('Failed to clear history:', e);
              Alert.alert('Error', 'Failed to clear history. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Start tracking and join a run
  const startTracking = async () => {
    // Request location permissions
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Pack needs location access to track your run.');
      return;
    }

    // Generate a run ID
    const newRunId = 'run-' + Date.now();
    setRunId(newRunId);
    setTracking(true);
    runStartTimeRef.current = new Date(); // Record start time

    // Join the run on server
    if (socketRef.current) {
      socketRef.current.emit('join-run', {
        runId: newRunId,
        runnerName: 'You'
      });
    }

    // Get initial location
    let location = await Location.getCurrentPositionAsync({});
    const initialLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    setUserLocation(initialLocation);

    // Start with you as the first runner
    setRunners([
      { 
        id: 'you', 
        name: 'You', 
        latitude: location.coords.latitude, 
        longitude: location.coords.longitude, 
        color: '#FF0000',
        speed: location.coords.speed || 0,
        isYou: true
      }
    ]);

    // Start watching position updates
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        timeInterval: 2000,
      },
      (newLocation) => {
        // Update local state
        updateRunnerPosition('you', newLocation.coords);
        
        // Send to server
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('update-position', {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            speed: newLocation.coords.speed || 0
          });
        }
      }
    );

    locationSubscriptionRef.current = subscription;
    return subscription;
  };

  // Stop tracking and clean up
  const stopTracking = () => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
    
    if (socketRef.current && runId) {
      socketRef.current.emit('leave-run', { runId });
    }
    
    saveRunData();
    setTracking(false);
    setCurrentScreen('home');
    setRunners([]);
    setShowTestPanel(false);
    runStartTimeRef.current = null;
  };

  // Update test runner position
  const updateTestRunner = (runnerId, data) => {
    setRunners(prevRunners => {
      const existingIndex = prevRunners.findIndex(r => r.id === runnerId);
    
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...prevRunners];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...data
        };
        return updated;
      } else {
        // Add new test runner
        return [
          ...prevRunners,
          {
            id: runnerId,
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            color: data.color,
            speed: data.speed,
            isYou: false
          }
        ];
      }
    });
  };

  // Update your own position
  const updateRunnerPosition = (runnerId, coords) => {
    setRunners(prevRunners => 
      prevRunners.map(runner => 
        runner.id === runnerId 
          ? { 
              ...runner, 
              latitude: coords.latitude, 
              longitude: coords.longitude,
              speed: coords.speed || runner.speed
            }
          : runner
      )
    );
    
    // Center map on you
    if (userLocation) {
      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: userLocation.latitudeDelta,
        longitudeDelta: userLocation.longitudeDelta,
      });
    }
  };

  // Update other runners' positions from server
  const updateRunnerFromServer = (data) => {
    const { runnerId, runnerName, position, speed } = data;
    
    setRunners(prevRunners => {
      // Check if runner already exists
      const existingIndex = prevRunners.findIndex(r => r.id === runnerId);
      
      if (existingIndex >= 0) {
        // Update existing runner
        const updated = [...prevRunners];
        updated[existingIndex] = {
          ...updated[existingIndex],
          latitude: position.latitude,
          longitude: position.longitude,
          speed: speed
        };
        return updated;
      } else {
        // Add new runner
        const colors = ['#00FF00', '#0000FF', '#FFA500', '#800080', '#FF00FF', '#00FFFF'];
        const colorIndex = prevRunners.length - 1;
        
        return [
          ...prevRunners,
          {
            id: runnerId,
            name: runnerName,
            latitude: position.latitude,
            longitude: position.longitude,
            color: colors[colorIndex % colors.length],
            speed: speed,
            isYou: false
          }
        ];
      }
    });
  };

  // Request gap calculation from server
  const requestGaps = () => {
    if (socketRef.current) {
      socketRef.current.emit('request-gaps');
    }
  };

  // Simple gap calculation for display (client-side fallback)
  const calculateLargestGap = () => {
    if (runners.length < 2) return null;
    
    let maxDistance = 0;
    let runner1 = '', runner2 = '';
    
    for (let i = 0; i < runners.length; i++) {
      for (let j = i + 1; j < runners.length; j++) {
        const distance = Math.sqrt(
          Math.pow(runners[i].latitude - runners[j].latitude, 2) +
          Math.pow(runners[i].longitude - runners[j].longitude, 2)
        ) * 111000;
        
        if (distance > maxDistance) {
          maxDistance = distance;
          runner1 = runners[i].name;
          runner2 = runners[j].name;
        }
      }
    }
    
    return {
      distance: maxDistance.toFixed(0),
      between: `${runner1} ↔ ${runner2}`
    };
  };

  const gapInfo = calculateLargestGap();

  // Calculate average speed in km/h
  const calculateAverageSpeed = () => {
    if (runners.length === 0) return '0.0';
    const totalSpeed = runners.reduce((sum, runner) => sum + (runner.speed || 0), 0);
    return ((totalSpeed / runners.length) * 3.6).toFixed(1);
  };

  // Render Home Screen
  const renderHomeScreen = () => (
    <View style={styles.centered}>
      <Text style={styles.welcome}>🏃‍♂️ Pack</Text>
      <Text style={styles.description}>
        Track your running group in real-time with live positions and gap analysis
      </Text>
      
      <View style={styles.statsOverview}>
        <View style={styles.statCard}>
          <Text style={styles.statCardNumber}>{completedRuns.length}</Text>
          <Text style={styles.statCardLabel}>Total Runs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardNumber}>
            {completedRuns.reduce((sum, run) => sum + run.runnerCount, 0)}
          </Text>
          <Text style={styles.statCardLabel}>Runners Tracked</Text>
        </View>
      </View>
      
      <View style={styles.homeButtons}>
        <TouchableOpacity 
          style={[styles.homeButton, styles.primaryButton]}
          onPress={() => {
            startTracking();
            setCurrentScreen('tracking');
          }}
        >
          <Text style={styles.homeButtonText}>Start New Run</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.homeButton, styles.secondaryButton]}
          onPress={() => setCurrentScreen('history')}
        >
          <Text style={[styles.homeButtonText, styles.secondaryButtonText]}>View Run History</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.note}>
        Make sure backend server is running on port 3001
      </Text>
    </View>
  );

  // Render Tracking Screen
  const renderTrackingScreen = () => (
    <>
      <MapView 
        style={styles.map}
        region={userLocation}
        showsUserLocation={true}
        showsCompass={true}
        showsScale={true}
      >
        {runners.map((runner) => (
          <Marker
            key={runner.id}
            coordinate={{ latitude: runner.latitude, longitude: runner.longitude }}
            title={runner.name}
            description={`Speed: ${(runner.speed * 3.6).toFixed(1)} km/h`}
            pinColor={runner.isYou ? undefined : runner.color}
          />
        ))}
      </MapView>
      
      <View style={styles.controls}>
        <Button 
          title={showTestPanel ? "Hide Test" : "Test"} 
          onPress={() => setShowTestPanel(!showTestPanel)}
          color="#4A90E2"
        />
        <Button 
          title="Gaps" 
          onPress={requestGaps}
          color="#4A90E2"
        />
        <Button 
          title="End Run" 
          onPress={stopTracking}
          color="#FF3B30"
        />
      </View>
      
      {showTestPanel && (
        <TestPanel 
          socket={socketRef.current}
          runners={runners}
          updateTestRunner={updateTestRunner}
        />
      )}
      
      <View style={styles.statsPanel}>
        <Text style={styles.runId}>Live Run: {runId?.substring(0, 10)}...</Text>
        
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{runners.length}</Text>
            <Text style={styles.statLabel}>Runners</Text>
          </View>
          
          {gapInfo ? (
            <>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{gapInfo.distance}m</Text>
                <Text style={styles.statLabel}>Largest Gap</Text>
              </View>
              
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {calculateAverageSpeed()}
                </Text>
                <Text style={styles.statLabel}>Avg km/h</Text>
              </View>
            </>
          ) : (
            <View style={styles.stat}>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Gap</Text>
            </View>
          )}
        </View>
        
        {gapInfo && (
          <Text style={styles.gapInfo}>
            {gapInfo.between}
          </Text>
        )}
        
        {runStartTimeRef.current && (
          <Text style={styles.runTimer}>
            Time: {calculateRunDuration()}
          </Text>
        )}
      </View>
    </>
  );

  // Render History Screen
  const renderHistoryScreen = () => (
    <RunHistory 
      runs={completedRuns}
      onSelectRun={(run) => {
        Alert.alert(
          `Run Details - ${run.date}`,
          `Time: ${run.time}\n` +
          `Distance: ${run.distance}\n` +
          `Duration: ${run.duration}\n` +
          `Runners: ${run.runners.join(', ')}\n` +
          `Avg Speed: ${run.avgSpeed} km/h\n` +
          `Largest Gap: ${run.largestGap}\n\n` +
          `${run.summary}`,
          [{ text: 'OK' }]
        );
      }}
      onClearHistory={clearHistory}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.title}>Pack</Text>
        </TouchableOpacity>
        
        <View style={styles.headerControls}>
          {currentScreen === 'tracking' && (
            <Text style={styles.headerStatus}>
              {runners.length} runner{runners.length !== 1 ? 's' : ''}
            </Text>
          )}
          {currentScreen === 'history' && completedRuns.length > 0 && (
            <Text style={styles.headerStatus}>
              {completedRuns.length} run{completedRuns.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>
      
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'tracking' && renderTrackingScreen()}
      {currentScreen === 'history' && renderHistoryScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStatus: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcome: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  homeButtons: {
    width: '100%',
    alignItems: 'center',
  },
  homeButton: {
    width: '80%',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    color: '#495057',
  },
  note: {
    marginTop: 30,
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  statsPanel: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  runId: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
  },
  runTimer: {
    fontSize: 14,
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  stat: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  gapInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
});