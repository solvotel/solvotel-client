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

const Page = () => {
  const { auth } = useAuth();
  const permissions = CheckUserPermission(auth?.user?.permissions);
  const todaysDate = GetTodaysDate().dateString;
  const today = new Date(todaysDate);
  const [selectedDate, setSelectedDate] = useState(today);

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

  const stayOver = bookings?.filter((bk) => {
    const checkIn = new Date(bk.checkin_date);
    const checkOut = new Date(bk.checkout_date);
    const isSameDay = checkIn.toDateString() === checkOut.toDateString();
    const isYesterdayCheckIn =
      checkIn.toDateString() === yesterday.toDateString();

    return (
      bk.checked_in === true &&
      bk.checked_out !== true &&
      isYesterdayCheckIn &&
      // Exclude same-day checkin/checkout from stayOver
      !isSameDay
    );
  });

  const expectedCheckin = bookings?.filter((bk) => {
    const checkIn = new Date(bk.checkin_date);
    return (
      bk.checked_in !== true &&
      bk.checked_out !== true &&
      checkIn.toDateString() === selectedDate.toDateString() &&
      bk.booking_status === 'Confirmed'
    );
  });

  const expectedCheckout = bookings?.filter((bk) => {
    const checkOut = new Date(bk.checkout_date);
    return (
      bk.checked_in === true &&
      bk.checked_out !== true &&
      checkOut.toDateString() === selectedDate.toDateString() &&
      bk.booking_status === 'Confirmed'
    );
  });

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
