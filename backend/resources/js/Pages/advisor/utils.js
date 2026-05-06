export function normalizePaginated(res) {
  const d = res?.data;
  if (Array.isArray(d)) return { data: d, meta: null };
  return {
    data: d?.data ?? [],
    meta: d
      ? {
          current_page: d.current_page,
          last_page: d.last_page,
          total: d.total,
        }
      : null,
  };
}

export function formatRelative(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function reviewPriority(app) {
  const raw = app?.internship?.sla_deadline_at || app?.internship?.end_date;
  if (!raw) return { level: 'normal', label: 'Normal' };
  const end = new Date(raw).getTime();
  const hours = (end - Date.now()) / 3600000;
  if (hours > 0 && hours <= 48) return { level: 'urgent', label: 'Urgent (<48h)' };
  if (hours > 0 && hours <= 120) return { level: 'high', label: 'High' };
  return { level: 'normal', label: 'Normal' };
}

export function interpretNlSearch(text) {
  const q = text.toLowerCase().trim();
  const next = {};
  if (!q) return next;
  if (/haven'?t applied|not applied|no application/i.test(q)) next.stage = 'profile_building';
  if (/tech|software|it\b/i.test(q)) next.search = 'tech';
  if (/interview/i.test(q)) next.stage = 'interviewing';
  if (/low engagement|at risk|disengaged/i.test(q)) {
    next.engagement = 'low';
    next.sort = 'ai_recommended';
  }
  if (/placed|secured|offer/i.test(q)) next.status = 'placed';
  return next;
}

export function meetingTypeStyle(m) {
  const t = `${m.company_name || ''} ${m.position_title || ''}`.toLowerCase();
  if (t.includes('admin')) return 'adv-cal-dot admin';
  if (t.includes('group')) return 'adv-cal-dot group';
  return 'adv-cal-dot student';
}
