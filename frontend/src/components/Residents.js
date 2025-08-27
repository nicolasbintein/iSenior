import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PencilIcon, TrashIcon, MagnifyingGlassIcon, UserPlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import '../styles/views.css';

function Residents() {
  const [residents, setResidents] = useState([]);
  const [mutuelles, setMutuelles] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [residentsResponse, mutuellesResponse, medecinsResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/residents', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch('http://127.0.0.1:8000/mutuelles', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch('http://127.0.0.1:8000/medecins', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
        ]);
        if (!residentsResponse.ok) throw new Error('Erreur lors de la récupération des résidents');
        if (!mutuellesResponse.ok) throw new Error('Erreur lors de la récupération des mutuelles');
        if (!medecinsResponse.ok) throw new Error('Erreur lors de la récupération des médecins');
        const residentsData = await residentsResponse.json();
        const mutuellesData = await mutuellesResponse.json();
        const medecinsData = await medecinsResponse.json();
        setResidents(residentsData);
        setFilteredResidents(residentsData);
        setMutuelles(mutuellesData);
        setMedecins(medecinsData);
        if (id) {
          fetchResidentData(parseInt(id));
        } else if (residentsData.length > 0) {
          setSelectedResident(residentsData[0]);
          fetchResidentData(residentsData[0].id);
        }
        setError('');
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const filtered = residents.filter((resident) =>
      `${resident.prenom} ${resident.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredResidents(filtered);
  }, [searchQuery, residents]);

  const fetchResidentData = async (residentId) => {
    try {
      const [residentResponse, apptResponse, medResponse] = await Promise.all([
        fetch(`http://127.0.0.1:8000/residents/${residentId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`http://127.0.0.1:8000/appointments?resident_id=${residentId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`http://127.0.0.1:8000/medications?resident_id=${residentId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);
      if (!residentResponse.ok) throw new Error('Erreur lors de la récupération du résident');
      if (!apptResponse.ok) throw new Error('Erreur lors de la récupération des rendez-vous');
      if (!medResponse.ok) throw new Error('Erreur lors de la récupération des médicaments');
      const residentData = await residentResponse.json();
      const apptData = await apptResponse.json();
      const medData = await medResponse.json();
      setSelectedResident({ ...residentData, appointments: apptData, medications: medData });
      setAppointments(apptData);
      setMedications(medData);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectResident = (resident) => {
    setSelectedResident(resident);
    if (resident) {
      fetchResidentData(resident.id);
    } else {
      setAppointments([]);
      setMedications([]);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/residents/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression du résident');
      setResidents(residents.filter((resident) => resident.id !== id));
      setFilteredResidents(filteredResidents.filter((resident) => resident.id !== id));
      if (selectedResident && selectedResident.id === id) {
        setSelectedResident(null);
        setAppointments([]);
        setMedications([]);
        navigate('/residents');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="residents-container">
      <div className="resident-sidebar">
        <div className="sidebar-title">
          <UserGroupIcon className="h-5 w-5 icon" />
          <span>Résidents</span>
        </div>
        <div className="search-bar">
          <MagnifyingGlassIcon className="h-5 w-5 search-icon" />
          <input
            type="text"
            placeholder="Rechercher un résident..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Link to="/residents/new" className="add-resident-button">
          <button className="action-button">
            <UserPlusIcon className="h-5 w-5 icon" />
          </button>
        </Link>
        <ul className="resident-list">
          {filteredResidents.map((resident) => (
            <li
              key={resident.id}
              className={`resident-item ${selectedResident && selectedResident.id === resident.id ? 'active' : ''}`}
              onClick={() => handleSelectResident(resident)}
            >
              {resident.prenom} {resident.nom}
            </li>
          ))}
        </ul>
      </div>
      {error && <div className="alert error">{error}</div>}
      {selectedResident && (
        <div className="resident-card">
          <div className="card-header">
            <h3>{selectedResident.prenom} {selectedResident.nom}</h3>
            <div className="card-actions">
              <Link to={`/residents/${selectedResident.id}/edit`}>
                <button className="action-button">
                  <PencilIcon className="h-5 w-5" />
                </button>
              </Link>
              <button
                className="action-button"
                onClick={() => handleDelete(selectedResident.id)}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="card-details">
            <p><strong>Date de naissance :</strong> {selectedResident.date_naissance}</p>
            <p><strong>Mutuelle :</strong> {mutuelles.find((mut) => mut.id === selectedResident.mutuelle_id)?.name || 'N/A'}</p>
            <p><strong>NISS :</strong> {selectedResident.niss}</p>
            <p><strong>Médecin traitant :</strong> {medecins.find((med) => med.id === selectedResident.medecin_traitant_id)?.name || 'N/A'}</p>
            <p><strong>Numéro de chambre :</strong> {selectedResident.room_number}</p>
            <div className="separator"></div>
            <div className="card-section">
              <h4>Rendez-vous</h4>
              {selectedResident.appointments && selectedResident.appointments.length > 0 ? (
                <ul className="data-list">
                  {selectedResident.appointments.map((appt) => (
                    <li key={appt.id}>
                      {appt.date} à {appt.time} - {appt.reason}
                      <div className="action-cell">
                        <Link to={`/appointments/${appt.id}`}>
                          <button className="action-button">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </Link>
                        <button
                          className="action-button"
                          onClick={() => {
                            fetch(`http://127.0.0.1:8000/appointments/${appt.id}`, {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                            }).then(() => {
                              setAppointments(appointments.filter((a) => a.id !== appt.id));
                            });
                          }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucun rendez-vous</p>
              )}
            </div>
            <div className="card-section">
              <h4>Médicaments</h4>
              {selectedResident.medications && selectedResident.medications.length > 0 ? (
                <ul className="data-list">
                  {selectedResident.medications.map((med) => (
                    <li key={med.id}>
                      {med.medication_name} - {med.dosage} - {med.frequency}
                      <div className="action-cell">
                        <Link to={`/medications/${med.id}`}>
                          <button className="action-button">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </Link>
                        <button
                          className="action-button"
                          onClick={() => {
                            fetch(`http://127.0.0.1:8000/medications/${med.id}`, {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                            }).then(() => {
                              setMedications(medications.filter((m) => m.id !== med.id));
                            });
                          }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucun médicament</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Residents;