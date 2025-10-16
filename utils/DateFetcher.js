// get todays date
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

export function getNextMonthDate(dateString) {
  const date = new Date(dateString); // local time
  const nextMonth = date.getMonth() + 1;

  const lastDayOfNextMonth = new Date(date.getFullYear(), nextMonth + 1, 0).getDate();

  const newDay = Math.min(date.getDate(), lastDayOfNextMonth);
  const nextMonthDate = new Date(date.getFullYear(), nextMonth, newDay);

  // Format as YYYY-MM-DD (local)
  const year = nextMonthDate.getFullYear();
  const month = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextMonthDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00.000Z`;
}

// get todays date
export const Get6DateEarly = (date) => {
  const givenDate = new Date(date);

  // Subtract 5 days
  const earlierDateObj = new Date(givenDate);
  earlierDateObj.setDate(givenDate.getDate() - 6);

  // Extract the day, month, and year
  let today = new Date(earlierDateObj);
  let day = today.getDate();
  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  if (day.toString().length < 2) {
    day = '0' + day;
  }
  if (month.toString().length < 2) {
    month = '0' + month;
  }

  let dateString = day + '-' + month + '-' + year;

  return dateString;
};
