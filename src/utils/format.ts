export function formatEuro(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });
}

export function formatDateFrench(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

export function formatShortDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

export function getUpcomingDays(count = 7): string[] {
  const days: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);

  while (days.length < count) {
    // 0 = Dimanche, 1 = Lundi. Open Tuesday to Saturday (2 to 6)
    if (d.getDay() >= 2 && d.getDay() <= 6) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      days.push(`${year}-${month}-${day}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}
