// 45 -> "45min", 60 -> "1h", 95 -> "1h35"
export function formatStudyTime(minutes: number) {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h${String(rest).padStart(2, '0')}` : `${hours}h`;
}

export function formatStreak(days: number) {
  return `${days} dia${days === 1 ? '' : 's'}`;
}

export function getFirstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] ?? '';
}
