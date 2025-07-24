import React, { useState, useEffect } from 'react';
import './App.css';
// Chart.js library for background graph
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js';
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler);

function App() {
  const [loading, setLoading] = useState(false);
  const [pingCount, setPingCount] = useState(0);
  const [lastPingTime, setLastPingTime] = useState('');
  const [timeFrame, setTimeFrame] = useState(1000); // Start with all-time view
  const [history, setHistory] = useState({ labels: [], data: [], bucket_type: '' }); // Pre-processed frequency data

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
      // For "all time" (1000), send a very large limit
      const actualLimit = timeFrame >= 1000 ? 9999 : timeFrame;
      const res = await fetch(`/api/ping/history?limit=${actualLimit}`);
      const data = await res.json();
      console.log('Frequency data:', data); // Debug log
      // Server now returns pre-processed frequency data
      if (data && Array.isArray(data.labels) && Array.isArray(data.data)) {
        setHistory({ 
          labels: data.labels, 
          data: data.data, 
          bucket_type: data.bucket_type || 'minute' 
        });
      } else {
        console.warn('Frequency data format unexpected:', data);
        setHistory({ labels: [], data: [], bucket_type: '' });
      }
    } catch (error) {
      console.error('Error fetching frequency data:', error);
      setHistory({ labels: [], data: [], bucket_type: '' });
    }
  };

  const handlePing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ping');
      const data = await res.json();
      setPingCount(data.count);
      setLastPingTime(new Date(data.timestamp).toLocaleString());
      // Refresh chart data after ping
      fetchPingHistory();
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <div className="chart-container">
        {/* Background graph showing recent pings */}
        {(() => {
          // Use pre-processed frequency data directly from server
          const hasData = history.labels && history.labels.length > 0;
          return (
            <Line
              className="chart-background"
              data={{
                labels: hasData ? history.labels : [''],
                datasets: [{
                  data: hasData ? history.data : [0],
                  borderColor: 'rgba(97,218,251,0.8)',
                  backgroundColor: 'rgba(97,218,251,0.2)',
                  fill: true,
                  tension: 0.4,
                  pointRadius: 0,
                }]
              }}
              options={{
                responsive: true,
                plugins: { 
                  legend: { display: false },
                  tooltip: { 
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(40, 44, 52, 0.9)',
                    titleColor: '#61dafb',
                    bodyColor: 'white',
                    borderColor: '#61dafb',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                      title: function(context) {
                        const bucketType = history.bucket_type;
                        if (bucketType === '10sec') {
                          return `10-second interval: ${context[0].label}`;
                        } else if (bucketType === '30sec') {
                          return `30-second interval: ${context[0].label}`;
                        } else {
                          return `Time: ${context[0].label}`;
                        }
                      },
                      label: function(context) {
                        const value = context.parsed.y;
                        const bucketType = history.bucket_type;
                        
                        if (bucketType === '10sec') {
                          return value === 1 ? '1 ping in 10 seconds' : `${value} pings in 10 seconds`;
                        } else if (bucketType === '30sec') {
                          return value === 1 ? '1 ping in 30 seconds' : `${value} pings in 30 seconds`;
                        } else {
                          return value === 1 ? '1 ping' : `${value} pings`;
                        }
                      }
                    }
                  }
                },
                scales: { 
                  x: { display: false }, 
                  y: { display: false }
                },
                elements: { point: { radius: 0 } },
                maintainAspectRatio: false,
                animation: {
                  duration: 750,
                  easing: 'easeInOutQuart'
                },
                transitions: {
                  active: {
                    animation: {
                      duration: 400
                    }
                  }
                }
              }}
            />
          );
        })()}
      </div>
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
          <label htmlFor="timeframe">Chart shows </label>
          <select id="timeframe" value={timeFrame} onChange={e => setTimeFrame(Number(e.target.value))}>
            <option value={1000}>All time activity</option>
            <option value={200}>Last 200 pings</option>
            <option value={100}>Last 100 pings</option>
            <option value={50}>Last 50 pings</option>
            <option value={20}>Last 20 pings</option>
          </select>
        </div>

        <div className="ping-container">
          <button 
            className="ping-button" 
            onClick={handlePing}
            disabled={loading}
          >
            {loading ? 'Pinging...' : 'Ping'}
          </button>
          
          {lastPingTime && (
            <div className="last-ping-time">
              Last ping: {lastPingTime}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
