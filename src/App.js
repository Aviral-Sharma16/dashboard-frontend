import React from 'react';
import Dashboard from './components/Dashboard'; // or './Dashboard' if not inside 'components'

function App() {
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Industrial Forecast Intelligence Tool</h1>
      <Dashboard />
    </div>
  );
}

export default App;

