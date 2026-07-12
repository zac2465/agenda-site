// app/calendar/Calendar.js
"use client";

import { useState, useEffect } from "react";

export default function Calendar({ events }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showBirthdays, setShowBirthdays] = useState(true);
  const [compact, setCompact] = useState(false);

  const today = new Date();

  // Auto-detect screen size on load
  useEffect(() => {
    if (window.innerWidth < 640) {
      setCompact(true);   // phones default to compact
    } else {
      setCompact(false);  // desktops default to grid
    }
  }, []);

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const daysInMonth = monthEnd.getDate();
  const startDay = monthStart.getDay();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentMonth(new Date());
  };

  // Filter events for this month
  const monthEvents = events.filter(e =>
    e.date.getMonth() === currentMonth.getMonth() &&
    e.date.getFullYear() === currentMonth.getFullYear()
  );

  // Group events by day
  const eventsByDay = {};
  monthEvents.forEach(event => {
    const day = event.date.getDate();
    if (!eventsByDay[day]) eventsByDay[day] = [];
    eventsByDay[day].push(event);
  });

  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* Month Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="px-3 py-1 bg-gray-200 rounded">←</button>
        <h2 className="text-2xl font-semibold">
          {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </h2>
        <button onClick={nextMonth} className="px-3 py-1 bg-gray-200 rounded">→</button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        <button
          onClick={() => setShowBirthdays(!showBirthdays)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          {showBirthdays ? "Hide Birthdays" : "Show Birthdays"}
        </button>

        <button
          onClick={() => setCompact(!compact)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          {compact ? "Grid Mode" : "Compact Mode"}
        </button>

        <button
          onClick={jumpToToday}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Today
        </button>

        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Home
        </a>
      </div>

      {/* COMPACT MODE */}
      {compact && (
        <div className="space-y-4">
          {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
            const day = dayIndex + 1;
            const dayEvents = eventsByDay[day] || [];

            const isToday =
              today.getDate() === day &&
              today.getMonth() === currentMonth.getMonth() &&
              today.getFullYear() === currentMonth.getFullYear();

            const weekdayShort = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            ).toLocaleString("default", { weekday: "short" });

            return (
              <div
                key={day}
                className={`border p-3 rounded ${
                  isToday ? "bg-yellow-100 border-yellow-400" : "bg-white"
                }`}
              >
                <div className="font-bold text-lg mb-2">
                  {weekdayShort}, {currentMonth.toLocaleString("default", { month: "long" })} {day}
                </div>

                {dayEvents.length === 0 && (
                  <div className="text-gray-500 text-sm">No events</div>
                )}

                {dayEvents.map((event, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedEvent(event)}
                    className={`cursor-pointer whitespace-normal break-words mb-2 ${
                      event.type === "Birthday" && !showBirthdays
                        ? "hidden"
                        : event.type === "Birthday"
                          ? "text-blue-600"
                          : "font-medium"
                    }`}
                  >
                    <span className="inline-flex mr-1">
                      {event.colors.map((c, idx) => (
                        <span
                          key={idx}
                          className="w-2 h-2 rounded-full inline-block mr-1"
                          style={{ backgroundColor: c }}
                        ></span>
                      ))}
                    </span>

                    {event.icon && <span className="mr-1">{event.icon}</span>}

                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* GRID MODE */}
      {!compact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 sm:gap-2 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="font-semibold text-xs sm:text-sm">{d}</div>
          ))}

          {/* Empty cells */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="border h-40 sm:h-32 md:h-24 bg-gray-50"></div>
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
            const day = dayIndex + 1;
            const dayEvents = eventsByDay[day] || [];

            const isToday =
              today.getDate() === day &&
              today.getMonth() === currentMonth.getMonth() &&
              today.getFullYear() === currentMonth.getFullYear();

            const weekdayShort = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            ).toLocaleString("default", { weekday: "short" });

            return (
              <div
                key={day}
                className={`border h-40 sm:h-32 md:h-24 p-1 text-left overflow-auto ${
                  isToday ? "bg-yellow-100 border-yellow-400" : ""
                }`}
              >
                <div className="font-bold text-xs sm:text-base">
                  <span className="sm:hidden">{weekdayShort} </span>
                  {day}
                </div>

                {dayEvents.map((event, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedEvent(event)}
                    className={`cursor-pointer mt-1 whitespace-normal break-words ${
                      event.type === "Birthday" && !showBirthdays
                        ? "hidden"
                        : event.type === "Birthday"
                          ? "text-xs sm:text-sm text-blue-600 font-normal"
                          : "text-xs sm:text-sm md:text-base font-medium"
                    }`}
                  >
                    <span className="inline-flex mr-1">
                      {event.colors.map((c, idx) => (
                        <span
                          key={idx}
                          className="w-2 h-2 rounded-full inline-block mr-1"
                          style={{ backgroundColor: c }}
                        ></span>
                      ))}
                    </span>

                    {event.icon && <span className="mr-1">{event.icon}</span>}

                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-4 sm:p-6 rounded shadow-lg max-w-md w-full mx-2">
            <h3 className="text-xl font-semibold mb-2">{selectedEvent.title}</h3>

            {selectedEvent.time && (
              <p className="mb-1"><strong>Time:</strong> {selectedEvent.time}</p>
            )}

            <p className="mb-1"><strong>Type:</strong> {selectedEvent.type}</p>

            <p className="mb-1">
              <strong>Audience:</strong> {selectedEvent.audience.join(", ")}
            </p>

            {selectedEvent.notes && (
              <p className="mt-2 p-2 bg-gray-100 rounded">
                {selectedEvent.notes}
              </p>
            )}

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
