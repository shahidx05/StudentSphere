/**
 * Converts a stored image path like "/uploads/filename.jpg"
 * to a fully qualified URL pointing at the backend.
 * Handles absolute URLs (Cloudinary, http://) unchanged.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
};
