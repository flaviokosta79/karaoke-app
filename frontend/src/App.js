import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Session from './pages/Session';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/setup/:sessionId" element={<Setup />} />
        <Route path="/session/:sessionId" element={<Session />} />
      </Routes>
    </Router>
  );
}

export default App;
