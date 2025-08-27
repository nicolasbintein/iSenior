import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import logo from '../assets/logo_isenior.png';
import '../styles/chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState('');
  const username = useSelector((state) => state.auth?.user?.username) || 'bintein_nicolas';
  const [firstName, lastName] = username.split('_').map(name => name.charAt(0).toUpperCase() + name.slice(1));
  const role = useSelector((state) => state.auth?.user?.role);
  const messagesEndRef = useRef(null); // Référence pour scroller au bas

  useEffect(() => {
    if (role) {
      setMessages([{ text: `Bonjour <strong>${firstName} ${lastName}</strong>, Comment puis-je t'aider?`, sent: false }]);
    }
  }, [role, firstName, lastName]);

  useEffect(() => {
    // Scroll automatique au dernier message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageToBackend = async (message) => {
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log("Réponse backend:", data);
      return data.reply;
    } catch (err) {
      setError(`Erreur : ${err.message}`);
      return 'Désolé, je ne peux pas répondre pour le moment.';
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() && role) {
      setMessages((prev) => [...prev, { text: inputMessage, sent: true }]);
      const reply = await sendMessageToBackend(inputMessage);
      setMessages((prev) => {
        const newMessages = [...prev, { text: reply, sent: false }];
        // Limite à 10 messages pour éviter le débordement
        return newMessages.slice(-10);
      });
      setInputMessage('');
    }
  };

  if (!role) return <Navigate to="/login" replace />;

  return (
    <div className="appointments-container">
      <img src={logo} alt="SeniorAI Logo" className="chat-logo" style={{ filter: 'brightness(0) invert(1)' }} />
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sent ? 'sent-message' : 'received-message'} dangerouslySetInnerHTML={{ __html: msg.text }} />
        ))}
        <div ref={messagesEndRef} /> {/* Ancre pour le scroll */}
      </div>
      <div className="chat-footer">
        <div className="form-group">
          <div className="message-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tapez votre question..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="prompt-input"
            />
            <span className="input-suffix">
              <PaperAirplaneIcon className="h-5 w-5" style={{ color: '#b0b0b0' }} onClick={handleSendMessage} />
            </span>
          </div>
        </div>
        <div className="footer-text">iSenior Propulsé par ChatGPT</div>
      </div>
      {error && <div className="alert error">{error}</div>}
    </div>
  );
}

export default Chat;