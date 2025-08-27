import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { UserGroupIcon, CalendarIcon, BeakerIcon, ChatBubbleLeftIcon, ArrowLeftOnRectangleIcon, BarsArrowUpIcon, BarsArrowDownIcon } from '@heroicons/react/24/outline';
import Login from './components/Login';
import Register from './components/Register';
import Residents from './components/Residents';
import Appointments from './components/Appointments';
import Users from './components/Users';
import Chat from './components/Chat';
import Medications from './components/Medications';
import AddResident from './components/AddResident';
import AddAppointment from './components/AddAppointment';
import EditResident from './components/EditResident';
import EditAppointment from './components/EditAppointment';
import AddMedication from './components/AddMedication';
import EditMedication from './components/EditMedication';
import VerifyEmail from './components/VerifyEmail';
import logo from './assets/logo_isenior.png';
import './styles/styles.css';

function App() {
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Rôle chargé :', role);
    console.log('Utilisateur chargé :', username);
    console.log('Page actuelle :', location.pathname);
    if (role && ['/login', '/register', '/'].includes(location.pathname)) {
      navigate('/residents', { replace: true });
    }
  }, [role, location.pathname, navigate, username]);

  const handleLogin = (newRole, newUsername) => {
    setRole(newRole);
    setUsername(newUsername);
    localStorage.setItem('role', newRole);
    localStorage.setItem('username', newUsername);
    console.log('Réponse API login:', { role: newRole, username: newUsername });
    navigate('/residents', { replace: true });
  };

  const handleLogout = () => {
    setRole(null);
    setUsername('');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    console.log('Déconnexion effectuée');
    navigate('/login', { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isLoginPage = ['/login', '/register'].includes(location.pathname) || location.pathname.startsWith('/verify-email');
  const isResidentsPage = location.pathname.startsWith('/residents');
  const isAppointmentsPage = location.pathname.startsWith('/appointments');
  const isMedicationsPage = location.pathname.startsWith('/medications');
  const isUsersPage = location.pathname.startsWith('/users');
  const isChatPage = location.pathname.startsWith('/chat');

  const [firstName, lastName] = username ? username.split('_').map(name => name.charAt(0).toUpperCase() + name.slice(1)) : ['', ''];

  return (
    <div className="app">
      <main className={isLoginPage ? 'login-main' : `main-content ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
        {!isLoginPage && role && (
          <nav className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              {isSidebarOpen ? <BarsArrowDownIcon className="h-5 w-5" /> : <BarsArrowUpIcon className="h-5 w-5" />}
            </button>
            <ul>
              <li>
                <a href="/residents" className={isResidentsPage ? 'active' : ''}>
                  <UserGroupIcon className="h-5 w-5 icon" />
                  <span>Résidents</span>
                </a>
              </li>
              <li>
                <a href="/appointments" className={isAppointmentsPage ? 'active' : ''}>
                  <CalendarIcon className="h-5 w-5 icon" />
                  <span>Rendez-vous</span>
                </a>
              </li>
              <li>
                <a href="/medications" className={isMedicationsPage ? 'active' : ''}>
                  <BeakerIcon className="h-5 w-5 icon" />
                  <span>Médicaments</span>
                </a>
              </li>
              {role === 'Directeur' && (
                <li>
                  <a href="/users" className={isUsersPage ? 'active' : ''}>
                    <UserGroupIcon className="h-5 w-5 icon" />
                    <span>Utilisateurs</span>
                  </a>
                </li>
              )}
              <li>
                <a href="/chat" className={isChatPage ? 'active' : ''}>
                  <ChatBubbleLeftIcon className="h-5 w-5 icon" />
                  <span>Chat</span>
                </a>
              </li>
              <li className="logo-item">
                <div className="sidebar-logo">
                  <img src={logo} alt="Logo Isenior" className="sidebar-logo-img" />
                </div>
              </li>
              <li className="logout-item">
                <span className="username">{`${firstName} ${lastName}`}</span>
                <button onClick={handleLogout} className="logout-button">
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 icon" />
                </button>
              </li>
            </ul>
          </nav>
        )}
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/residents" element={role ? <Residents /> : <Navigate to="/login" replace />} />
            <Route path="/residents/:id" element={role ? <Residents /> : <Navigate to="/login" replace />} />
            <Route path="/residents/new" element={role ? <AddResident /> : <Navigate to="/login" replace />} />
            <Route path="/residents/:id/edit" element={role ? <EditResident /> : <Navigate to="/login" replace />} />
            <Route path="/appointments" element={role ? <Appointments /> : <Navigate to="/login" replace />} />
            <Route path="/appointments/new" element={role ? <AddAppointment /> : <Navigate to="/login" replace />} />
            <Route path="/appointments/:id" element={role ? <EditAppointment /> : <Navigate to="/login" replace />} />
            <Route path="/medications" element={role ? <Medications /> : <Navigate to="/login" replace />} />
            <Route path="/medications/new" element={role ? <AddMedication /> : <Navigate to="/login" replace />} />
            <Route path="/medications/:id" element={role ? <EditMedication /> : <Navigate to="/login" replace />} />
            <Route path="/users" element={role === 'Directeur' ? <Users /> : <Navigate to="/login" replace />} />
            <Route path="/chat" element={role ? <Chat /> : <Navigate to="/login" replace />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </Router>
  );
}