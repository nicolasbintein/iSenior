import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddMedication() {
  const [formData, setFormData] = useState({
    resident_id: '',
    medication_id: '',
    dosage: '',
    time_of_day: '',
    frequency: '',
    status: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du médicament');
      }
      setSuccess('Médicament ajouté avec succès !');
      setTimeout(() => navigate('/medications'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="add-medication-container">
      <h2>Ajouter un médicament</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID du résident</label>
          <input type="number" name="resident_id" value={formData.resident_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>ID du médicament</label>
          <input type="number" name="medication_id" value={formData.medication_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Dosage</label>
          <input type="text" name="dosage" value={formData.dosage} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Moment de la journée</label>
          <input type="text" name="time_of_day" value={formData.time_of_day} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Fréquence</label>
          <input type="text" name="frequency" value={formData.frequency} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Statut</label>
          <input type="number" name="status" value={formData.status} onChange={handleChange} required />
        </div>
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default AddMedication;