import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import '../styles/views.css';

function EditAppointment() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    transporteur: '',
    heure_transport: ''
  });
  const [residentName, setResidentName] = useState('');
  const [motifs, setMotifs] = useState([]);
  const [filteredMotifs, setFilteredMotifs] = useState([]);
  const [motifSearch, setMotifSearch] = useState('');
  const [isMotifInputActive, setIsMotifInputActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [appointmentData, setAppointmentData] = useState(null); // Ajout de l'état pour appointmentData
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentResponse, motifsResponse] = await Promise.all([
          fetch(`http://127.0.0.1:8000/appointments/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch('http://127.0.0.1:8000/motifs', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
        ]);
        if (!appointmentResponse.ok) throw new Error('Erreur lors de la récupération du rendez-vous');
        if (!motifsResponse.ok) throw new Error('Erreur lors de la récupération des motifs');
        const fetchedAppointmentData = await appointmentResponse.json();
        const motifsData = await motifsResponse.json();
        setFormData({
          date: fetchedAppointmentData.date,
          time: fetchedAppointmentData.time,
          reason: fetchedAppointmentData.reason,
          transporteur: fetchedAppointmentData.transporteur || '',
          heure_transport: fetchedAppointmentData.heure_transport || ''
        });
        setResidentName(fetchedAppointmentData.resident_name || 'Inconnu');
        setMotifs(motifsData);
        setFilteredMotifs(motifsData);
        setMotifSearch(fetchedAppointmentData.reason);
        setAppointmentData(fetchedAppointmentData); // Stocke les données dans l'état
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (isMotifInputActive) {
      const filtered = motifs.filter((mot) => mot.name.toLowerCase().includes(motifSearch.toLowerCase()));
      setFilteredMotifs(filtered);
    }
  }, [motifSearch, motifs, isMotifInputActive]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMotifSelect = (motif) => {
    setFormData({ ...formData, reason: motif.name });
    setMotifSearch(motif.name);
    setFilteredMotifs([]);
    setIsMotifInputActive(false);
  };

  const handleMotifClear = () => {
    setFormData({ ...formData, reason: '' });
    setMotifSearch('');
    setFilteredMotifs([]);
    setIsMotifInputActive(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!appointmentData) throw new Error('Données du rendez-vous non chargées');
      const response = await fetch(`http://127.0.0.1:8000/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          resident_id: appointmentData.resident_id // Utilise la valeur stockée
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur ${response.status}: ${errorData.detail || 'Données invalides'}`);
      }
      setSuccess('Rendez-vous modifié avec succès !');
      setError('');
      setTimeout(() => navigate('/appointments'), 1500);
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <div className="edit-appointment-container">
      <h2>Modifier le rendez-vous</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Résident</label>
          <p>{residentName}</p>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Heure</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Motif</label>
          <div className="input-with-clear">
            <input
              type="text"
              placeholder="Rechercher un motif..."
              value={motifSearch}
              onChange={(e) => {
                setMotifSearch(e.target.value);
                setIsMotifInputActive(true);
              }}
              onFocus={() => setIsMotifInputActive(true)}
              required
            />
            {motifSearch && (
              <button type="button" className="clear-button" onClick={handleMotifClear}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {isMotifInputActive && filteredMotifs.length > 0 && (
            <ul className="suggestions">
              {filteredMotifs.map((mot) => (
                <li key={mot.id} onClick={() => handleMotifSelect(mot)}>
                  {mot.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-group">
          <label>Transporteur</label>
          <input type="text" name="transporteur" value={formData.transporteur} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Heure de transport</label>
          <input type="time" name="heure_transport" value={formData.heure_transport} onChange={handleChange} />
        </div>
        <button type="submit">Modifier</button>
      </form>
    </div>
  );
}

export default EditAppointment;