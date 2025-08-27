import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { PencilIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import '../styles/views.css';

moment.locale('fr');

const localizer = momentLocalizer(moment);

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(moment().format('MMMM YYYY'));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/appointments', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Erreur lors de la récupération des rendez-vous');
        const appointmentsData = await response.json();
        setAppointments(appointmentsData);
        const calendarEvents = appointmentsData.map((appt) => ({
          id: appt.id,
          title: `${appt.resident_name} - ${appt.reason}`,
          start: new Date(`${appt.date}T${appt.time}`),
          end: new Date(`${appt.date}T${appt.time}`),
          allDay: false,
          resident_name: appt.resident_name,
          time: appt.time,
          reason: appt.reason
        }));
        setEvents(calendarEvents);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression du rendez-vous');
      setAppointments(appointments.filter((appt) => appt.id !== id));
      setEvents(events.filter((event) => event.id !== id));
      setSelectedEvent(null);
      navigate('/appointments');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const closePopup = () => {
    setSelectedEvent(null);
  };

  const handleNavigate = (action) => {
    const newDate = moment(currentDate);
    if (action === 'PREV') {
      newDate.subtract(1, 'month');
    } else if (action === 'NEXT') {
      newDate.add(1, 'month');
    } else if (action === 'TODAY') {
      newDate.set({ date: moment().date(), month: moment().month(), year: moment().year() });
    }
    setCurrentDate(newDate.toDate());
    setCurrentMonth(newDate.format('MMMM YYYY'));
  };

  const today = moment().format('DD/MM/YYYY');

  return (
    <div className="appointments-container">
      <h2>{currentMonth}</h2>
      <div className="navigation-buttons">
        <button type="button" className="nav-button" onClick={() => handleNavigate('PREV')}>
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <button type="button" className="today-button" onClick={() => handleNavigate('TODAY')}>
          {today}
        </button>
        <button type="button" className="nav-button" onClick={() => handleNavigate('NEXT')}>
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>
      {error && <div className="alert error">{error}</div>}
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        onNavigate={(newDate) => {
          setCurrentDate(newDate);
          setCurrentMonth(moment(newDate).format('MMMM YYYY'));
        }}
        style={{ height: 700, width: '100%', maxWidth: '1400px', margin: '0 auto' }}
        onSelectEvent={handleEventClick}
        eventPropGetter={() => ({ className: 'calendar-event' })}
        components={{ toolbar: () => null }}
        defaultView="month"
        views={['month']}
      />
      {selectedEvent && (
        <div className="appointment-popup">
          <div className="popup-content">
            <button className="close-button" onClick={closePopup}>
              <XMarkIcon className="h-5 w-5" />
            </button>
            <h4>{selectedEvent.resident_name}</h4>
            <p><strong>Heure :</strong> {selectedEvent.time}</p>
            <p><strong>Motif :</strong> {selectedEvent.reason}</p>
            <div className="popup-actions">
              <Link to={`/appointments/${selectedEvent.id}`}>
                <button className="action-button">
                  <PencilIcon className="h-5 w-5" />
                </button>
              </Link>
              <button
                className="action-button"
                onClick={() => handleDelete(selectedEvent.id)}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => navigate('/appointments/new')}  // Correction de la redirection
        className="add-appointment-button"
      >
        Ajouter un Rendez-vous
      </button>
    </div>
  );
}

export default Appointments;