const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function plural(count: number, singular: string, pluralForm: string) {
  return `Há ${count} ${count === 1 ? singular : pluralForm}`;
}

// "Agora", "Há 5 min", "Há 2 horas", "Há 3 dias" e, depois de um mês, a data
export function formatTimeAgo(isoDate: string, now = new Date()) {
  const date = new Date(isoDate);
  const seconds = Math.max(0, (now.getTime() - date.getTime()) / 1000);

  if (seconds < MINUTE) return 'Agora';
  if (seconds < HOUR) return `Há ${Math.floor(seconds / MINUTE)} min`;
  if (seconds < DAY) {
    return plural(Math.floor(seconds / HOUR), 'hora', 'horas');
  }
  if (seconds < 30 * DAY) {
    return plural(Math.floor(seconds / DAY), 'dia', 'dias');
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}
