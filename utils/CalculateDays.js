export const CalculateDays = ({ checkin, checkout }) => {
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);

  // Difference in milliseconds
  const diffTime = checkoutDate.getTime() - checkinDate.getTime();

  // Convert to days
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // If same day or invalid diff, return 1
  return diffDays <= 0 ? 1 : Math.ceil(diffDays);
};
