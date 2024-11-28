import React from 'react';
import MapComponent from './components/Map';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="h-screen w-full">
      <Navbar />
      <MapComponent />
    </div>
  );
}

export default App;