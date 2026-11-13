import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Evaluate } from './pages/Evaluate';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/evaluate/:type" element={<Evaluate />} />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}
