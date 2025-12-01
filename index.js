const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for now
    methods: ["GET", "POST"]
  }
});

// Store active runs and runners
const activeRuns = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a run
  socket.on('join-run', (data) => {
    const { runId, runnerName } = data;
    
    if (!activeRuns.has(runId)) {
      activeRuns.set(runId, {
        runners: new Map(),
        startedAt: new Date()
      });
    }
    
    const run = activeRuns.get(runId);
    run.runners.set(socket.id, {
      id: socket.id,
      name: runnerName,
      position: null,
      speed: 0,
      joinedAt: new Date()
    });
    
    socket.join(runId);
    socket.runId = runId;
    
    // Notify others
    socket.to(runId).emit('runner-joined', {
      runnerId: socket.id,
      runnerName,
      totalRunners: run.runners.size
    });
    
    // Send current runners to newcomer
    const runnersArray = Array.from(run.runners.values());
    socket.emit('run-info', {
      runId,
      runners: runnersArray,
      totalRunners: runnersArray.length
    });
    
    console.log(`${runnerName} joined run ${runId}`);
  });

  // Update position
  socket.on('update-position', (data) => {
    const { latitude, longitude, speed } = data;
    const runId = socket.runId;
    
    if (!runId || !activeRuns.has(runId)) return;
    
    const run = activeRuns.get(runId);
    const runner = run.runners.get(socket.id);
    
    if (runner) {
      runner.position = { latitude, longitude };
      runner.speed = speed;
      runner.lastUpdate = new Date();
      
      // Broadcast to other runners in the same run
      socket.to(runId).emit('runner-updated', {
        runnerId: socket.id,
        runnerName: runner.name,
        position: runner.position,
        speed: runner.speed,
        timestamp: runner.lastUpdate
      });
    }
  });

  // Handle test runner updates (for development)
  socket.on('test-runner-update', (data) => {
    const { runnerId, runnerName, position, speed } = data;
    const runId = socket.runId;
    
    if (!runId || !activeRuns.has(runId)) return;
    
    const run = activeRuns.get(runId);
    
    // Update or add test runner
    if (!run.runners.has(runnerId)) {
      run.runners.set(runnerId, {
        id: runnerId,
        name: runnerName,
        position: position,
        speed: speed,
        joinedAt: new Date(),
        isTest: true
      });
    } else {
      const runner = run.runners.get(runnerId);
      runner.position = position;
      runner.speed = speed;
      runner.lastUpdate = new Date();
    }
    
    // Broadcast to all connected clients
    io.to(runId).emit('runner-updated', {
      runnerId: runnerId,
      runnerName: runnerName,
      position: position,
      speed: speed,
      timestamp: new Date()
    });
    
    console.log(`Test runner ${runnerName} updated position`);
  });

  // Calculate gaps (simplified)
  socket.on('request-gaps', () => {
    const runId = socket.runId;
    if (!runId || !activeRuns.has(runId)) return;
    
    const run = activeRuns.get(runId);
    const runners = Array.from(run.runners.values())
      .filter(r => r.position !== null);
    
    if (runners.length < 2) {
      socket.emit('gaps-info', { gaps: [] });
      return;
    }
    
    // Calculate distances between all runners
    const gaps = [];
    for (let i = 0; i < runners.length; i++) {
      for (let j = i + 1; j < runners.length; j++) {
        const distance = calculateDistance(
          runners[i].position.latitude, runners[i].position.longitude,
          runners[j].position.latitude, runners[j].position.longitude
        );
        
        gaps.push({
          runner1: runners[i].name,
          runner2: runners[j].name,
          distance: distance.toFixed(0),
          speedDifference: Math.abs(runners[i].speed - runners[j].speed).toFixed(1)
        });
      }
    }
    
    // Find largest gap
    const largestGap = gaps.reduce((max, gap) => 
      parseFloat(gap.distance) > parseFloat(max.distance) ? gap : max, 
      { distance: 0 }
    );
    
    socket.emit('gaps-info', {
      gaps,
      largestGap,
      timestamp: new Date()
    });
    
    console.log(`Calculated gaps for run ${runId}, largest: ${largestGap.distance}m`);
  });

  // Create test runners for development
  socket.on('create-test-runners', (data) => {
    const { count = 4, runId } = data;
    if (!runId || !activeRuns.has(runId)) return;
    
    const run = activeRuns.get(runId);
    const testNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley'];
    
    for (let i = 0; i < Math.min(count, testNames.length); i++) {
      const runnerId = `test-runner-${Date.now()}-${i}`;
      const runnerName = testNames[i];
      
      run.runners.set(runnerId, {
        id: runnerId,
        name: runnerName,
        position: { latitude: 37.77 + Math.random() * 0.02, longitude: -122.43 + Math.random() * 0.02 },
        speed: 3 + Math.random() * 2,
        joinedAt: new Date(),
        isTest: true
      });
      
      // Notify all clients
      io.to(runId).emit('runner-joined', {
        runnerId: runnerId,
        runnerName: runnerName,
        totalRunners: run.runners.size
      });
      
      // Send initial position
      io.to(runId).emit('runner-updated', {
        runnerId: runnerId,
        runnerName: runnerName,
        position: run.runners.get(runnerId).position,
        speed: run.runners.get(runnerId).speed,
        timestamp: new Date()
      });
    }
    
    console.log(`Created ${Math.min(count, testNames.length)} test runners for run ${runId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    const runId = socket.runId;
    if (runId && activeRuns.has(runId)) {
      const run = activeRuns.get(runId);
      const runner = run.runners.get(socket.id);
      
      if (runner) {
        run.runners.delete(socket.id);
        socket.to(runId).emit('runner-left', {
          runnerId: socket.id,
          runnerName: runner.name,
          totalRunners: run.runners.size
        });
        
        // Clean up empty runs
        if (run.runners.size === 0) {
          activeRuns.delete(runId);
          console.log(`Run ${runId} ended - no runners left`);
        }
      }
    }
  });
});

// Helper: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Pack server running on port ${PORT}`);
  console.log(`Socket.io ready for real-time connections`);
  console.log(`Test endpoints available:`);
  console.log(`- POST /test-runners/:runId - Create test runners`);
  console.log(`- GET /runs - List active runs`);
});

