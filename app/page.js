"use client";

import { useEffect, useState } from "react";
import { hymns } from "./lib/hymns";
import { marked } from "marked";

export default function AgendaPage() {
  const [agenda, setAgenda] = useState(null);
  const [announcements, setAnnouncements] = useState(null);

  const hymnUrlCache = {};

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/agenda?ts=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setAgenda(data.agenda);
      setAnnouncements(data.announcements);
    }
    fetchData();
  }, []);


  if (!agenda) return <p className="p-6 text-gray-800">Loading...</p>;

  const headers = agenda[0];
  const rows = agenda.slice(1);

  // ------------------------------------------------------------
  // WEEK SELECTION LOGIC
  // ------------------------------------------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let thisWeek =
    rows.find(row => {
      const dateCell = row[0];
      if (!dateCell) return false;
      const rowDate = new Date(dateCell);
      rowDate.setHours(0, 0, 0, 0);
      return rowDate >= today;
    }) || rows[rows.length - 1];

  const meetingDate = new Date(thisWeek[0]).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // ------------------------------------------------------------
  // ANNOUNCEMENT MATCHING (BY AGENDA DATE)
  // ------------------------------------------------------------
  const agendaDate = new Date(thisWeek[0]);
  agendaDate.setHours(0, 0, 0, 0);

  let announcementText = "";
  if (announcements && announcements.length > 1) {
    const rowsA = announcements.slice(1);
    const match = rowsA.find(([dateStr]) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === agendaDate.getTime();
    });
    announcementText = match?.[1]?.trim() || "";
  }

  // -----------------------------
  // HYMN URL HANDLING
  // -----------------------------
  async function checkUrlExists(url) {
    try {
      const response = await fetch("/api/check-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      return data.ok;
    } catch (err) {
      console.error("Client checkUrlExists error:", err);
      return false;
    }
  }

  function slugifyTitle(title) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function getHymnUrl(hymnNumber, title) {
    if (!title) return null;

    const num = parseInt(hymnNumber, 10);
    const slug = slugifyTitle(title);

    if (hymnUrlCache[hymnNumber]) {
      return hymnUrlCache[hymnNumber];
    }

    let finalUrl;

    if (num < 500) {
      finalUrl = `https://www.churchofjesuschrist.org/study/manual/hymns/${slug}?lang=eng`;
    } else {
      const base =
        "https://www.churchofjesuschrist.org/study/music/hymns-for-home-and-church";
      const releaseUrl = `${base}/${slug}-release-3?lang=eng`;
      const normalUrl = `${base}/${slug}?lang=eng`;

      const okRelease = await checkUrlExists(releaseUrl);
      finalUrl = okRelease ? releaseUrl : normalUrl;
    }

    hymnUrlCache[hymnNumber] = finalUrl;
    return finalUrl;
  }

  function RenderHymnCell({ header, cell }) {
    const hymnNum = (cell || "").toString().replace(/\D/g, "");
    const raw = hymns[hymnNum];

    if (!hymnNum || !raw) return <span>{cell}</span>;

    let title = "";
    let url = "";

    if (typeof raw === "string") {
      title = raw;
    } else if (typeof raw === "object") {
      title = raw.title;
      url = raw.url;
    }

    if (!title) title = hymnNum;

    if (url) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:underline font-medium"
        >
          {`${hymnNum} – ${title}`}
        </a>
      );
    }

    return <span>{`${hymnNum} – ${title}`}</span>;
  }

  function renderCell(header, cell) {
    if (header.toLowerCase().includes("hymn")) {
      return <RenderHymnCell header={header} cell={cell} />;
    }
    return cell;
  }

  // -----------------------------
  // RENDER PAGE
  // -----------------------------
  return (
    <main className="bg-with-overlay text-black min-h-screen mx-auto max-w-4xl p-4 space-y-8">
      <header className="text-center space-y-1">
        <h1 className="text-2xl font-bold">
          Welcome to the Church of Jesus Christ of Latter-day Saints
        </h1>
        <h2 className="text-lg font-semibold">
          Tremonton 6th Ward Sacrament Meeting
        </h2>
        <p className="text-gray-700 text-base">{meetingDate}</p>
      </header>

      {/* Agenda */}
      <section className="p-4 space-y-4 bg-transparent">
        {/* Skip the hidden Baby Blessing column in B */}
        {headers.slice(2).map((header, i) => {
          // +2 because:
          // A = Date, B = Baby Blessing (hidden), C = first visible header
          const cell = thisWeek[i + 2];
          const value = String(cell ?? "").trim();
          if (!value && !header.toLowerCase().includes("benediction"))
            return null;

          return (
            <div key={i} className="text-base sm:text-lg leading-snug py-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{header}</span>
                <div className="flex-1 mx-2 dotted-line"></div>
              </div>

              <div className="text-right mt-1 text-gray-800 break-words">
                {renderCell(header, cell)}
              </div>
            </div>
          );
        })}
      </section>

      {/* Announcements */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Announcements</h3>
        <div className="p-4 space-y-2">
          {announcementText ? (
            <div
              className="prose prose-sm sm:prose-base max-w-none text-gray-800 
                prose-ul:list-disc prose-ul:pl-6 prose-li:my-2
                prose-li:marker:text-blue-800 prose-li:marker:font-bold
                prose-strong:font-semibold
                prose-a:text-blue-800 prose-a:underline hover:prose-a:text-blue-900"
              dangerouslySetInnerHTML={{
                __html: marked.parse(announcementText, { breaks: true }),
              }}
            />
          ) : (
            <p>No announcements for this week.</p>
          )}
        </div>
      </section>

      <a
        href="/calendar"
        className="inline-block mt-6 mb-4 bg-blue-100 text-blue-800 px-6 py-2 rounded-lg border border-blue-300 hover:bg-blue-200 hover:text-blue-900 transition duration-200"
      >
        View Ward Calendar
      </a>
    </main>
  );
}

