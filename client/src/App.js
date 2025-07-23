import React, { useState, useEffect } from 'react';
import './App.css';
// Chart.js library for background graph
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function App() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [pingCount, setPingCount] = useState(0);
  const [lastPingTime, setLastPingTime] = useState('');
  const [timeFrame, setTimeFrame] = useState(10);
  const [history, setHistory] = useState([]);

  // Fetch current ping count on component mount
  useEffect(() => {
    fetchPingCount();
    fetchPingHistory();
  }, []);
  // Fetch history when timeframe changes
  useEffect(() => {
    fetchPingHistory();
  }, [timeFrame]);

  const fetchPingCount = async () => {
    try {
      const res = await fetch('/api/ping/count');
      const data = await res.json();
      setPingCount(data.count);
    } catch (error) {
      console.error('Error fetching ping count:', error);
    }
  };

  const fetchPingHistory = async () => {
    try {
      const res = await fetch(`/api/ping/history?limit=${timeFrame}`);
      const data = await res.json();
      setHistory(data.history.reverse());
    } catch (error) {
      console.error('Error fetching ping history:', error);
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
      {/* Background graph showing recent pings */}
      <Line
        className="chart-background"
        data={{
          labels: history.map(item => new Date(item.timestamp).toLocaleTimeString()),
          datasets: [{
            data: history.map(item => item.id),
            borderColor: 'rgba(97,218,251,0.2)',
            backgroundColor: 'rgba(97,218,251,0.05)',
            fill: true,
            tension: 0.4,
          }]
        }}
        options={{
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { display: false } },
          elements: { point: { radius: 0 } },
          maintainAspectRatio: false,
        }}
      />
      <header className="App-header">
        <h1>Ping</h1>
        
        <div className="stats-container">
          <div className="stat-item">
            <h3>Global Ping Count</h3>
            <div className="count-display">{pingCount.toLocaleString()}</div>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="timeframe-selector">
          <label htmlFor="timeframe">Last </label>
          <select id="timeframe" value={timeFrame} onChange={e => setTimeFrame(Number(e.target.value))}>
            {[5,10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <label> pings</label>
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
