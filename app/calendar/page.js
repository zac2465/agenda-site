"use client";
//console.log("Calendar data:", data.calendar);

import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import { parseBirthdays, parseEvents, mergeCalendarData } from "../lib/eventParser";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
  async function fetchData() {
    const res = await fetch("/api/agenda", { cache: "no-store" });
    const data = await res.json();

    console.log("Calendar data:", data.calendar);

    const birthdays = parseBirthdays(data.birthdays);
    const parsedEvents = parseEvents(data.calendar);
    const merged = mergeCalendarData(birthdays, parsedEvents);

    setEvents(merged);
  }

  fetchData();
}, []);


  return <Calendar events={events} />;
}
