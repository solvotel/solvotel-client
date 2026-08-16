export const GetCurrentTime = () => {
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12; // convert 0 -> 12 and 13-23 -> 1-11

  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${hours}:${formattedMinutes} ${ampm}`;
};

export const ConvertTo12HourFormat = (timeValue) => {
  if (timeValue === null || timeValue === undefined || timeValue === '') {
    return 'N/A';
  }

  const rawValue = String(timeValue).trim();

  if (!rawValue) {
    return 'N/A';
  }

  const match = rawValue.match(
    /^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?$/i,
  );

  if (!match) {
    return rawValue;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const meridiem = (match[4] || '').toUpperCase();

  if (meridiem) {
    if (meridiem === 'AM' && hours === 12) hours = 0;
    if (meridiem === 'PM' && hours !== 12) hours += 12;
  } else if (hours >= 12) {
    hours = hours % 12 || 12;
  }

  const formattedHours = hours % 12 || 12;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const suffix = meridiem || (Number(match[1]) >= 12 ? 'PM' : 'AM');

  return `${formattedHours}:${formattedMinutes} ${suffix}`;
};
