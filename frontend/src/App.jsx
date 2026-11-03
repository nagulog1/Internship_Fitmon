import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthBootstrap from './hooks/useAuthBootstrap';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Mentor from './pages/Mentor';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Report from './pages/Report';
import Session from './pages/Session';
import Workout from './pages/Workout';

export default function App() {
  useAuthBootstrap();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute roles={['trainee']} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/session" element={<Session />} />
            <Route path="/report/:id" element={<Report />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route path="/workout" element={<Workout />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['mentor']} />}>
          <Route element={<AppLayout />}>
            <Route path="/mentor" element={<Mentor />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
