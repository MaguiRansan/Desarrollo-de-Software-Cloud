import React, { useState } from 'react';
import { 
  format, isWithinInterval, addDays, isSameDay, addMonths, subMonths, 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaCalendarCheck, FaExclamationTriangle } from 'react-icons/fa';

const useCalendar = (currentDate, reservations) => {
  const startDate = startOfWeek(startOfMonth(currentDate), { locale: es });
  const endDate = endOfWeek(endOfMonth(currentDate), { locale: es });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const isDateReserved = (date) => {
    return reservations.some(reserva => 
      isWithinInterval(date, { start: new Date(reserva.startDate), end: new Date(reserva.endDate) })
    );
  };

  const getReservationForDate = (date) => {
    return reservations.find(reserva => 
      isWithinInterval(date, { start: new Date(reserva.startDate), end: new Date(reserva.endDate) })
    );
  };

  return { days, isDateReserved, getReservationForDate };
};

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div>{children}</div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const ReservationCalendar = ({ property, onReserve }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '' });
  const [error, setError] = useState('');

  const { days, isDateReserved, getReservationForDate } = useCalendar(currentDate, property.availability);
  
  const handleDateClick = (date) => {
    setError('');
    const reservation = getReservationForDate(date);
    if (reservation) {
      setSelectedDates({ start: new Date(reservation.startDate), end: new Date(reservation.endDate) });
      return;
    }

    if (isSameDay(date, selectedDates.start)) {
        setSelectedDates({ start: null, end: null });
    } else if (!selectedDates.start || selectedDates.end) {
      setSelectedDates({ start: date, end: null });
    } else if (date > selectedDates.start) {
      for (let d = addDays(selectedDates.start, 1); d <= date; d = addDays(d, 1)) {
        if (isDateReserved(d)) {
          setError('El rango seleccionado incluye días ya reservados.');
          setSelectedDates({ start: null, end: null });
          return;
        }
      }
      setSelectedDates({ ...selectedDates, end: date });
    } else {
      setSelectedDates({ start: date, end: null });
    }
  };

  const handleConfirmReservation = () => {
    if (!guestInfo.name || !guestInfo.email) {
      setError('El nombre y el correo del huésped son obligatorios.');
      return;
    }
    const reservationData = {
      startDate: format(selectedDates.start, 'yyyy-MM-dd'),
      endDate: format(selectedDates.end, 'yyyy-MM-dd'),
      guest: guestInfo,
    };
    onReserve(reservationData);
    setSelectedDates({ start: null, end: null });
    setGuestInfo({ name: '', email: '' });
  };
  
  const getDayClassName = (day) => {
    const classes = ['p-1 text-center rounded-full cursor-pointer transition-all text-sm w-8 h-8 flex items-center justify-center'];
    const reservation = getReservationForDate(day);

    if (format(day, 'M') !== format(currentDate, 'M')) {
      classes.push('text-gray-300');
    } else if (reservation) {
      classes.push('bg-red-500 text-white font-bold opacity-75 cursor-not-allowed');
    } else if (selectedDates.start && isSameDay(day, selectedDates.start)) {
      classes.push('bg-blue-600 text-white font-bold ring-2 ring-blue-300');
    } else if (selectedDates.end && isSameDay(day, selectedDates.end)) {
      classes.push('bg-blue-600 text-white font-bold');
    } else if (selectedDates.start && selectedDates.end && isWithinInterval(day, { start: selectedDates.start, end: selectedDates.end })) {
      classes.push('bg-blue-100 text-blue-800');
    } else {
      classes.push('hover:bg-gray-100');
    }
    return classes.join(' ');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-xl max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-100"><FaChevronLeft /></button>
        <h3 className="text-lg font-bold text-gray-800 capitalize">{format(currentDate, 'MMMM yyyy', { locale: es })}</h3>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-100"><FaChevronRight /></button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map(d => <div key={d} className="text-center font-semibold text-gray-500 text-xs capitalize">{d}</div>)}
        {days.map(day => (
          <div
            key={day.toString()}
            className={getDayClassName(day)}
            onClick={() => format(day, 'M') === format(currentDate, 'M') && handleDateClick(day)}
            title={getReservationForDate(day)?.guest.name || ''}
          >
            {format(day, 'd')}
          </div>
        ))}
      </div>
      
      {selectedDates.start && selectedDates.end && !getReservationForDate(selectedDates.start) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-bold mb-2 text-center text-gray-700">Confirmar Reserva</h4>
          <p className="text-sm text-center text-gray-600 mb-4">
            Desde <span className="font-semibold">{format(selectedDates.start, 'dd/MM/yyyy')}</span> hasta <span className="font-semibold">{format(selectedDates.end, 'dd/MM/yyyy')}</span>
          </p>
          <div className="space-y-3">
            <input type="text" placeholder="Nombre del Huésped" value={guestInfo.name} onChange={e => setGuestInfo({...guestInfo, name: e.target.value})} className="w-full p-2 border rounded-md"/>
            <input type="email" placeholder="Email del Huésped" value={guestInfo.email} onChange={e => setGuestInfo({...guestInfo, email: e.target.value})} className="w-full p-2 border rounded-md"/>
            <button onClick={handleConfirmReservation} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <FaCalendarCheck /> Confirmar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <FaExclamationTriangle /> {error}
        </div>
      )}
    </div>
  );
};

export default ReservationCalendar;