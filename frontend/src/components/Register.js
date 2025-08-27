import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import '../styles/views.css';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Personnel');
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [roleSearch, setRoleSearch] = useState('');
  const [isRoleInputActive, setIsRoleInputActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validateEmail = useCallback((email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }, []);

  const validateUsername = useCallback((username) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  }, []);

  const validatePassword = useCallback((password) => {
    return password.length >= 6;
  }, []);

  const validateConfirmPassword = useCallback((password, confirmPassword) => {
    return password === confirmPassword;
  }, []);

  useEffect(() => {
    setError('');
    if (email && !validateEmail(email)) {
      setError('Email invalide');
    } else if (username && !validateUsername(username)) {
      setError('Le nom d’utilisateur doit contenir au moins 3 caractères alphanumériques');
    } else if (password && !validatePassword(password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
    } else if (password && confirmPassword && !validateConfirmPassword(password, confirmPassword)) {
      setError('Les mots de passe ne correspondent pas');
    }
  }, [email, username, password, confirmPassword, validateEmail, validateUsername, validatePassword, validateConfirmPassword]);

  useEffect(() => {
    if (isRoleInputActive) {
      const roles = ['Directeur', 'Infirmier Cheffe', 'Infirmier', 'Kiné', 'Ergo', 'Logo', 'Diététicien', 'Aide-Soignant'];
      const filtered = roles.filter((r) => r.toLowerCase().includes(roleSearch.toLowerCase()));
      setFilteredRoles(filtered);
    }
  }, [roleSearch, isRoleInputActive]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }
    if (!validateUsername(username)) {
      setError('Le nom d’utilisateur doit contenir au moins 3 caractères alphanumériques');
      return;
    }
    if (!validatePassword(password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (!validateConfirmPassword(password, confirmPassword)) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, role })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l’inscription');
      }
      setSuccess('Inscription réussie ! Vérifiez votre email pour activer votre compte.');
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setRoleSearch(selectedRole);
    setFilteredRoles([]);
    setIsRoleInputActive(false);
  };

  const handleRoleClear = () => {
    setRole('Personnel');
    setRoleSearch('');
    setFilteredRoles([]);
    setIsRoleInputActive(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Inscription</h2>
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Rôle</label>
            <div className="input-with-clear enhanced-select">
              <input
                type="text"
                placeholder="Sélectionner un rôle..."
                value={roleSearch}
                onChange={(e) => {
                  setRoleSearch(e.target.value);
                  setIsRoleInputActive(true);
                }}
                onFocus={() => setIsRoleInputActive(true)}
                required
              />
              {roleSearch && (
                <button type="button" className="clear-button" onClick={handleRoleClear}>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
              {isRoleInputActive && filteredRoles.length > 0 && (
                <ul className="suggestions enhanced-suggestions">
                  {filteredRoles.map((r) => (
                    <li key={r} onClick={() => handleRoleSelect(r)}>
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button type="submit">S'inscrire</button>
        </form>
        <p className="register-link">
          Déjà un compte ? <a href="/login">Connectez-vous</a>
        </p>
      </div>
    </div>
  );
}

export default Register;