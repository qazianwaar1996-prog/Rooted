/**
 * Rooted API Service
 * Centralised API calls with JWT token management.
 * Falls back to local/mock data when the backend is unavailable.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Token helpers ──────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem('rooted_token');
}

export function setToken(token) {
  localStorage.setItem('rooted_token', token);
}

export function removeToken() {
  localStorage.removeItem('rooted_token');
  localStorage.removeItem('rooted_onboarded');
  localStorage.removeItem('rooted_challenge');
}

export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  try {
    // Basic JWT expiry check (client-side best-effort)
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      removeToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ── Generic fetch wrapper ──────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    removeToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }

  return res.json();
}

// ── Auth ───────────────────────────────────────────────────────

export async function loginUser(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}

export async function registerUser(name, email, password) {
  await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  // Auto-login after registration
  return loginUser(email, password);
}

export async function getMe() {
  return apiFetch('/auth/me');
}

// ── Profile ────────────────────────────────────────────────────

export async function getProfile() {
  return apiFetch('/users/me/profile');
}

export async function updateProfile(data) {
  return apiFetch('/users/me/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Children ───────────────────────────────────────────────────

export async function getChildren() {
  return apiFetch('/users/me/children');
}

export async function addChild(name, dateOfBirth, gender = null) {
  return apiFetch('/users/me/children', {
    method: 'POST',
    body: JSON.stringify({ name, date_of_birth: dateOfBirth, gender }),
  });
}

export async function deleteChild(childId) {
  return apiFetch(`/users/me/children/${childId}`, {
    method: 'DELETE',
  });
}

// ── Saved Articles ─────────────────────────────────────────────

export async function getSavedArticles() {
  return apiFetch('/users/me/saved-articles');
}

export async function saveArticle(slug) {
  return apiFetch(`/users/me/saved-articles/${slug}`, {
    method: 'POST',
  });
}

export async function removeSavedArticle(slug) {
  return apiFetch(`/users/me/saved-articles/${slug}`, {
    method: 'DELETE',
  });
}

// ── Bookings ───────────────────────────────────────────────────

export async function getBookings() {
  return apiFetch('/bookings/me');
}

export async function createBooking(expertId, requestedDate, notes = '') {
  return apiFetch('/bookings', {
    method: 'POST',
    body: JSON.stringify({ expert_id: expertId, requested_date: requestedDate, notes }),
  });
}

// ── Community ─────────────────────────────────────────────────

export async function getCommunityGroups() {
  return apiFetch('/community/groups');
}

export async function getCommunityPosts(groupId, page = 1, perPage = 10) {
  const params = new URLSearchParams({ page, per_page: perPage });
  if (groupId && groupId !== 'all') params.set('group_id', groupId);
  return apiFetch(`/community/posts?${params.toString()}`);
}

export async function createCommunityPost(groupId, body, isAnonymous = false, imageUrl = null) {
  return apiFetch('/community/posts', {
    method: 'POST',
    body: JSON.stringify({ group_id: groupId, body, is_anonymous: isAnonymous, image_url: imageUrl }),
  });
}

export async function likeCommunityPost(postId) {
  return apiFetch(`/community/posts/${postId}/like`, { method: 'POST' });
}

export async function getCommunityPost(postId) {
  return apiFetch(`/community/posts/${postId}`);
}

export async function getPostComments(postId) {
  return apiFetch(`/community/posts/${postId}/comments`);
}

export async function createPostComment(postId, body, parentId = null, isAnonymous = false) {
  return apiFetch(`/community/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body, parent_id: parentId, is_anonymous: isAnonymous }),
  });
}

// ── Payments / Stripe ──────────────────────────────────────────

export async function createCheckoutSession(successUrl = null, cancelUrl = null) {
  const body = {};
  if (successUrl) body.success_url = successUrl;
  if (cancelUrl) body.cancel_url = cancelUrl;
  return apiFetch('/payments/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getSubscriptionStatus() {
  return apiFetch('/payments/subscription-status');
}

export async function cancelSubscription() {
  return apiFetch('/payments/cancel-subscription', { method: 'POST' });
}

export async function bookExpertSession(expertId, slotDatetime, notes = '', successUrl = null, cancelUrl = null) {
  const body = { expert_id: expertId, slot_datetime: slotDatetime, notes };
  if (successUrl) body.success_url = successUrl;
  if (cancelUrl) body.cancel_url = cancelUrl;
  return apiFetch('/payments/book-expert-session', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ── Onboarding helpers ─────────────────────────────────────────

export function isOnboarded() {
  return localStorage.getItem('rooted_onboarded') === 'true';
}

export function setOnboarded() {
  localStorage.setItem('rooted_onboarded', 'true');
}

export function getOnboardingChallenge() {
  return localStorage.getItem('rooted_challenge');
}

export function setOnboardingChallenge(challenge) {
  localStorage.setItem('rooted_challenge', challenge);
}
