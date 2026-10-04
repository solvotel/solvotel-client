'use client';
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

  // Fetch all bookings
  const bookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });
  const rooms = GetDataList({
    auth,
    endPoint: 'rooms',
  });

  const getBookingsForTokens = (bookingPredicate, tokenPredicate) =>
    bookings
      ?.filter(bookingPredicate)
      .map((bk) => ({
        ...bk,
        room_tokens: bk.room_tokens?.filter(tokenPredicate) || [],
      }))
      .filter((bk) => bk.room_tokens.length > 0);

  const stayOver = getBookingsForTokens(
    (bk) =>
      bk.booking_status !== 'Cancelled' &&
      bk.booking_status !== 'Blocked' &&
      bk.checked_out !== true,
    (token) =>
      token.in_date < todaysDate &&
      token.out_date > todaysDate &&
      token.checked_in === true &&
      token.checked_out !== true,
  );

  const expectedCheckin = getBookingsForTokens(
    (bk) =>
      bk.booking_status === 'Confirmed' &&
      bk.checked_out !== true,
    (token) =>
      token.in_date === todaysDate &&
      token.checked_in !== true &&
      token.checked_out !== true,
  );

  const expectedCheckout = getBookingsForTokens(
    (bk) =>
      bk.booking_status === 'Confirmed' &&
      bk.checked_out !== true,
    (token) =>
      token.out_date === todaysDate &&
      token.checked_in === true &&
      token.checked_out !== true,
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
      />
    </>
  );
};

export default Page;
