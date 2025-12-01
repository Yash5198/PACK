import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const RunHistory = ({ runs, onSelectRun }) => {
  // Sample data - in real app, this would come from backend
  const [pastRuns, setPastRuns] = useState([
    {
      id: '1',
      date: '2024-01-15',
      duration: '45:23',
      distance: '8.2 km',
      runners: ['You', 'Alex', 'Sam', 'Jordan'],
      avgSpeed: '10.8 km/h',
      largestGap: '520m',
      gapLocation: 'Between Alex & Jordan at mile 3',
      summary: 'Strong start, group stayed together until hill at mile 3'
    },
    {
      id: '2',
      date: '2024-01-10',
      duration: '38:45',
      distance: '7.5 km',
      runners: ['You', 'Taylor', 'Casey'],
      avgSpeed: '11.6 km/h',
      largestGap: '320m',
      gapLocation: 'Between You & Casey at final stretch',
      summary: 'Fast pace, Casey fell behind in final kilometer'
    },
    {
      id: '3',
      date: '2024-01-05',
      duration: '52:10',
      distance: '10.1 km',
      runners: ['You', 'Alex', 'Sam', 'Jordan', 'Taylor'],
      avgSpeed: '11.6 km/h',
      largestGap: '850m',
      gapLocation: 'Between Sam and group at water stop',
      summary: 'Long run, group spread out after water break'
    },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Run History</Text>
      <Text style={styles.subtitle}>Post-run analysis and insights</Text>
      
      <ScrollView style={styles.scrollView}>
        {pastRuns.map((run) => (
          <TouchableOpacity 
            key={run.id} 
            style={styles.runCard}
            onPress={() => onSelectRun && onSelectRun(run)}
          >
            <View style={styles.runHeader}>
              <Text style={styles.runDate}>{run.date}</Text>
              <Text style={styles.runDistance}>{run.distance}</Text>
            </View>
            
            <View style={styles.runStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{run.duration}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{run.avgSpeed}</Text>
                <Text style={styles.statLabel}>Avg Speed</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{run.largestGap}</Text>
                <Text style={styles.statLabel}>Largest Gap</Text>
              </View>
            </View>
            
            <View style={styles.runnerList}>
              <Text style={styles.sectionLabel}>Runners:</Text>
              <Text style={styles.runners}>{run.runners.join(', ')}</Text>
            </View>
            
            <View style={styles.gapInfo}>
              <Text style={styles.sectionLabel}>Key Gap:</Text>
              <Text style={styles.gapLocation}>{run.gapLocation}</Text>
            </View>
            
            <Text style={styles.summary}>{run.summary}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  runCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  runHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  runDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  runDistance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  runStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  runnerList: {
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 3,
  },
  runners: {
    fontSize: 14,
    color: '#666',
  },
  gapInfo: {
    marginBottom: 10,
  },
  gapLocation: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  summary: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 5,
  },
});

export default RunHistory;