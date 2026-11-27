const INDIA_TIME_ZONE = 'Asia/Kolkata';
const INDIA_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export const getIndiaDateKey = (date = new Date()) => {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(date)
    .reduce((parts, part) => {
      if (part.type !== 'literal') parts[part.type] = part.value;
      return parts;
    }, {});

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

export const getNextIndiaMidnight = (date = new Date()) => {
  const today = getIndiaDateKey(date);
  const midnightToday = new Date(`${today}T00:00:00+05:30`);

  return new Date(midnightToday.getTime() + INDIA_DAY_IN_MILLISECONDS);
};
