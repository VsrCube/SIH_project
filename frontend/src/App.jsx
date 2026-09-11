import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthRoleProvider } from './context/RoleThemeContext';
import { DocumentProvider } from './context/DocumentContext';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthRoleProvider>
      <DocumentProvider>
        <Router>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin Portal (Blue Theme, Admin Only) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Officer Portal (Green Theme, Officer Only) */}
            <Route
              path="/officer"
              element={
                <ProtectedRoute requiredRole="officer">
                  <OfficerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default Redirects */}
            <Route path="/dashboard" element={<Navigate to="/login" replace />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </DocumentProvider>
    </AuthRoleProvider>
  );
}

export default App;
