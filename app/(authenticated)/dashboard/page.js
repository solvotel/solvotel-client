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

const Page = () => {
  const { auth } = useAuth();
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
  const currentlyStaying = bookings?.filter((bk) => {
    const checkIn = new Date(bk.checkin_date);
    const checkOut = new Date(bk.checkout_date);
    return (
      bk.checked_in === true &&
      bk.checked_out !== true &&
      selectedDate >= checkIn &&
      selectedDate <= checkOut
    );
  });

  const expectedCheckin = bookings?.filter((bk) => {
    const checkIn = new Date(bk.checkin_date);
    return (
      bk.checked_in !== true &&
      bk.checked_out !== true &&
      checkIn.toDateString() === selectedDate.toDateString()
    );
  });

  const expectedCheckout = bookings?.filter((bk) => {
    const checkOut = new Date(bk.checkout_date);
    return (
      bk.checked_in === true &&
      bk.checked_out !== true &&
      checkOut.toDateString() === selectedDate.toDateString()
    );
  });

  const confirmedRooms = bookings?.filter((bk) => {
    const checkIn = new Date(bk.checkin_date);
    const checkOut = new Date(bk.checkout_date);
    return (
      bk.booking_status === 'Confirmed' && today >= checkIn && today <= checkOut
    );
  });
  const blockedRooms = bookings?.filter((bk) => {
    const checkIn = new Date(bk.checkin_date);
    const checkOut = new Date(bk.checkout_date);
    return (
      bk.booking_status === 'Blocked' && today >= checkIn && today <= checkOut
    );
  });

  const activeBookings = bookings?.filter((bk) => {
    const checkIn = new Date(bk.checkin_date);
    const checkOut = new Date(bk.checkout_date);

    return (
      bk.checked_in === true &&
      bk.checked_out !== true &&
      today >= checkIn &&
      today <= checkOut
    );
  });

  // Step 2: Flatten all rooms from those active bookings
  const activeRooms = activeBookings?.flatMap(
    (bk) =>
      bk.rooms?.map((room) => ({
        booking_id: bk.documentId,
        room_no: room.room_no,
      })) || []
  );

  // Step 3: Create a Set of occupied room numbers for quick lookup
  const occupiedRoomNos = new Set(activeRooms?.map((r) => r.room_no));

  // Step 4: Filter all rooms to find available ones
  const availableRooms = rooms?.filter(
    (room) => !occupiedRoomNos.has(room.room_no)
  );

  if (!bookings || !rooms) {
    return <Loader />;
  }

  return (
    <>
      <OverviewStats
        availableRooms={availableRooms}
        expectedCheckin={expectedCheckin}
        expectedCheckout={expectedCheckout}
        currentlyStaying={currentlyStaying}
        confirmedRooms={confirmedRooms}
        blockedRooms={blockedRooms}
      />
      <RoomGridLayout bookings={bookings} rooms={rooms} />
      <BookingList
        expectedCheckin={expectedCheckin}
        expectedCheckout={expectedCheckout}
        currentlyStaying={currentlyStaying}
        selectedDate={selectedDate}
      />
    </>
  );
};

export default Page;
