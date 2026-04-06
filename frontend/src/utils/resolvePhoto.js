/**
 * Resolves a profile photo URL.
 * - Cloudinary / full https URLs are returned as-is.
 * - Relative /uploads/... paths are prefixed with the API base URL.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const resolvePhoto = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Local uploads path — prefix with backend URL
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};
