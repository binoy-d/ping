import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [pingCount, setPingCount] = useState(0);
  const [lastPingTime, setLastPingTime] = useState('');

  // Fetch current ping count on component mount
  useEffect(() => {
    fetchPingCount();
  }, []);

  const fetchPingCount = async () => {
    try {
      const res = await fetch('/api/ping/count');
      const data = await res.json();
      setPingCount(data.count);
    } catch (error) {
      console.error('Error fetching ping count:', error);
    }
  };

  const handlePing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ping');
      const data = await res.json();
      setResponse(data.message);
      setPingCount(data.count);
      setLastPingTime(new Date(data.timestamp).toLocaleString());
    } catch (error) {
      setResponse('Error: Could not reach server');
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ping Pong App</h1>
        
        <div className="stats-container">
          <div className="stat-item">
            <h3>Global Ping Count</h3>
            <div className="count-display">{pingCount.toLocaleString()}</div>
          </div>
        </div>

        <div className="ping-container">
          <button 
            className="ping-button" 
            onClick={handlePing}
            disabled={loading}
          >
            {loading ? 'Pinging...' : 'Ping'}
          </button>
          
          {response && (
            <div className="response">
              <h2>Server Response:</h2>
              <p className="response-text">{response}</p>
              {lastPingTime && (
                <p className="timestamp">Last ping: {lastPingTime}</p>
              )}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
