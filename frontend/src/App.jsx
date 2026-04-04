import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages
import Dashboard from './pages/Dashboard';

// Resources
import ResourceHub from './pages/resources/ResourceHub';
import ResourceUpload from './pages/resources/ResourceUpload';
import LearningPaths from './pages/resources/LearningPaths';

// Finance
import FinanceTracker from './pages/finance/FinanceTracker';

// Opportunities
import Opportunities from './pages/opportunities/Opportunities';

// Local Navigator
import LocalNavigator from './pages/local/LocalNavigator';
import ServiceDetail from './pages/local/ServiceDetail';

// Marketplace
import Marketplace from './pages/marketplace/Marketplace';
import MarketplaceItem from './pages/marketplace/MarketplaceItem';
import AddListing from './pages/marketplace/AddListing';
import MyListings from './pages/marketplace/MyListings';

// Lost & Found
import LostFound from './pages/lostfound/LostFound';
import LostFoundPost from './pages/lostfound/LostFoundPost';
import AddLostFound from './pages/lostfound/AddLostFound';

// Campus
import CampusConnect from './pages/campus/CampusConnect';
import ClubDetail from './pages/campus/ClubDetail';
import CampusPost from './pages/campus/CampusPost';
import CreatePost from './pages/campus/CreatePost';

// Social
import StudentSocial from './pages/social/StudentSocial';
import StudentProfile from './pages/social/StudentProfile';
import Connections from './pages/social/Connections';

// Profile
import MyProfile from './pages/profile/MyProfile';
import EditProfile from './pages/profile/EditProfile';

// Private Route Guard
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="resources" element={<ResourceHub />} />
        <Route path="resources/upload" element={<ResourceUpload />} />
        <Route path="resources/learning-paths" element={<LearningPaths />} />

        <Route path="finance" element={<FinanceTracker />} />

        <Route path="opportunities" element={<Opportunities />} />

        <Route path="local" element={<LocalNavigator />} />
        <Route path="local/:id" element={<ServiceDetail />} />

        <Route path="marketplace" element={<Marketplace />} />
        <Route path="marketplace/add" element={<AddListing />} />
        <Route path="marketplace/my-listings" element={<MyListings />} />
        <Route path="marketplace/:id" element={<MarketplaceItem />} />

        <Route path="lostfound" element={<LostFound />} />
        <Route path="lostfound/add" element={<AddLostFound />} />
        <Route path="lostfound/:id" element={<LostFoundPost />} />

        <Route path="campus" element={<CampusConnect />} />
        <Route path="campus/clubs/:id" element={<ClubDetail />} />
        <Route path="campus/posts/:id" element={<CampusPost />} />
        <Route path="campus/create-post" element={<CreatePost />} />

        <Route path="social" element={<StudentSocial />} />
        <Route path="social/connections" element={<Connections />} />
        <Route path="social/:id" element={<StudentProfile />} />

        <Route path="profile" element={<MyProfile />} />
        <Route path="profile/edit" element={<EditProfile />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1C1C1C',
                color: '#F4F4F4',
                border: '1px solid #2E2E2E',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'DM Sans, sans-serif',
              },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
