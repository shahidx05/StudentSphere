import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export const formatDate = (date, format = 'MMM D, YYYY') => {
  if (!date) return '—';
  return dayjs(date).format(format);
};

export const formatRelative = (date) => {
  if (!date) return '—';
  return dayjs(date).fromNow();
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return dayjs(date).format('MMM D, YYYY · h:mm A');
};
