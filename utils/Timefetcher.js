export const GetCurrentTime = () => {
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12; // convert 0 -> 12 and 13-23 -> 1-11

  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${hours}:${formattedMinutes} ${ampm}`;
};
