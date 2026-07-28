// get todays date
export const toDateKey = (value) => {
  if (!value) return null;

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const isDateInRange = (target, start, end) => {
  const targetKey = toDateKey(target);
  const startKey = toDateKey(start);
  const endKey = toDateKey(end);

  if (!targetKey || !startKey || !endKey) return false;

  if (startKey === endKey) {
    return targetKey === startKey;
  }

  return targetKey >= startKey && targetKey < endKey;
};

export const GetTodaysDate = () => {
  let today = new Date();
  let day = today.getDate();
  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  if (day.toString().length < 2) {
    day = '0' + day;
  }
  if (month.toString().length < 2) {
    month = '0' + month;
  }

  let dateString = year + '-' + month + '-' + day;
  let dateObject = {
    year,
    month,
    day,
  };
  return { dateString, dateObject };
};

export const GetCustomDate = (date) => {
  if (!date) return null;

  const isUTC = typeof date === 'string' && date.endsWith('Z');
  const d = new Date(date);

  const day = isUTC ? d.getUTCDate() : d.getDate();
  const month = isUTC ? d.getUTCMonth() + 1 : d.getMonth() + 1;
  const year = isUTC ? d.getUTCFullYear() : d.getFullYear();

  const dayStr = day < 10 ? '0' + day : day;
  const monthStr = month < 10 ? '0' + month : month;

  return `${dayStr}-${monthStr}-${year}`;
};

export const formatDateTime = (value, timeZone = 'Asia/Kolkata') => {
  if (!value) return '';
  return new Date(value)
    .toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone,
    })
    .replace(',', '');
};