// Simple REST endpoints for testing
app.get('/runs', (req, res) => {
  const runs = [];
  activeRuns.forEach((run, runId) => {
    runs.push({
      runId,
      runnerCount: run.runners.size,
      startedAt: run.startedAt,
      runners: Array.from(run.runners.values()).map(r => ({
        id: r.id,
        name: r.name,
        isTest: r.isTest || false
      }))
    });
  });
  res.json({ runs });
});

app.post('/test-runners/:runId', (req, res) => {
  const runId = req.params.runId;
  const count = parseInt(req.query.count) || 4;
  
  if (!activeRuns.has(runId)) {
    return res.status(404).json({ error: 'Run not found' });
  }
  
  const run = activeRuns.get(runId);
  const testNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley'];
  
  const created = [];
  for (let i = 0; i < Math.min(count, testNames.length); i++) {
    const runnerId = `test-runner-${Date.now()}-${i}`;
    const runnerName = testNames[i];
    
    run.runners.set(runnerId, {
      id: runnerId,
      name: runnerName,
      position: { latitude: 37.77 + Math.random() * 0.02, longitude: -122.43 + Math.random() * 0.02 },
      speed: 3 + Math.random() * 2,
      joinedAt: new Date(),
      isTest: true
    });
    
    created.push({ runnerId, runnerName });
    
    // Notify all clients
    io.to(runId).emit('runner-joined', {
      runnerId: runnerId,
      runnerName: runnerName,
      totalRunners: run.runners.size
    });
    
    io.to(runId).emit('runner-updated', {
      runnerId: runnerId,
      runnerName: runnerName,
      position: run.runners.get(runnerId).position,
      speed: run.runners.get(runnerId).speed,
      timestamp: new Date()
    });
  }
  
  res.json({ 
    message: `Created ${created.length} test runners`,
    runners: created,
    totalRunners: run.runners.size
  });
});