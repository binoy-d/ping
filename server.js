const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database
const db = new sqlite3.Database('./data/ping.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Create tables and initialize data
function initializeDatabase() {
  // Create pings table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS pings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating pings table:', err.message);
    } else {
      console.log('Pings table ready');
    }
  });

  // Create counter table for global stats
  db.run(`
    CREATE TABLE IF NOT EXISTS counter (
      id INTEGER PRIMARY KEY,
      total_pings INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating counter table:', err.message);
    } else {
      // Initialize counter if it doesn't exist
      db.run(`
        INSERT OR IGNORE INTO counter (id, total_pings) VALUES (1, 0)
      `, (err) => {
        if (err) {
          console.error('Error initializing counter:', err.message);
        } else {
          console.log('Counter table ready');
        }
      });
    }
  });
}

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to get current ping count
function getCurrentCount(callback) {
  db.get('SELECT total_pings FROM counter WHERE id = 1', (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, row ? row.total_pings : 0);
    }
  });
}

// Helper function to increment ping count
function incrementPingCount(ipAddress, userAgent, callback) {
  db.serialize(() => {
    // Insert new ping record
    db.run(`
      INSERT INTO pings (ip_address, user_agent) VALUES (?, ?)
    `, [ipAddress, userAgent], function(err) {
      if (err) {
        return callback(err, null);
      }
      
      // Update counter
      db.run(`
        UPDATE counter 
        SET total_pings = total_pings + 1, 
            last_updated = CURRENT_TIMESTAMP 
        WHERE id = 1
      `, (err) => {
        if (err) {
          return callback(err, null);
        }
        
        // Get the new count
        getCurrentCount(callback);
      });
    });
  });
}

// API Routes
app.get('/api/ping', (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  incrementPingCount(ipAddress, userAgent, (err, count) => {
    if (err) {
      console.error('Error incrementing ping count:', err.message);
      res.status(500).json({ error: 'Database error' });
    } else {
      console.log(`Received ping request #${count} from ${ipAddress}`);
      res.json({
        message: 'pong',
        count: count,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Get current ping count without incrementing
app.get('/api/ping/count', (req, res) => {
  getCurrentCount((err, count) => {
    if (err) {
      console.error('Error getting ping count:', err.message);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({
        count: count,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Get ping frequency data (aggregated by minute for chart)
app.get('/api/ping/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  
  // Calculate frequency per minute from the last N pings
  db.all(`
    WITH recent_pings AS (
      SELECT timestamp
      FROM pings 
      ORDER BY timestamp DESC 
      LIMIT ?
    )
    SELECT 
      strftime('%H:%M', timestamp) as time_label,
      COUNT(*) as ping_count
    FROM recent_pings
    GROUP BY strftime('%Y-%m-%d %H:%M', timestamp)
    ORDER BY timestamp ASC
  `, [limit], (err, rows) => {
    if (err) {
      console.error('Error getting ping frequency:', err.message);
      res.status(500).json({ error: 'Database error' });
    } else {
      // Format data for chart
      const labels = rows.map(row => row.time_label);
      const data = rows.map(row => row.ping_count);
      
      res.json({
        labels: labels,
        data: data,
        total_points: rows.length
      });
    }
  });
});

// Serve static files from React build (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
