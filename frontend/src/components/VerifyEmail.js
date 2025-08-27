import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/styles.css';

function VerifyEmail() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/auth/verify-email/${token}`);
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setError(err.response?.data?.detail || 'Erreur lors de la vérification de l\'e-mail');
        console.error('Erreur verifyEmail:', err.response || err);
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-card">
          <h2 className="page-title">Vérification de l'e-mail</h2>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;