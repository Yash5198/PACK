import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

const TestPanel = ({ socket, runners, updateTestRunner }) => {
  const [testRunners, setTestRunners] = useState([
    { id: 'test-1', name: 'Alex', latitude: 0, longitude: 0, speed: 4.5, color: '#00FF00', active: false },
    { id: 'test-2', name: 'Sam', latitude: 0, longitude: 0, speed: 3.8, color: '#0000FF', active: false },
    { id: 'test-3', name: 'Jordan', latitude: 0, longitude: 0, speed: 5.2, color: '#FFA500', active: false },
    { id: 'test-4', name: 'Taylor', latitude: 0, longitude: 0, speed: 4.0, color: '#800080', active: false },
  ]);

  const toggleTestRunner = (index) => {
    const updatedRunners = [...testRunners];
    updatedRunners[index].active = !updatedRunners[index].active;
    setTestRunners(updatedRunners);

    if (updatedRunners[index].active) {
      // Start moving this runner
      startMovingRunner(updatedRunners[index], index);
    }
  };

  const startMovingRunner = (runner, index) => {
    if (!runner.active || !socket) return;

    // Get current user position as reference
    const userRunner = runners.find(r => r.isYou);
    if (!userRunner) return;

    // Set initial position near user
    const baseLat = userRunner.latitude + (Math.random() * 0.01 - 0.005);
    const baseLon = userRunner.longitude + (Math.random() * 0.01 - 0.005);

    const updatedRunner = {
      ...runner,
      latitude: baseLat,
      longitude: baseLon
    };

    // Simulate movement
    const interval = setInterval(() => {
      if (!testRunners[index].active) {
        clearInterval(interval);
        return;
      }

      // Move randomly
      const newLat = updatedRunner.latitude + (Math.random() * 0.0001 - 0.00005);
      const newLon = updatedRunner.longitude + (Math.random() * 0.0001 - 0.00005);

      // Update local state
      updateTestRunner(updatedRunner.id, {
        ...updatedRunner,
        latitude: newLat,
        longitude: newLon,
        speed: runner.speed
      });

      // Simulate server update
      if (socket.connected) {
        socket.emit('test-runner-update', {
          runnerId: updatedRunner.id,
          runnerName: updatedRunner.name,
          position: { latitude: newLat, longitude: newLon },
          speed: runner.speed
        });
      }

      updatedRunner.latitude = newLat;
      updatedRunner.longitude = newLon;
    }, 2000); // Update every 2 seconds

    // Cleanup
    return () => clearInterval(interval);
  };

  const activateAll = () => {
    testRunners.forEach((_, index) => {
      if (!testRunners[index].active) {
        toggleTestRunner(index);
      }
    });
  };

  const deactivateAll = () => {
    const updated = testRunners.map(runner => ({ ...runner, active: false }));
    setTestRunners(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Runners</Text>
      <Text style={styles.subtitle}>Simulate group running</Text>
      
      <View style={styles.buttonRow}>
        <Button title="Activate All" onPress={activateAll} color="#4CAF50" />
        <Button title="Deactivate All" onPress={deactivateAll} color="#F44336" />
      </View>

      <ScrollView style={styles.runnerList}>
        {testRunners.map((runner, index) => (
          <View key={runner.id} style={[styles.runnerCard, runner.active && styles.activeCard]}>
            <View style={styles.runnerInfo}>
              <View style={[styles.colorDot, { backgroundColor: runner.color }]} />
              <Text style={styles.runnerName}>{runner.name}</Text>
              <Text style={styles.runnerSpeed}>{runner.speed.toFixed(1)} m/s</Text>
            </View>
            <Button
              title={runner.active ? "Stop" : "Start"}
              onPress={() => toggleTestRunner(index)}
              color={runner.active ? "#F44336" : "#4CAF50"}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    maxHeight: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  runnerList: {
    marginTop: 10,
  },
  runnerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeCard: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  runnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  runnerName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 15,
  },
  runnerSpeed: {
    fontSize: 14,
    color: '#666',
  },
});

export default TestPanel;