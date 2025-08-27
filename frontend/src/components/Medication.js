import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import '../styles/styles.css';

function Medications({ userRole, showForm = false }) {
  const [residents, setResidents] = useState([]);
  const [medications, setMedications] = useState([]);
  const [patientMedications, setPatientMedications] = useState([]);
  const [form, setForm] = useState({
    resident_id: '',
    medication_id: '',
    dosage: '',
    time_of_day: [],
    frequency: '',
    status: 0
  });
  const [formValid, setFormValid] = useState({
    resident_id: true,
    medication_id: true,
    dosage: true,
    time_of_day: true,
    frequency: true
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(showForm);
  const navigate = useNavigate();

  const dosageOptions = [
    { value: '50 mg', label: '50 mg' },
    { value: '100 mg', label: '100 mg' },
    { value: '500 mg', label: '500 mg' },
    { value: '1 g', label: '1 g' }
  ];

  const frequencyOptions = [
    { value: 'quotidien', label: 'Quotidien' },
    { value: 'toutes les 6h', label: 'Toutes les 6h' },
    { value: 'toutes les 8h', label: 'Toutes les 8h' },
    { value: 'toutes les 12h', label: 'Toutes les 12h' },
    { value: 'hebdomadaire', label: 'Hebdomadaire' }
  ];

  useEffect(() => {
    if (!['Infirmière', 'Directeur', 'Cheffe Infirmière'].includes(userRole)) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const [residentsResponse, medicationsResponse] = await Promise.all([
          axios.get('http://localhost:8000/residents'),
          axios.get('http://localhost:8000/medications')
        ]);
        console.log('Réponse résidents:', residentsResponse.data);
        console.log('Réponse médicaments:', medicationsResponse.data);
        setResidents(residentsResponse.data || []);
        setMedications(medicationsResponse.data.medications || []);
        setPatientMedications(medicationsResponse.data.patient_medications || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Erreur de chargement des données');
        console.error('Erreur fetchData:', err.response || err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userRole, navigate]);

  useEffect(() => {
    setFormValid({
      resident_id: form.resident_id !== '',
      medication_id: form.medication_id !== '',
      dosage: form.dosage !== '',
      time_of_day: form.time_of_day.length > 0,
      frequency: form.frequency !== ''
    });
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resident_id || !form.medication_id || !form.dosage || !form.time_of_day.length || !form.frequency) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        resident_id: parseInt(form.resident_id),
        medication_id: form.medication_id,
        dosage: form.dosage,
        time_of_day: form.time_of_day.join(','),
        frequency: form.frequency,
        status: form.status
      };
      if (editingId) {
        await axios.put(`http://localhost:8000/medications/${editingId}`, payload);
        setSuccess('Prescription mise à jour avec succès');
      } else {
        await axios.post('http://localhost:8000/medications', payload);
        setSuccess('Prescription ajoutée avec succès');
      }
      const response = await axios.get('http://localhost:8000/medications');
      setPatientMedications(response.data.patient_medications || []);
      setForm({ resident_id: '', medication_id: '', dosage: '', time_of_day: [], frequency: '', status: 0 });
      setEditingId(null);
      setFormVisible(false);
      navigate('/medications');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'opération');
      console.error('Erreur handleSubmit:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (med) => {
    setForm({
      resident_id: med.resident_id.toString(),
      medication_id: med.medication_id,
      dosage: med.dosage,
      time_of_day: med.time_of_day ? med.time_of_day.split(',') : [],
      frequency: med.frequency,
      status: med.status
    });
    setEditingId(med.id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`http://localhost:8000/medications/${id}`);
      setSuccess('Prescription supprimée avec succès');
      const response = await axios.get('http://localhost:8000/medications');
      setPatientMedications(response.data.patient_medications || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression');
      console.error('Erreur handleDelete:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const med = patientMedications.find(m => m.id === id) || {};
      await axios.put(`http://localhost:8000/medications/${id}`, {
        resident_id: parseInt(med.resident_id || form.resident_id || 0),
        medication_id: med.medication_id || form.medication_id || '',
        dosage: med.dosage || form.dosage || '',
        time_of_day: (med.time_of_day || form.time_of_day.join(',')) || '',
        frequency: med.frequency || form.frequency || '',
        status: 1
      });
      setSuccess('Prescription validée avec succès');
      const response = await axios.get('http://localhost:8000/medications');
      setPatientMedications(response.data.patient_medications || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la validation');
      console.error('Erreur handleValidate:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      time_of_day: e.target.checked
        ? [...prev.time_of_day, value]
        : prev.time_of_day.filter(t => t !== value)
    }));
  };

  return (
    <div className="main-content">
      <div className="container">
        <h2 className="page-title">Gestion des Médicaments</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        {loading && <p className="loading-message">Chargement...</p>}
        {formVisible && (
          <div className="form-container">
            <form onSubmit={handleSubmit} className="form-container">
              <div className="form-group">
                <label className="form-label">Résident</label>
                <select
                  value={form.resident_id}
                  onChange={(e) => setForm({ ...form, resident_id: e.target.value })}
                  className={`form-select ${formValid.resident_id ? 'valid' : form.resident_id ? 'invalid' : ''}`}
                  required
                >
                  <option value="">Sélectionner un résident</option>
                  {residents.map(resident => (
                    <option key={resident.id} value={resident.id}>{resident.nom} {resident.prenom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Médicament</label>
                <Select
                  options={medications.map(med => ({ value: med.id, label: `${med.name} (${med.active_ingredient})` }))}
                  onChange={(option) => setForm({ ...form, medication_id: option ? option.value : '' })}
                  placeholder="Rechercher un médicament..."
                  classNamePrefix="react-select"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Posologie</label>
                <select
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                  className={`form-select ${formValid.dosage ? 'valid' : form.dosage ? 'invalid' : ''}`}
                  required
                >
                  <option value="">Sélectionner une posologie</option>
                  {dosageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Moment de la journée</label>
                <div className="checkbox-group">
                  {['matin', 'midi', 'soir', 'nuit'].map(time => (
                    <label key={time} className="checkbox-label">
                      <input
                        type="checkbox"
                        value={time}
                        checked={form.time_of_day.includes(time)}
                        onChange={handleTimeChange}
                        className="form-checkbox"
                      />
                      <span className="checkbox-text">{time.charAt(0).toUpperCase() + time.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fréquence</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className={`form-select ${formValid.frequency ? 'valid' : form.frequency ? 'invalid' : ''}`}
                  required
                >
                  <option value="">Sélectionner une fréquence</option>
                  {frequencyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="action-buttons">
                <button type="submit" className="button button-full" disabled={loading}>
                  {editingId ? <PencilIcon className="icon-button-svg" /> : <PlusIcon className="icon-button-svg" />}
                  {editingId ? 'Modifier' : 'Ajouter'} la prescription
                </button>
                <button
                  type="button"
                  onClick={() => { setFormVisible(false); setEditingId(null); navigate('/medications'); }}
                  className="button button-full"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}
        {!formVisible && (
          <div className="card">
            <h3 className="section-title">Prescriptions en cours</h3>
            <table className="table-auto">
              <thead>
                <tr>
                  <th>Résident</th>
                  <th>Médicament</th>
                  <th>Posologie</th>
                  <th>Moment</th>
                  <th>Fréquence</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patientMedications.map(med => (
                  <tr key={med.id}>
                    <td>{med.nom} {med.prenom}</td>
                    <td>
                      {med.name} ({med.active_ingredient})
                      <a href={med.cbip_link} target="_blank" rel="noopener noreferrer" className="icon-link">
                        <GlobeAltIcon className="icon-button-svg" />
                      </a>
                    </td>
                    <td>{med.dosage}</td>
                    <td>{med.time_of_day}</td>
                    <td>{med.frequency}</td>
                    <td>{med.status ? 'Validé' : 'Non validé'}</td>
                    <td>
                      <button onClick={() => handleEdit(med)} className="icon-button">
                        <PencilIcon className="icon-button-svg" />
                      </button>
                      <button onClick={() => handleDelete(med.id)} className="icon-button">
                        <TrashIcon className="icon-button-svg" />
                      </button>
                      {!med.status && (
                        <button onClick={() => handleValidate(med.id)} className="icon-button">
                          <CheckIcon className="icon-button-svg" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Medications;