// Formatte une date "2026-07-20 10:00:00" (format SQL renvoyé par le backend) en "20/07/2026"
export function formatDate(sqlDate) {
  if (!sqlDate) {
    return '—';
  }
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return formatter.format(new Date(sqlDate.replace(' ', 'T')));
}
