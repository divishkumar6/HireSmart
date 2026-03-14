import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import Background3D from './components/3d/Background3D';

const Login          = lazy(() => import('./pages/Login'));
const Register       = lazy(() => import('./pages/Register'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const Drives         = lazy(() => import('./pages/Drives'));
const DriveForm      = lazy(() => import('./pages/DriveForm'));
const DriveDetails   = lazy(() => import('./pages/DriveDetails'));
const Candidates     = lazy(() => import('./pages/Candidates'));
const CandidateForm  = lazy(() => import('./pages/CandidateForm'));
const CandidateDetails = lazy(() => import('./pages/CandidateDetails'));
const Rankings       = lazy(() => import('./pages/Rankings'));
const Settings       = lazy(() => import('./pages/Settings'));
const ATSChecker     = lazy(() => import('./pages/ATSChecker'));
const AdminUsers     = lazy(() => import('./pages/AdminUsers'));
const AdminApprovals = lazy(() => import('./pages/AdminApprovals'));
const AddCandidates  = lazy(() => import('./pages/AddCandidates'));
const OfferLetter    = lazy(() => import('./pages/OfferLetter'));

const Spinner = () => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
    <div style={{ width:28, height:28, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.75s linear infinite' }} />
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard"                        element={<Dashboard />} />
                <Route path="/drives"                           element={<Drives />} />
                <Route path="/drives/new"                       element={<DriveForm />} />
                <Route path="/drives/:id"                       element={<DriveDetails />} />
                <Route path="/drives/:id/edit"                  element={<DriveForm />} />
                <Route path="/drives/:driveId/add-candidates"   element={<AddCandidates />} />
                <Route path="/candidates"                       element={<Candidates />} />
                <Route path="/candidates/new"                   element={<CandidateForm />} />
                <Route path="/candidates/:id"                   element={<CandidateDetails />} />
                <Route path="/offer-letter/:candidateId"        element={<OfferLetter />} />
                <Route path="/rankings"                         element={<Rankings />} />
                <Route path="/ats-checker"                      element={<ATSChecker />} />
                <Route path="/admin/users"                      element={<AdminUsers />} />
                <Route path="/admin/approvals"                  element={<AdminApprovals />} />
                <Route path="/settings"                         element={<Settings />} />
                <Route path="*"                                 element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Background3D />
          <div style={{ position:'relative', zIndex:10 }}>
            <AppRoutes />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg2)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13,
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
