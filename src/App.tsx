import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { LawyerDashboard } from './pages/lawyer/LawyerDashboard';
import { useAuthStore } from './store/authStore';
import { CaseList } from './pages/cases/CaseList';
import {CaseDetail}  from './pages/cases/CaseDetail';
import Messages  from './pages/messages/Messages';
import { Appointments } from './pages/appointments/Appointments';
import { Documents } from './pages/documents/Documents';
import { Invoices } from './pages/invoices/Invoices';
import { Notifications } from './pages/messages/Notifications';
import  { Settings } from './pages/settings/settings';
//import { Profile } from './pages/profiler/profile';
import  PaytmButton from './pages/payment/Pay';

import SuccessPage from './pages/payment/success';
import FailurePage from './pages/payment/failed';
import { ClientListPage } from './pages/lawyer/clientPage';
import { ClientDetailPage } from './pages/lawyer/ClientDetailPage';
import { CaseManagementPage } from './pages/lawyer/casemanagement';
import { LawyerAnalyticsPage } from './pages/lawyer/lawyeranalyst';
import PaymentPage from './pages/payment/Pay';
import { Profile } from './pages/profiler/profile';
import LawyerProfile from './pages/profiler/lawyerprofiler';
import { LawyerListPage } from './pages/client/lawyerlist';
import { LawyerDetailPage } from './pages/client/lawyersingledetail';
import LawyerCaseRequestsPage from './pages/request/request';
import ClientProfile from './pages/profiler/clientprofiler';


const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'client' | 'lawyer' }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard'} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile/:id" element={<LawyerProfile />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<div>Forgot Password Page (Coming Soon)</div>} />

        {/* Client routes */}
        <Route path="/client" element={
          <ProtectedRoute role="client">
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="client/:id" element={<ClientProfile/>} />
          <Route path="lawyers" element={<LawyerListPage />} />
<Route path="lawyers/detail/:id" element={<LawyerDetailPage />} />

          <Route path="lawyer/:id" element={<Profile />} />
          <Route path="cases" element={<CaseList/>} />
          <Route path="cases/:id" element={<CaseDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="request" element={<LawyerCaseRequestsPage />} />
          {/* <Route path="appointments" element={<Appointments />} /> */}
          {/* <Route path="documents" element={<Documents />} /> */}
          {/* <Route path="invoices" element={<Invoices />} />
          <Route path="notifications" element={<Notifications/>} />
          <Route path="settings" element={<Settings/>} /> */}
          
        </Route>

        {/* Lawyer routes */}
        <Route path="/lawyer" element={
          <ProtectedRoute role="lawyer">
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<LawyerDashboard />} />
          <Route path="lawyer/:id" element={<Profile />} />
          <Route path="clients" element={<ClientListPage/>} />
          <Route path="clients/:id" element={<ClientDetailPage/>} />
          <Route path="cases" element={<CaseList/>} />
          <Route path="cases/:id" element={<CaseDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="request" element={<LawyerCaseRequestsPage />} />
          {/* <Route path="analytics" element={<LawyerAnalyticsPage />} /> */}
          <Route path="documents" element={<Documents />} />
          <Route path="invoices" element={<Invoices />} />
          {/* <Route path="notifications" element={<Notifications/>} />
          <Route path="settings" element={<Settings/>} /> */}
          
        </Route>
        <Route>
          
     
        <Route path="/payment/pay" element={<PaymentPage />} />
        <Route path="/payment/success" element={<SuccessPage />} />
        <Route path="/payment/failure" element={<FailurePage />} />
       
      
    
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div>404 Not Found</div>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;