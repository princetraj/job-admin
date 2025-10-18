import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import AdminList from './pages/admins/AdminList';
import EmployeeList from './pages/employees/EmployeeList';
import EmployerList from './pages/employers/EmployerList';
import JobList from './pages/jobs/JobList';
import CouponList from './pages/coupons/CouponList';
import CommissionList from './pages/commissions/CommissionList';
import CVRequestList from './pages/cv-requests/CVRequestList';
import PlanList from './pages/plans/PlanList';
import CatalogList from './pages/catalogs/CatalogList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#dc004e'
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route
                  path="admins"
                  element={
                    <ProtectedRoute roles="super_admin">
                      <AdminList />
                    </ProtectedRoute>
                  }
                />
                <Route path="employees" element={<EmployeeList />} />
                <Route path="employers" element={<EmployerList />} />
                <Route path="jobs" element={<JobList />} />
                <Route
                  path="coupons"
                  element={
                    <ProtectedRoute roles="super_admin">
                      <CouponList />
                    </ProtectedRoute>
                  }
                />
                <Route path="commissions" element={<CommissionList />} />
                <Route path="cv-requests" element={<CVRequestList />} />
                <Route
                  path="plans"
                  element={
                    <ProtectedRoute roles={['super_admin', 'plan_upgrade_manager']}>
                      <PlanList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="catalogs"
                  element={
                    <ProtectedRoute roles={['super_admin', 'catalog_manager']}>
                      <CatalogList />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
