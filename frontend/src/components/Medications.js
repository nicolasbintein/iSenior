import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function Medications() {
  const [medications, setMedications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/medications', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des médicaments');
        }
        const data = await response.json();
        setMedications(data);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMedications();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/medications/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du médicament');
      }
      setMedications(medications.filter((medication) => medication.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="medications-container">
      <h2>Médicaments</h2>
      {error && <div className="alert error">{error}</div>}
      <Link to="/medications/new">
        <button>Ajouter un médicament</button>
      </Link>
      <table>
        <thead>
          <tr>
            <th>Résident</th>
            <th>Médicament</th>
            <th>Dosage</th>
            <th>Fréquence</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medications.length > 0 ? (
            medications.map((medication) => (
              <tr key={medication.id}>
                <td>{medication.resident_name}</td>
                <td>{medication.medication_name}</td>
                <td>{medication.dosage}</td>
                <td>{medication.frequency}</td>
                <td className="action-cell">
                  <Link to={`/medications/${medication.id}`}>
                    <button className="action-button">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </Link>
                  <button
                    className="action-button"
                    onClick={() => handleDelete(medication.id)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Aucun médicament trouvé</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Medications;