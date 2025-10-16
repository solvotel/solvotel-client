export const CalculateDays = ({ checkin, checkout }) => {
  const checkinDate = new Date(checkin); // example check-in date
  const checkoutDate = new Date(checkout); // example check-out date

  // Calculate the difference in milliseconds
  const diffTime = checkoutDate - checkinDate;

  // Convert milliseconds to days
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays; // 3
};
