import React, { useState } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaPlus, FaClock } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

// Mock data for bookings
const mockBookings = {
  '2024-07-15': [
    { id: 1, time: '10:00 AM', client: 'John Doe', trip: 'Airport Transfer' },
    { id: 2, time: '02:00 PM', client: 'Jane Smith', trip: 'City Tour' }
  ],
  '2024-07-20': [
    { id: 3, time: '09:00 AM', client: 'Peter Jones', trip: 'Corporate Event' }
  ],
  '2024-08-01': [
    { id: 4, time: '06:00 PM', client: 'Mary Johnson', trip: 'Dinner Transport' }
  ]
};

function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const renderDays = () => {
    const days = [];
    // Add blank days for the start of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`blank-${i}`} className="border rounded-lg p-2 h-32"></div>);
    }
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBookings = mockBookings[dateKey] || [];
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      
      days.push(
        <div key={day} className={`border rounded-lg p-2 h-32 flex flex-col ${isToday ? 'bg-blue-50' : ''}`}>
          <div className={`font-bold ${isToday ? 'text-blue-600' : ''}`}>{day}</div>
          <div className="flex-grow overflow-y-auto text-sm space-y-1 mt-1">
            {dayBookings.map(booking => (
              <div key={booking.id} className="bg-blue-100 text-blue-800 p-1 rounded-md text-xs truncate">
                <FaClock className="inline mr-1" />{booking.time} - {booking.client}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaCalendarAlt className="text-purple-600" />
            Booking Calendar
          </h1>
          <p className="text-gray-600 mt-2">A visual overview of your booking schedule</p>
        </div>
        <Button>
          <FaPlus className="mr-2" />
          New Booking
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={handlePrevMonth}>
              <FaChevronLeft />
            </Button>
            <h2 className="text-2xl font-semibold text-gray-700">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="outline" onClick={handleNextMonth}>
              <FaChevronRight />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-600 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderDays()}
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Upcoming Key Dates</h3>
           <ul className="space-y-2">
            <li className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">National Conference Transport</p>
                  <p className="text-sm text-gray-600">Multiple bookings across 3 days</p>
                </div>
                <div className="font-bold text-purple-600">
                  July 25-27, 2024
                </div>
            </li>
            <li className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">Summer Music Festival</p>
                  <p className="text-sm text-gray-600">High-demand period, 15 bookings</p>
                </div>
                <div className="font-bold text-purple-600">
                  August 10, 2024
                </div>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default BookingCalendar; 