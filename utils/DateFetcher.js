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
