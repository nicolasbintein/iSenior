import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditMedication() {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/medications/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Erreur lors de la récupération du médicament');
        const data = await response.json();
        setFormData(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchMedication();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8000/medications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Erreur lors de la modification du médicament');
      setSuccess('Médicament modifié avec succès !');
      setTimeout(() => navigate('/medications'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="edit-medication-container">
      <h2>Modifier le médicament</h2>
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
          <label>Heure</label>
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
        <button type="submit">Modifier</button>
      </form>
    </div>
  );
}

export default EditMedication;