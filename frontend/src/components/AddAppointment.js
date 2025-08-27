import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import '../styles/views.css';

function AddAppointment() {
  const [formData, setFormData] = useState({
    resident_id: '',
    date: '',
    time: '',
    reason: '',
    transporteur: '',
    heure_transport: ''
  });
  const [residents, setResidents] = useState([]);
  const [motifs, setMotifs] = useState([]);
  const [filteredMotifs, setFilteredMotifs] = useState([]);
  const [motifSearch, setMotifSearch] = useState('');
  const [isMotifInputActive, setIsMotifInputActive] = useState(false);
  const [residentSearch, setResidentSearch] = useState('');
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [isResidentInputActive, setIsResidentInputActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [residentsResponse, motifsResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/residents', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch('http://127.0.0.1:8000/motifs', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
        ]);
        if (!residentsResponse.ok) throw new Error('Erreur lors de la récupération des résidents');
        if (!motifsResponse.ok) throw new Error('Erreur lors de la récupération des motifs');
        const residentsData = await residentsResponse.json();
        const motifsData = await motifsResponse.json();
        setResidents(residentsData);
        setMotifs(motifsData);
        setFilteredMotifs(motifsData);
        setFilteredResidents(residentsData);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isMotifInputActive) {
      const filtered = motifs.filter((mot) => mot.name.toLowerCase().includes(motifSearch.toLowerCase()));
      setFilteredMotifs(filtered);
    }
  }, [motifSearch, motifs, isMotifInputActive]);

  useEffect(() => {
    if (isResidentInputActive) {
      const filtered = residents.filter((res) =>
        `${res.prenom} ${res.nom}`.toLowerCase().includes(residentSearch.toLowerCase())
      );
      setFilteredResidents(filtered);
    }
  }, [residentSearch, residents, isResidentInputActive]);

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

  const handleResidentSelect = (resident) => {
    setFormData({ ...formData, resident_id: resident.id });
    setResidentSearch(`${resident.prenom} ${resident.nom}`);
    setFilteredResidents([]);
    setIsResidentInputActive(false);
  };

  const handleResidentClear = () => {
    setFormData({ ...formData, resident_id: '' });
    setResidentSearch('');
    setFilteredResidents([]);
    setIsResidentInputActive(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Erreur lors de l\'ajout du rendez-vous');
      setSuccess('Rendez-vous ajouté avec succès !');
      setError('');
      setTimeout(() => navigate('/appointments'), 1500);
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <div className="add-appointment-container">
      <h2>Ajouter un rendez-vous</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Résident</label>
          <div className="input-with-clear enhanced-select">
            <input
              type="text"
              placeholder="Rechercher un résident..."
              value={residentSearch}
              onChange={(e) => {
                setResidentSearch(e.target.value);
                setIsResidentInputActive(true);
              }}
              onFocus={() => setIsResidentInputActive(true)}
              required
            />
            {residentSearch && (
              <button type="button" className="clear-button" onClick={handleResidentClear}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            {isResidentInputActive && filteredResidents.length > 0 && (
              <ul className="suggestions enhanced-suggestions">
                {filteredResidents.map((resident) => (
                  <li key={resident.id} onClick={() => handleResidentSelect(resident)}>
                    {`${resident.prenom} ${resident.nom}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default AddAppointment;