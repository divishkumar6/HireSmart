import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import RecruiterDashboard from './RecruiterDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminDashboard /> : <RecruiterDashboard />;
}
