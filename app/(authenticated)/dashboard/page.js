'use client';

import { useState } from 'react';

import { useAuth } from '@/context';
import { GetDataList } from '@/utils/ApiFunctions';
import { GetTodaysDate } from '@/utils/DateFetcher';

import {
  BookingList,
  OverviewStats,
  RoomGridLayout,
} from '@/component/dashboardComp';
import { Loader } from '@/component/common';
import { CheckUserPermission } from '@/utils/UserPermissions';
import dayjs from 'dayjs';

const Page = () => {
  const { auth } = useAuth();
  const permissions = CheckUserPermission(auth?.user?.permissions);
  const todaysDate = GetTodaysDate().dateString;
  const today = new Date(todaysDate);
  const [selectedDate, setSelectedDate] = useState(today);
  const selected = dayjs(selectedDate);

  // Fetch all bookings
  const bookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });
  const rooms = GetDataList({
    auth,
    endPoint: 'rooms',
  });

  // 🔹 Filter Logic
  const yesterday = new Date(selectedDate);
  yesterday.setDate(yesterday.getDate() - 1);

  const getBookingsForTokens = (bookingPredicate, tokenPredicate) =>
    bookings
      ?.filter(bookingPredicate)
      .map((bk) => ({
        ...bk,
        room_tokens: bk.room_tokens?.filter(tokenPredicate) || [],
      }))
      .filter((bk) => bk.room_tokens.length > 0);

  const stayOver = getBookingsForTokens(
    (bk) => bk.checked_in === true && bk.checked_out !== true,
    (token) =>
      !selected.isBefore(dayjs(token.in_date), 'day') &&
      selected.isBefore(dayjs(token.out_date), 'day'),
  );

  const expectedCheckin = getBookingsForTokens(
    (bk) =>
      bk.booking_status === 'Confirmed' &&
      bk.checked_in !== true &&
      bk.checked_out !== true,
    (token) => selected.isSame(dayjs(token.in_date), 'day'),
  );

  const expectedCheckout = getBookingsForTokens(
    (bk) => bk.checked_in === true && bk.checked_out !== true,
    (token) => selected.isSame(dayjs(token.out_date), 'day'),
  );

  if (!bookings || !rooms) {
    return <Loader />;
  }

  return (
    <>
      <OverviewStats bookings={bookings} rooms={rooms} />
      <RoomGridLayout
        bookings={bookings}
        rooms={rooms}
        permissions={permissions}
      />
      <BookingList
        expectedCheckin={expectedCheckin}
        expectedCheckout={expectedCheckout}
        stayOver={stayOver}
        selectedDate={selectedDate}
      />
    </>
  );
};

export default Page;
