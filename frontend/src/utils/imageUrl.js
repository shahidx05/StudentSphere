/**
 * Converts a stored image path to a fully qualified URL.
 *
 * Storage scenarios:
 *  1. Cloudinary (cloud) → already a full https URL → return as-is
 *  2. Local disk          → "/uploads/filename.jpg" → prefix with backend URL
 */
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const getImageUrl = (path) => {
  if (!path) return null;
  // Already a full URL (Cloudinary, S3, blob:, etc.)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  // Local upload path — ensure leading slash
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
};
