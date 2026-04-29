const AI_BASE_URL = process.env.REACT_APP_AI_URL || 'http://localhost:5000';

export async function askChatBot({ question, role, context }) {
  let res;
  try {
    res = await fetch(`${AI_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, role, context }),
    });
  } catch (e) {
    // Network errors (server down, refused connection, DNS, etc.)
    throw new Error(`Cannot reach AI service at ${AI_BASE_URL}. Start the AI module (port 5000).`);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error || `Chat service error (${res.status})`;
    throw new Error(message);
  }
  return data;
}

