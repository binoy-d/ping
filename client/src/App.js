import React, { useState } from 'react';
import './App.css';

function App() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ping');
      const data = await res.json();
      setResponse(data.message);
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
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
