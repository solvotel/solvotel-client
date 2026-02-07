'use client';

import { useAuth } from '@/context';
import HotelNav from './HotelNav';
import PosOutletNav from './PosOutletNav';

export default function Navbar() {
  const { auth, logout } = useAuth();

  return (
    <>
      {auth?.user?.role?.name === 'pos-user' ? (
        <>
          <PosOutletNav auth={auth} logout={logout} />
        </>
      ) : (
        <>
          <HotelNav auth={auth} logout={logout} />
        </>
      )}
    </>
  );
}
