import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Portfolio from './components/home';
import Frontend from './components/frontend-infra';
import Backend from './components/backend-infra';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/student-record-system-react-aws-infrastructure" element={<Frontend />} />
          <Route path="/backend" element={<Backend />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;