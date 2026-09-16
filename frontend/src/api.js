const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, init) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || res.statusText;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  list: () => request('/jobs'),
  create: (body) =>
    request('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id, status) =>
    request(`/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  remove: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
};