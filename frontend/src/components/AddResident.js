import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

function AddResident() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    mutuelle_id: '',
    niss: '',
    medecin_traitant_id: '',
    room_number: ''
  });
  const [mutuelles, setMutuelles] = useState([]);
  const [filteredMutuelles, setFilteredMutuelles] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [filteredMedecins, setFilteredMedecins] = useState([]);
  const [mutuelleSearch, setMutuelleSearch] = useState('');
  const [medecinSearch, setMedecinSearch] = useState('');
  const [isMutuelleInputActive, setIsMutuelleInputActive] = useState(false);
  const [isMedecinInputActive, setIsMedecinInputActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mutuellesResponse, medecinsResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/mutuelles', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch('http://127.0.0.1:8000/medecins', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
        ]);
        if (!mutuellesResponse.ok) {
          throw new Error('Erreur lors de la récupération des mutuelles');
        }
        if (!medecinsResponse.ok) {
          throw new Error('Erreur lors de la récupération des médecins');
        }
        const mutuellesData = await mutuellesResponse.json();
        const medecinsData = await medecinsResponse.json();
        setMutuelles(mutuellesData);
        setFilteredMutuelles(mutuellesData);
        setMedecins(medecinsData);
        setFilteredMedecins(medecinsData);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isMutuelleInputActive) {
      const filtered = mutuelles.filter((mut) => mut.name.toLowerCase().includes(mutuelleSearch.toLowerCase()));
      setFilteredMutuelles(filtered);
    }
  }, [mutuelleSearch, mutuelles, isMutuelleInputActive]);

  useEffect(() => {
    if (isMedecinInputActive) {
      const filtered = medecins.filter((med) => med.name.toLowerCase().includes(medecinSearch.toLowerCase()));
      setFilteredMedecins(filtered);
    }
  }, [medecinSearch, medecins, isMedecinInputActive]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMutuelleSelect = (mutuelle) => {
    setFormData({ ...formData, mutuelle_id: mutuelle.id });
    setMutuelleSearch(mutuelle.name);
    setFilteredMutuelles([]);
    setIsMutuelleInputActive(false);
  };

  const handleMedecinSelect = (medecin) => {
    setFormData({ ...formData, medecin_traitant_id: medecin.id });
    setMedecinSearch(medecin.name);
    setFilteredMedecins([]);
    setIsMedecinInputActive(false);
  };

  const handleMutuelleClear = () => {
    setFormData({ ...formData, mutuelle_id: '' });
    setMutuelleSearch('');
    setFilteredMutuelles([]);
    setIsMutuelleInputActive(false);
  };

  const handleMedecinClear = () => {
    setFormData({ ...formData, medecin_traitant_id: '' });
    setMedecinSearch('');
    setFilteredMedecins([]);
    setIsMedecinInputActive(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du résident');
      }
      setSuccess('Résident ajouté avec succès !');
      setTimeout(() => navigate('/residents'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="add-resident-container">
      <h2>Ajouter un résident</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom</label>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Prénom</label>
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Date de naissance</label>
          <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Mutuelle</label>
          <div className="input-with-clear">
            <input
              type="text"
              placeholder="Rechercher une mutuelle..."
              value={mutuelleSearch}
              onChange={(e) => {
                setMutuelleSearch(e.target.value);
                setIsMutuelleInputActive(true);
              }}
              onFocus={() => setIsMutuelleInputActive(true)}
              required
            />
            {mutuelleSearch && (
              <button type="button" className="clear-button" onClick={handleMutuelleClear}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {isMutuelleInputActive && filteredMutuelles.length > 0 && (
            <ul className="suggestions">
              {filteredMutuelles.map((mut) => (
                <li key={mut.id} onClick={() => handleMutuelleSelect(mut)}>
                  {mut.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-group">
          <label>NISS</label>
          <input type="text" name="niss" value={formData.niss} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Médecin traitant</label>
          <div className="input-with-clear">
            <input
              type="text"
              placeholder="Rechercher un médecin..."
              value={medecinSearch}
              onChange={(e) => {
                setMedecinSearch(e.target.value);
                setIsMedecinInputActive(true);
              }}
              onFocus={() => setIsMedecinInputActive(true)}
              required
            />
            {medecinSearch && (
              <button type="button" className="clear-button" onClick={handleMedecinClear}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {isMedecinInputActive && filteredMedecins.length > 0 && (
            <ul className="suggestions">
              {filteredMedecins.map((med) => (
                <li key={med.id} onClick={() => handleMedecinSelect(med)}>
                  {med.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-group">
          <label>Numéro de chambre</label>
          <input type="number" name="room_number" value={formData.room_number} onChange={handleChange} required />
        </div>
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default AddResident;