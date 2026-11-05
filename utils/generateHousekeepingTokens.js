const getHousekeepingTokenKey = (room, date) =>
  `${room}|${String(date).split('T')[0]}`;

const generateHousekeepingTokens = (roomTokens, existingTokens = []) => {
  const existingTokensByRoomAndDate = new Map(
    existingTokens.map((token) => [
      getHousekeepingTokenKey(token.room, token.date),
      token,
    ]),
  );

  return roomTokens.flatMap((roomToken) => {
    const startDate = new Date(`${roomToken.in_date}T00:00:00.000Z`);
    const endDate = new Date(`${roomToken.out_date}T00:00:00.000Z`);

    if (
      !roomToken.room ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      startDate >= endDate
    ) {
      throw new Error(
        `Invalid housekeeping date range for room ${roomToken.room || 'unknown'}.`,
      );
    }

    const housekeepingTokens = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
      const date = currentDate.toISOString().split('T')[0];
      const existingToken = existingTokensByRoomAndDate.get(
        getHousekeepingTokenKey(roomToken.room, date),
      );

      housekeepingTokens.push({
        ...roomToken,
        id: `${roomToken.room}-${date}`,
        date,
        status:
          existingToken?.status ??
          (date === String(roomToken.in_date).split('T')[0] ? 'clean' : 'dirty'),
        cleaned_by: existingToken?.cleaned_by ?? null,
        time_stamp: existingToken?.time_stamp ?? null,
        after_checkout: {
          status: 'dirty',
          cleaned_by: null,
          time_stamp: null,
          ...existingToken?.after_checkout,
        },
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return housekeepingTokens;
  });
};

export default generateHousekeepingTokens;
