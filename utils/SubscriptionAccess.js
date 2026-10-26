const getDateOnly = (value) => {
  if (!value) return null;

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  return date;
};

export const formatSubscriptionDate = (value) => {
  const date = getDateOnly(value);
  return date ? date.toLocaleDateString() : '';
};

export const evaluateSubscriptionAccess = (subscriptions = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validPlans = subscriptions
    .map((subscription) => ({
      subscription,
      start: getDateOnly(subscription?.start_date),
      expiry: getDateOnly(subscription?.expiry_date),
    }))
    .filter(({ start, expiry }) => start && expiry && start <= expiry);

  const activePlan = validPlans
    .filter(({ start, expiry }) => start <= today && today <= expiry)
    .sort((a, b) => b.expiry - a.expiry)[0];

  if (activePlan) {
    const daysUntilExpiry = Math.ceil(
      (activePlan.expiry - today) / (24 * 60 * 60 * 1000),
    );

    return {
      active: true,
      subscription: activePlan.subscription,
      daysUntilExpiry,
    };
  }

  const upcomingPlan = validPlans
    .filter(({ start }) => start > today)
    .sort((a, b) => a.start - b.start)[0];
  const expiredPlan = validPlans
    .filter(({ expiry }) => expiry < today)
    .sort((a, b) => b.expiry - a.expiry)[0];

  return {
    active: false,
    upcomingPlan: upcomingPlan?.subscription,
    expiredPlan: expiredPlan?.subscription,
  };
};
