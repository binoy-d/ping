const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Global ping counter
let pingCount = 0;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/ping', (req, res) => {
  pingCount++;
  console.log(`Received ping request #${pingCount}`);
  res.json({ 
    message: 'pong',
    count: pingCount,
    timestamp: new Date().toISOString()
  });
});

// Get current ping count without incrementing
app.get('/api/ping/count', (req, res) => {
  res.json({ 
    count: pingCount,
    timestamp: new Date().toISOString()
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
