function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getLocalDateRange() {
  const now = new Date();
  const today = toIsoDate(now);
  const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const monthEnd = toIsoDate(
    new Date(now.getFullYear(), now.getMonth() + 1, 0)
  );
  const todayPlus7 = toIsoDate(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
  );

  return {
    today,
    monthStart,
    monthEnd,
    todayPlus7,
  };
}

export function getCurrentMonthLabel() {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}
