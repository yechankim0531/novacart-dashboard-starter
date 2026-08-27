/**
 * api.js — NovaCart Dashboard API client
 *
 * All API calls go through this file.
 * In SPCS, REACT_APP_BACKEND_URL is set to /api and calls are
 * routed through the NGINX router to the backend container.
 * Locally, calls go directly to http://localhost:8000.
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT_MS = 10000;

async function apiFetch(path) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${BACKEND_URL}${path}`, { signal: controller.signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `API error ${res.status}`);
    }
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('The local backend is taking too long to respond. Make sure it is running on port 8000.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// The backend being unreachable (down, not deployed, network blocked) surfaces
// as a generic "Failed to fetch" TypeError — that's the case we want to mask
// behind a friendly message instead of showing raw error text to the user.
export function friendlyError(err) {
  if (err instanceof TypeError || err.message === 'Failed to fetch') {
    return "We're currently unable to fetch your data. Please try again in a few moments.";
  }
  return err.message || 'Something went wrong while loading this page.';
}

export async function authorize()              { return apiFetch('/authorize'); }
export async function getHealth()              { return apiFetch('/health'); }
export async function getSummary(id)           { return apiFetch(`/franchise/${id}/summary`); }
export async function getOrders(id, s, e)      { return apiFetch(`/franchise/${id}/orders?start=${s}&end=${e}`); }
export async function getProducts(id, s, e)    { return apiFetch(`/franchise/${id}/products?start=${s}&end=${e}`); }
export async function getCustomers(id, s, e)   { return apiFetch(`/franchise/${id}/customers?start=${s}&end=${e}`); }
export async function getCountries(id, s, e)   { return apiFetch(`/franchise/${id}/countries?start=${s}&end=${e}`); }
