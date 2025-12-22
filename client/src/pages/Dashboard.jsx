import { useAuth } from '../context/AuthContext';
import CustomerDashboard from '../components/CustomerDashboard';
import OrganiserDashboard from '../components/OrganiserDashboard';
import AdminDashboard from '../components/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'organiser') {
    return <OrganiserDashboard />;
  }

  return <CustomerDashboard />;
};

export default Dashboard;
