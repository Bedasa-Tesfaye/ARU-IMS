export function downloadIcs({ filename = 'event.ics', title, description = '', start, end, location = '' }) {
  const dt = (d) => {
    const x = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(x.getTime())) return '';
    // UTC format: YYYYMMDDTHHMMSSZ
    const pad = (n) => String(n).padStart(2, '0');
    return (
      x.getUTCFullYear() +
      pad(x.getUTCMonth() + 1) +
      pad(x.getUTCDate()) +
      'T' +
      pad(x.getUTCHours()) +
      pad(x.getUTCMinutes()) +
      pad(x.getUTCSeconds()) +
      'Z'
    );
  };

  const uid = `${Date.now()}-${Math.random().toString(16).slice(2)}@aru-ims`;
  const now = dt(new Date());
  const dtStart = dt(start);
  const dtEnd = dt(end || new Date(new Date(start).getTime() + 60 * 60 * 1000));
  const esc = (s) =>
    String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ARU IMS//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${esc(title)}`,
    description ? `DESCRIPTION:${esc(description)}` : '',
    location ? `LOCATION:${esc(location)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

