// app/lib/eventParser.js

export const audienceColors = {
  "Everyone": "navy",
  "Youth": "purple",
  "Young Women": "pink",
  "Young Men": "green",
  "Primary": "orange",
  "Relief Society": "rose",
  "Elders Quorum": "teal",
  "Birthday": "softblue",
  // "Ward Council": "indigo", // blocked out for now
};

export const eventTypeIcons = {
  "Activity": "🎉",
  "Holiday": "🇺🇸",
  "Class": "📘",
  "Service": "🤝",
  "Fireside": "🔥",
  "Temple": "",
  "Baptism": "",
  "Fast Sunday": "",
  "Sacrament Meeting": "",
};

function formatBirthdayName(name) {
  const parts = name.split(",").map(p => p.trim());
  if (parts.length < 2) return name;

  const firstLast = parts[1].split(" ");
  const first = firstLast[0];
  const last = parts[0];

  return `${first} ${last}`;
}

export function parseBirthdays(birthdayRows) {
  const today = new Date();
  const currentYear = today.getFullYear();

  return birthdayRows.slice(1).map(([dateStr, rawName]) => {
    if (!dateStr || !rawName) return null;

    const [dayStr, month] = dateStr.split(" ");
    const day = parseInt(dayStr);
    if (isNaN(day)) return null;

    const monthIndex = new Date(`${month} 1, 2020`).getMonth();
    const date = new Date(currentYear, monthIndex, day);

    return {
      date,
      title: formatBirthdayName(rawName),
      type: "Birthday",
      audience: ["Birthday"],
      colors: ["softblue"],
      icon: "",
      notes: "",
    };
  }).filter(Boolean);
}

export function parseEvents(eventRows) {
  if (!eventRows || !Array.isArray(eventRows)) return [];
  return eventRows.slice(1).map(row => {

    const [dateStr, time, title, eventType, audienceStr, notes] = row;

    if (!dateStr || !title) return null;

    const date = new Date(dateStr);

    const audiences = audienceStr
      ? audienceStr.split(",").map(a => a.trim())
      : ["Everyone"];

    const filteredAudiences = audiences.filter(a => a !== "Ward Council");
    const colors = filteredAudiences.map(a => audienceColors[a] || "gray");
    const icon = eventTypeIcons[eventType] || "";

    return {
      date,
      title,
      time: time || "",
      type: eventType,
      audience: filteredAudiences,
      colors,
      icon,
      notes: notes || "",
    };
  }).filter(Boolean);
}

export function mergeCalendarData(birthdays, events) {
  return [...birthdays, ...events].sort((a, b) => a.date - b.date);
}
