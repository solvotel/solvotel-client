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

  const stayOver = bookings?.filter((bk) => {
    return (
      bk.checked_in === true &&
      bk.checked_out !== true &&
      selected.isAfter(dayjs(bk.checkin_date), 'day') &&
      selected.isBefore(dayjs(bk.checkout_date), 'day')
    );
  });

  const expectedCheckin = bookings?.filter((bk) => {
    return (
      bk.booking_status === 'Confirmed' &&
      bk.checked_in !== true &&
      bk.checked_out !== true &&
      selected.isSame(dayjs(bk.checkin_date), 'day')
    );
  });

  const expectedCheckout = bookings?.filter((bk) => {
    return (
      bk.checked_in === true &&
      bk.checked_out !== true &&
      selected.isSame(dayjs(bk.checkout_date), 'day')
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
