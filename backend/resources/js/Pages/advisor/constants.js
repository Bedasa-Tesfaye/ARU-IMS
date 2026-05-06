export const NAV = [
  { id: 'overview', label: 'Dashboard', icon: '📊' },
  { id: 'students', label: 'My Students', icon: '👨‍🎓' },
  { id: 'reviews', label: 'Application Reviews', icon: '📝' },
  { id: 'meetings', label: 'Meeting Schedule', icon: '📅' },
  { id: 'progress', label: 'Student Progress', icon: '📊' },
  { id: 'messages', label: 'Messages/Chat', icon: '💬' },
  { id: 'documents', label: 'Document Reviews', icon: '📄' },
  { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export const STAGE_LABELS = {
  profile_building: 'Profile Building',
  applying: 'Applying',
  interviewing: 'Interviewing',
  placed: 'Placed',
};

export const SEGMENT_KEYS = [
  { key: 'profile_incomplete', filter: { stage: 'profile_building' }, label: 'Profile Incomplete', color: '#94a3b8' },
  { key: 'ready_to_apply', filter: { stage: 'applying' }, label: 'Ready to Apply', color: '#38bdf8' },
  { key: 'applied', filter: { stage: 'applying' }, label: 'Applied', color: '#6366f1' },
  { key: 'interviewing', filter: { stage: 'interviewing' }, label: 'Interviewing', color: '#f59e0b' },
  { key: 'placed', filter: { stage: 'placed' }, label: 'Placed', color: '#22c55e' },
  { key: 'inactive', filter: { status: 'inactive' }, label: 'Inactive', color: '#cbd5e1' },
];
